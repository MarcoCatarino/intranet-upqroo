import { Request, Response, NextFunction } from "express";
import { db } from "../infrastructure/database/drizzle.js";
import { eq, and, or, isNull } from "drizzle-orm";
import { documents } from "../infrastructure/database/schema/documents.schema.js";
import { documentPermissions } from "../infrastructure/database/schema/document_permissions.schema.js";
import { departmentUsers } from "../infrastructure/database/schema/departments_users.schema.js";
import { directorSharePermissions } from "../infrastructure/database/schema/director_share_permissions.schema.js";

export function documentRoleMiddleware(requiredPermission: string) {
  return async function (req: Request, res: Response, next: NextFunction) {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const documentId =
      Number(req.params.documentId) || Number(req.body.documentId);

    if (!documentId) {
      return res.status(400).json({ message: "Document id required" });
    }

    if (requiredPermission === "share" && userRole === "director") {
      const deptResult = await db
        .select({ departmentId: departmentUsers.departmentId })
        .from(departmentUsers)
        .where(eq(departmentUsers.userId, userId!))
        .limit(1);

      const directorDeptId = deptResult[0]?.departmentId;

      if (!directorDeptId) {
        return res.status(403).json({
          message: "Director sin departamento asignado",
        });
      }

      const sharePermResult = await db
        .select()
        .from(directorSharePermissions)
        .where(
          and(
            eq(directorSharePermissions.directorId, userId!),
            eq(directorSharePermissions.departmentId, directorDeptId),
          ),
        )
        .limit(1);

      if (sharePermResult.length === 0) {
        return res.status(403).json({
          message: "No tienes permiso para compartir documentos",
        });
      }
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
      return res.status(403).json({ message: "Permission denied" });
    }

    next();
  };
}
