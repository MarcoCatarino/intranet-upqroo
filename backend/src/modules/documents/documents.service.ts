import fs from "node:fs/promises";
import path from "node:path";
import { db } from "../../infrastructure/database/drizzle.js";
import { eq, sql } from "drizzle-orm";

import { documentVersions } from "../../infrastructure/database/schema/document_versions.schema.js";
import { documents } from "../../infrastructure/database/schema/documents.schema.js";

import {
  countUserDocuments,
  createDocument,
  getDocumentById,
  getDocumentPermissions,
  grantUserPermission,
  listDocuments,
  revokePermission,
  searchDocuments,
  updateDocumentMetadata,
  hasProfessorUploadPermission,
  hasEmployeeUploadPermission,
  getDocumentVersionPaths,
  softDeleteDocument,
} from "./documents.repository.js";

import { resolveStudentDepartment } from "../students/students.service.js";

import {
  ensureDocumentFolder,
  getDocumentFolder,
  getDocumentVersionPath,
} from "../../infrastructure/storage/store.service.js";

import { documentQueue } from "../../infrastructure/queues/document.queue.js";

import {
  insertAuditLog,
  getAuditLogsForDocument,
} from "./documents.audit.repository.js";
import { calculateFileHash } from "../../infrastructure/storage/hash.service.js";

import { env } from "../../config/env.js";

export async function createNewDocument(
  title: string,
  userId: string,
  departmentId: number,
  description?: string,
) {
  const documentId = await createDocument({
    title,
    description,
    ownerId: userId,
    departmentId,
  });

  await insertAuditLog({
    documentId,
    userId,
    action: "document_created",
    metadata: { title, departmentId },
  });

  return documentId;
}

export async function verifyProfessorCanUpload(
  professorId: string,
  documentId: number,
): Promise<boolean> {
  const doc = await getDocumentById(documentId);
  if (!doc) return false;
  return hasProfessorUploadPermission(professorId, doc.departmentId);
}

export async function verifyEmployeeCanUpload(
  employeeId: string,
  documentId: number,
): Promise<boolean> {
  const doc = await getDocumentById(documentId);
  if (!doc) return false;
  return hasEmployeeUploadPermission(employeeId, doc.departmentId);
}

export async function queueDocumentUpload(data: {
  documentId: number;
  tmpPath: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: string;
}) {
  await insertAuditLog({
    documentId: data.documentId,
    userId: data.uploadedBy,
    action: "document_uploaded",
    metadata: {
      mimeType: data.mimeType,
      fileSize: data.fileSize,
    },
  });

  await documentQueue.add(
    "process-document",
    {
      documentId: data.documentId,
      tmpPath: data.tmpPath,
      mimeType: data.mimeType,
      size: data.fileSize,
      uploadedBy: data.uploadedBy,
    },
    {
      jobId: `document-upload-${data.documentId}-${Date.now()}`,
    },
  );
}

export async function storeDocumentFile(data: {
  documentId: number;
  tmpPath: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: string;
}) {
  await ensureDocumentFolder(data.documentId);

  const fileHash = await calculateFileHash(data.tmpPath);

  let finalPath: string | null = null;
  let dbSucceeded = false;

  try {
    await db.transaction(async (tx) => {
      const result = await tx
        .select({
          maxVersion: sql<number>`MAX(${documentVersions.version})`,
          versionCount: sql<number>`COUNT(${documentVersions.id})`,
        })
        .from(documentVersions)
        .where(eq(documentVersions.documentId, data.documentId))
        .for("update");

      const currentCount = result[0]?.versionCount ?? 0;
      const maxVersions = env.DOCUMENTS.MAX_VERSIONS;

      if (currentCount >= maxVersions) {
        throw new Error(
          `Document has reached the maximum of ${maxVersions} versions`,
        );
      }

      const nextVersion = (result[0]?.maxVersion ?? 0) + 1;
      const ext = path.extname(data.tmpPath);

      finalPath = getDocumentVersionPath(data.documentId, nextVersion, ext);

      await tx.insert(documentVersions).values({
        documentId: data.documentId,
        version: nextVersion,
        filePath: finalPath,
        mimeType: data.mimeType,
        fileSize: data.fileSize,
        fileHash,
        uploadedBy: data.uploadedBy,
      });

      await tx
        .update(documents)
        .set({ currentVersion: nextVersion })
        .where(eq(documents.id, data.documentId));
    });

    dbSucceeded = true;

    await fs.copyFile(data.tmpPath, finalPath!);
  } catch (err) {
    if (dbSucceeded && finalPath) {
      await fs.unlink(finalPath).catch(() => null);
    }
    throw err;
  } finally {
    await fs.unlink(data.tmpPath).catch(() => null);
  }
}

