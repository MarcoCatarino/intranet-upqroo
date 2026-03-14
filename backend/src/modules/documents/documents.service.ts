import fs from "node:fs/promises";
import path from "node:path";
import { db } from "../../infrastructure/database/drizzle.js";
import { eq, sql } from "drizzle-orm";

import { documentVersions } from "../../infrastructure/database/schema/document_versions.schema.js";

import {
  createDocument,
  createDocumentVersion,
  grantUserPermission,
  listDocuments,
} from "./documents.repository.js";

import {
  ensureDocumentFolder,
  getDocumentVersionPath,
} from "../../infrastructure/storage/store.service.js";

export async function createNewDocument(
  title: string,
  userId: string,
  departmentId: number,
) {
  const documentId = await createDocument({
    title,
    ownerId: userId,
    departmentId,
  });

  return documentId;
}

export async function storeDocumentFile(data: {
  documentId: number;
  tmpPath: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: string;
}) {
  await ensureDocumentFolder(data.documentId);

  const result = await db
    .select({
      maxVersion: sql<number>`MAX(${documentVersions.version})`,
    })
    .from(documentVersions)
    .where(eq(documentVersions.documentId, data.documentId));

  const nextVersion = (result[0]?.maxVersion ?? 0) + 1;

  const ext = path.extname(data.tmpPath);

  const finalPath = getDocumentVersionPath(data.documentId, nextVersion, ext);

  await fs.rename(data.tmpPath, finalPath);

  await createDocumentVersion({
    documentId: data.documentId,
    version: nextVersion,
    filePath: finalPath,
    mimeType: data.mimeType,
    fileSize: data.fileSize,
    uploadedBy: data.uploadedBy,
  });
}

export async function shareDocument(data: {
  documentId: number;
  userId: string;
  role: "viewer" | "editor";
  grantedBy: string;
}) {
  await grantUserPermission({
    documentId: data.documentId,
    userId: data.userId,
    permission: data.role,
    grantedBy: data.grantedBy,
  });
}

export async function getUserDocuments(userId: string) {
  return listDocuments(userId);
}
