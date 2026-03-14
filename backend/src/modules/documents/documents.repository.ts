import { db } from "../../infrastructure/database/drizzle.js";
import { or, eq, and } from "drizzle-orm";

import { documents } from "../../infrastructure/database/schema/documents.schema.js";
import { documentVersions } from "../../infrastructure/database/schema/document_versions.schema.js";
import { documentPermissions } from "../../infrastructure/database/schema/document_permissions.schema.js";
import { departmentUsers } from "../../infrastructure/database/schema/departments_users.schema.js";

export async function grantUserPermission(data: {
  documentId: number;
  userId: string;
  permission: string;
  grantedBy: string;
}) {
  await db.insert(documentPermissions).values({
    documentId: data.documentId,
    userId: data.userId,
    permission: data.permission,
    grantedBy: data.grantedBy,
  });
}

export async function userHasDocumentAccess(
  userId: string,
  documentId: number,
) {
  const result = await db
    .select()
    .from(documents)

    .leftJoin(
      documentPermissions,
      eq(documentPermissions.documentId, documents.id),
    )

    .leftJoin(
      departmentUsers,
      eq(departmentUsers.departmentId, documentPermissions.departmentId),
    )

    .where(
      and(
        eq(documents.id, documentId),

        or(
          eq(documents.ownerId, userId),

          eq(documentPermissions.userId, userId),

          and(eq(departmentUsers.userId, userId)),
        ),
      ),
    );

  return result.length > 0;
}

export async function getDocumentVersions(documentId: number) {
  return db
    .select()
    .from(documentVersions)
    .where(eq(documentVersions.documentId, documentId));
}

export async function createDocument(data: {
  title: string;
  ownerId: string;
  departmentId: number;
}) {
  const result = await db
    .insert(documents)
    .values({
      title: data.title,
      ownerId: data.ownerId,
      departmentId: data.departmentId,
    })
    .$returningId();

  return result[0].id;
}

export async function createDocumentVersion(data: {
  documentId: number;
  version: number;
  filePath: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: string;
}) {
  await db.insert(documentVersions).values({
    documentId: data.documentId,
    version: data.version,
    filePath: data.filePath,
    mimeType: data.mimeType,
    fileSize: data.fileSize,
    uploadedBy: data.uploadedBy,
  });
}

export async function listDocuments(userId: string) {
  return db.select().from(documents).where(eq(documents.ownerId, userId));
}

export async function softDeleteDocument(documentId: number) {
  await db
    .update(documents)
    .set({
      deletedAt: new Date(),
    })
    .where(eq(documents.id, documentId));
}