export async function updateDocument(
  documentId: number,
  userId: string,
  data: {
    title?: string;
    departmentId?: number;
    description?: string;
  },
) {
  await updateDocumentMetadata(documentId, data);

  await insertAuditLog({
    documentId,
    userId,
    action: "document_updated",
    metadata: { ...data },
  });
}

export async function getPermissionsForDocument(documentId: number) {
  const permissions = await getDocumentPermissions(documentId);

  const users = permissions
    .filter((p) => p.userId)
    .map((p) => ({
      userId: p.userId,
      permission: p.permission,
      targetAudience: p.targetAudience,
    }));

  const departments = permissions
    .filter((p) => p.departmentId)
    .map((p) => ({
      departmentId: p.departmentId,
      permission: p.permission,
      targetAudience: p.targetAudience,
    }));

  return { users, departments };
}

export async function getDocument(documentId: number) {
  return getDocumentById(documentId);
}

export async function shareDocument(data: {
  documentId: number;
  departmentId?: number;
  userId?: string;
  permission: string;
  grantedBy: string;
  targetAudience?: "all" | "professors" | "students";
}) {
  await grantUserPermission({
    documentId: data.documentId,
    userId: data.userId,
    departmentId: data.departmentId,
    permission: data.permission,
    grantedBy: data.grantedBy,
    targetAudience: data.userId ? "all" : (data.targetAudience ?? "all"),
  });
}

export async function revokeDocumentPermission(data: {
  documentId: number;
  departmentId?: number;
  userId?: string;
  revokedBy: string;
}) {
  await revokePermission({
    documentId: data.documentId,
    userId: data.userId,
    departmentId: data.departmentId,
  });
}

export async function getUserDocuments(
  userId: string,
  userEmail: string,
  userRole: string,
  page: number,
  limit: number,
  jwtDepartmentId?: number,
) {
  let studentDepartmentId = jwtDepartmentId;

  if (userRole === "student") {
    const matricula = userEmail.split("@")[0];
    const freshDepartmentId = await resolveStudentDepartment(matricula);
    studentDepartmentId = freshDepartmentId ?? undefined;
  }

  const [data, total] = await Promise.all([
    listDocuments(userId, userRole, page, limit, studentDepartmentId),
    countUserDocuments(userId, userRole, studentDepartmentId),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function searchUserDocuments(
  userId: string,
  query: string,
  userRole: string,
  studentDepartmentId?: number,
) {
  if (!query || query.length < 2) {
    return [];
  }

  return searchDocuments(userId, query, userRole, studentDepartmentId);
}

export async function getDocumentAuditLogs(documentId: number) {
  return getAuditLogsForDocument(documentId);
}

export async function deleteDocumentWithFiles(
  documentId: number,
  userId: string,
): Promise<void> {
  const filePaths = await getDocumentVersionPaths(documentId);

  await softDeleteDocument(documentId);

  await insertAuditLog({
    documentId,
    userId,
    action: "document_deleted",
    metadata: { filesRemoved: filePaths.length },
  });

  for (const filePath of filePaths) {
    await fs.unlink(filePath).catch((err) => {
      console.error(`Failed to delete file ${filePath}:`, err);
    });
  }

  const folder = getDocumentFolder(documentId);
  await fs.rmdir(folder).catch(() => null);
}
