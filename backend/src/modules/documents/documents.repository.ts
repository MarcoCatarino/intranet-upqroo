import { db } from "../../infrastructure/database/drizzle.js";
import { or, eq, and, isNull, sql } from "drizzle-orm";

import { documents } from "../../infrastructure/database/schema/documents.schema.js";
import { professorUploadPermissions } from "../../infrastructure/database/schema/professor_upload_permissions.schema.js";
import { documentVersions } from "../../infrastructure/database/schema/document_versions.schema.js";
import { documentPermissions } from "../../infrastructure/database/schema/document_permissions.schema.js";
import { departmentUsers } from "../../infrastructure/database/schema/departments_users.schema.js";

export async function grantUserPermission(data: {
  documentId: number;
  userId?: string;
  departmentId?: number;
  permission: string;
  grantedBy: string;
}) {
  await db.insert(documentPermissions).values({
    documentId: data.documentId,
    userId: data.userId ?? null,
    departmentId: data.departmentId ?? null,
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
        isNull(documents.deletedAt),
        or(
          eq(documents.ownerId, userId),
          eq(documentPermissions.userId, userId),
          and(
            eq(documentPermissions.departmentId, departmentUsers.departmentId),
            eq(departmentUsers.userId, userId),
          ),
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

export async function getDocumentPermissions(documentId: number) {
  return db
    .select()
    .from(documentPermissions)
    .where(eq(documentPermissions.documentId, documentId));
}

export async function createDocument(data: {
  title: string;
  description?: string;
  ownerId: string;
  departmentId: number;
}) {
  const result = await db
    .insert(documents)
    .values({
      title: data.title,
      description: data.description ?? null,
      ownerId: data.ownerId,
      departmentId: data.departmentId,
    })
    .$returningId();

  return result[0].id;
}

const documentWithMimeType = {
  id: documents.id,
  title: documents.title,
  description: documents.description,
  ownerId: documents.ownerId,
  departmentId: documents.departmentId,
  currentVersion: documents.currentVersion,
  createdAt: documents.createdAt,
  deletedAt: documents.deletedAt,
  mimeType: sql<string | null>`(
    SELECT mime_type
    FROM document_versions
    WHERE document_id = ${documents.id}
      AND version = ${documents.currentVersion}
    LIMIT 1
  )`.as("mimeType"),
};

export async function listDocuments(
  userId: string,
  userRole: string,
  page: number,
  limit: number,
  studentDepartmentId?: number,
) {
  const offset = (page - 1) * limit;

  if (userRole === "admin") {
    return db
      .selectDistinct(documentWithMimeType)
      .from(documents)
      .where(isNull(documents.deletedAt))
      .limit(limit)
      .offset(offset);
  }

  if (userRole === "student") {
    if (!studentDepartmentId) return [];

    return db
      .selectDistinct(documentWithMimeType)
      .from(documents)
      .innerJoin(
        documentPermissions,
        eq(documentPermissions.documentId, documents.id),
      )
      .where(
        and(
          isNull(documents.deletedAt),
          eq(documentPermissions.departmentId, studentDepartmentId),
        ),
      )
      .limit(limit)
      .offset(offset);
  }

  return db
    .selectDistinct(documentWithMimeType)
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
        isNull(documents.deletedAt),
        or(
          eq(documents.ownerId, userId),
          eq(documentPermissions.userId, userId),
          and(
            eq(departmentUsers.userId, userId),
            eq(documentPermissions.departmentId, departmentUsers.departmentId),
          ),
          userRole === "secretary"
            ? sql`documents.department_id IN (
                SELECT id FROM departments
                WHERE parent_id IN (
                  SELECT department_id FROM department_users
                  WHERE user_id = ${userId}
                )
                OR id IN (
                  SELECT department_id FROM department_users
                  WHERE user_id = ${userId}
                )
              )`
            : sql`FALSE`,
        ),
      ),
    )
    .limit(limit)
    .offset(offset);
}

export async function updateDocumentMetadata(
  documentId: number,
  data: {
    title?: string;
    departmentId?: number;
    description?: string;
  },
) {
  await db
    .update(documents)
    .set({ ...data })
    .where(eq(documents.id, documentId));
}

export async function getDocumentById(documentId: number) {
  const result = await db
    .select(documentWithMimeType)
    .from(documents)
    .where(and(eq(documents.id, documentId), isNull(documents.deletedAt)));

  return result[0];
}

export async function softDeleteDocument(documentId: number) {
  await db
    .update(documents)
    .set({ deletedAt: new Date() })
    .where(eq(documents.id, documentId));
}

export async function revokePermission(data: {
  documentId: number;
  userId?: string;
  departmentId?: number;
}) {
  await db
    .delete(documentPermissions)
    .where(
      and(
        eq(documentPermissions.documentId, data.documentId),
        or(
          data.userId ? eq(documentPermissions.userId, data.userId) : undefined,
          data.departmentId
            ? eq(documentPermissions.departmentId, data.departmentId)
            : undefined,
        ),
      ),
    );
}

export async function searchDocuments(
  userId: string,
  query: string,
  userRole: string,
  studentDepartmentId?: number,
) {
  const safeLike = `%${query.replace(/[%_\\]/g, "\\$&")}%`;

  const result = await db.execute(sql`
    SELECT DISTINCT
      d.id,
      d.title,
      d.description,
      d.owner_id        AS ownerId,
      d.department_id   AS departmentId,
      d.current_version AS currentVersion,
      d.created_at      AS createdAt,
      d.deleted_at      AS deletedAt,
      (
        SELECT mime_type
        FROM document_versions
        WHERE document_id = d.id
          AND version = d.current_version
        LIMIT 1
      ) AS mimeType,
      (
        CASE
          WHEN MATCH(d.title, d.description)
               AGAINST (${query} IN NATURAL LANGUAGE MODE)
          THEN MATCH(d.title, d.description)
               AGAINST (${query} IN NATURAL LANGUAGE MODE) * 2
          ELSE 0
        END
        +
        CASE
          WHEN d.title LIKE ${safeLike} THEN 1.5
          ELSE 0
        END
        +
        CASE
          WHEN d.description LIKE ${safeLike} THEN 0.5
          ELSE 0
        END
      ) AS score

    FROM documents d

    LEFT JOIN document_permissions dp
      ON dp.document_id = d.id

    LEFT JOIN department_users du
      ON du.department_id = dp.department_id

    WHERE
      d.deleted_at IS NULL
      AND (
        ${
          userRole === "student"
            ? studentDepartmentId != null
              ? sql`dp.department_id = ${studentDepartmentId}`
              : sql`FALSE`
            : sql`(
                d.owner_id = ${userId}
                OR dp.user_id = ${userId}
                OR du.user_id = ${userId}
              )`
        }
      )
      AND (
        d.title LIKE ${safeLike}
        OR d.description LIKE ${safeLike}
        OR MATCH(d.title, d.description)
           AGAINST (${query} IN NATURAL LANGUAGE MODE)
      )

    ORDER BY score DESC

    LIMIT 20
  `);

  return result[0];
}

export async function countUserDocuments(
  userId: string,
  userRole: string,
  studentDepartmentId?: number,
): Promise<number> {
  if (userRole === "admin") {
    const result = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(documents)
      .where(isNull(documents.deletedAt));

    return result[0]?.count ?? 0;
  }

  if (userRole === "student") {
    if (!studentDepartmentId) return 0;

    const result = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${documents.id})` })
      .from(documents)
      .innerJoin(
        documentPermissions,
        eq(documentPermissions.documentId, documents.id),
      )
      .where(
        and(
          isNull(documents.deletedAt),
          eq(documentPermissions.departmentId, studentDepartmentId),
        ),
      );

    return result[0]?.count ?? 0;
  }

  const result = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${documents.id})` })
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
        isNull(documents.deletedAt),
        or(
          eq(documents.ownerId, userId),
          eq(documentPermissions.userId, userId),
          and(
            eq(departmentUsers.userId, userId),
            eq(documentPermissions.departmentId, departmentUsers.departmentId),
          ),
          userRole === "secretary"
            ? sql`documents.department_id IN (
                SELECT id FROM departments
                WHERE parent_id IN (
                  SELECT department_id FROM department_users
                  WHERE user_id = ${userId}
                )
                OR id IN (
                  SELECT department_id FROM department_users
                  WHERE user_id = ${userId}
                )
              )`
            : sql`FALSE`,
        ),
      ),
    );

  return result[0]?.count ?? 0;
}

export async function hasProfessorUploadPermission(
  professorId: string,
  departmentId: number,
): Promise<boolean> {
  const result = await db
    .select({ professorId: professorUploadPermissions.professorId })
    .from(professorUploadPermissions)
    .where(
      and(
        eq(professorUploadPermissions.professorId, professorId),
        eq(professorUploadPermissions.departmentId, departmentId),
      ),
    )
    .limit(1);

  return result.length > 0;
}

export async function getDocumentVersionPaths(
  documentId: number,
): Promise<string[]> {
  const result = await db
    .select({ filePath: documentVersions.filePath })
    .from(documentVersions)
    .where(eq(documentVersions.documentId, documentId));

  return result.map((r) => r.filePath);
}
