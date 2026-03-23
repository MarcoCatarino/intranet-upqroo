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
} from "./documents.repository.js";

import {
  ensureDocumentFolder,
  getDocumentVersionPath,
} from "../../infrastructure/storage/store.service.js";

import { documentQueue } from "../../infrastructure/queues/document.queue.js";

import {
  insertAuditLog,
  getAuditLogsForDocument,
} from "./documents.audit.repository.js";
import { env } from "../../config/env.js";
import { calculateFileHash } from "../../infrastructure/storage/hash.service.js";

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
      await fs.unlink(data.tmpPath).catch(() => null);

      throw new Error(
        `Document has reached the maximum of ${maxVersions} versions`,
      );
    }

    const nextVersion = (result[0]?.maxVersion ?? 0) + 1;

    const ext = path.extname(data.tmpPath);

    const finalPath = getDocumentVersionPath(data.documentId, nextVersion, ext);

    await fs.rename(data.tmpPath, finalPath);

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

  await fs.unlink(data.tmpPath).catch(() => null);
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
    }));

  const departments = permissions
    .filter((p) => p.departmentId)
    .map((p) => ({
      departmentId: p.departmentId,
      permission: p.permission,
    }));

  return { users, departments };
}

export async function getDocument(documentId: number) {
  return getDocumentById(documentId);
}

export async function shareDocument(data: {
  documentId: number;
  departmentId: number;
  permission: string;
  grantedBy: string;
}) {
  await grantUserPermission({
    documentId: data.documentId,
    userId: undefined,
    departmentId: data.departmentId,
    permission: data.permission,
    grantedBy: data.grantedBy,
  });
}

export async function revokeDocumentPermission(data: {
  documentId: number;
  departmentId: number;
  revokedBy: string;
}) {
  await revokePermission({
    documentId: data.documentId,
    userId: undefined,
    departmentId: data.departmentId,
  });
}

export async function getUserDocuments(
  userId: string,
  userRole: string,
  page: number,
  limit: number,
  studentDepartmentId?: number,
) {
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

export async function searchUserDocuments(userId: string, query: string) {
  if (!query || query.length < 2) {
    return [];
  }

  return searchDocuments(userId, query);
}

export async function getDocumentAuditLogs(documentId: number) {
  return getAuditLogsForDocument(documentId);
}
