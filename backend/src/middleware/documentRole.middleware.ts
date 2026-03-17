import { Request, Response, NextFunction } from "express";
import { db } from "../infrastructure/database/drizzle.js";
import { eq, and, or, isNull } from "drizzle-orm";
import { documents } from "../infrastructure/database/schema/documents.schema.js";
import { documentPermissions } from "../infrastructure/database/schema/document_permissions.schema.js";
import { departmentUsers } from "../infrastructure/database/schema/departments_users.schema.js";

export function documentRoleMiddleware(requiredPermission: string) {
  return async function (req: Request, res: Response, next: NextFunction) {
    const userId = req.user?.id;
    const documentId =
      Number(req.params.documentId) || Number(req.body.documentId);

    if (!documentId) {
      return res.status(400).json({
        message: "Document id required",
      });
    }

    const result = await db
      .select()
      .from(documents)
      .leftJoin(
        documentPermissions,
        eq(documentPermissions.documentId, documents.id),
      )
      .leftJoin(departmentUsers, eq(departmentUsers.userId, userId!))
      .where(
        and(
          eq(documents.id, documentId),
          isNull(documents.deletedAt),
          or(
            eq(documents.ownerId, userId!),

            and(
              eq(documentPermissions.userId, userId!),
              eq(documentPermissions.permission, requiredPermission),
            ),

            and(
              eq(
                documentPermissions.departmentId,
                departmentUsers.departmentId,
              ),
              eq(documentPermissions.permission, requiredPermission),
            ),
          ),
        ),
      );

    if (result.length === 0) {
      return res.status(403).json({
        message: "Permission denied",
      });
    }

    next();
  };
}
