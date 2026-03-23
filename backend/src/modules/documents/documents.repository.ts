import { db } from "../../infrastructure/database/drizzle.js";
import { or, eq, and, isNull, sql } from "drizzle-orm";

import { documents } from "../../infrastructure/database/schema/documents.schema.js";
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

export async function listDocuments(
  userId: string,
  userRole: string,
  page: number,
  limit: number,
) {
  const offset = (page - 1) * limit;

  // Admin ve todo
  if (userRole === "admin") {
    return db
      .selectDistinct()
      .from(documents)
      .where(isNull(documents.deletedAt))
      .limit(limit)
      .offset(offset);
  }

  // Secretary ve todos los documentos de su secretaría y sus departamentos hijos
  // Director ve solo su departamento
  // Professor y student ven solo lo que les comparten
  return db
    .selectDistinct()
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
  },
) {
  await db
    .update(documents)
    .set({
      ...data,
    })
    .where(eq(documents.id, documentId));
}

export async function getDocumentById(documentId: number) {
  const result = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, documentId), isNull(documents.deletedAt)));

  return result[0];
}

export async function softDeleteDocument(documentId: number) {
  await db
    .update(documents)
    .set({
      deletedAt: new Date(),
    })
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

export async function searchDocuments(userId: string, query: string) {
  const safeLike = `%${query.replace(/[%_\\]/g, "\\$&")}%`;

  const result = await db.execute(sql`
    SELECT DISTINCT
      d.id,
      d.title,
      d.description,
      d.owner_id,
      d.department_id,
      d.current_version,
      d.created_at,

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
        d.owner_id = ${userId}
        OR dp.user_id = ${userId}
        OR du.user_id = ${userId}
      )
      AND (
        -- Coincidencia parcial por LIKE
        d.title LIKE ${safeLike}
        OR d.description LIKE ${safeLike}
        -- Coincidencia semántica por FULLTEXT
        OR MATCH(d.title, d.description)
           AGAINST (${query} IN NATURAL LANGUAGE MODE)
      )

    ORDER BY score DESC

    LIMIT 20
  `);

  return result[0];
}

export async function countUserDocuments(userId: string, userRole: string) {
  if (userRole === "admin") {
    const result = await db
      .select({ id: documents.id })
      .from(documents)
      .where(isNull(documents.deletedAt));

    return result.length;
  }

  const result = await db
    .selectDistinct({ id: documents.id })
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

  return result.length;
}
