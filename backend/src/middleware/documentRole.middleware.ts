import { Request, Response, NextFunction } from "express";
import { db } from "../infrastructure/database/drizzle.js";
import { eq, and, or, isNull } from "drizzle-orm";
import { documents } from "../infrastructure/database/schema/documents.schema.js";
import { documentPermissions } from "../infrastructure/database/schema/document_permissions.schema.js";
import { departmentUsers } from "../infrastructure/database/schema/departments_users.schema.js";
import { directorSharePermissions } from "../infrastructure/database/schema/director_share_permissions.schema.js";
import { professorUploadPermissions } from "../infrastructure/database/schema/professor_upload_permissions.schema.js";

export function documentRoleMiddleware(requiredPermission: string) {
  return async function (req: Request, res: Response, next: NextFunction) {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const documentId =
      Number(req.params.documentId) || Number(req.body.documentId);

    if (!documentId) {
      return res.status(400).json({ message: "Document id required" });
    }

    // ── Admin: acceso total ──────────────────────────────────────────────────
    if (userRole === "admin") {
      return next();
    }

    // ── Verificar que el documento existe y no está eliminado ────────────────
    const docResult = await db
      .select({
        id: documents.id,
        ownerId: documents.ownerId,
        departmentId: documents.departmentId,
      })
      .from(documents)
      .where(and(eq(documents.id, documentId), isNull(documents.deletedAt)))
      .limit(1);

    if (docResult.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    const doc = docResult[0];

    // ── Owner: acceso total sobre su propio documento ────────────────────────
    if (doc.ownerId === userId) {
      return next();
    }

    // ── Verificación de permiso de subida para profesores ────────────────────
    // Un profesor solo puede subir si el director le habilitó el permiso
    // explícitamente en professor_upload_permissions para el departamento
    // al que pertenece el documento.
    if (requiredPermission === "upload_version" && userRole === "professor") {
      const uploadPerm = await db
        .select({ professorId: professorUploadPermissions.professorId })
        .from(professorUploadPermissions)
        .where(
          and(
            eq(professorUploadPermissions.professorId, userId!),
            eq(professorUploadPermissions.departmentId, doc.departmentId),
          ),
        )
        .limit(1);

      if (uploadPerm.length > 0) return next();

      return res.status(403).json({
        message: "No tienes permiso de subida en este departamento",
      });
    }

    // ── Verificación de permiso directo por userId ───────────────────────────
    const userDirectPermission = await db
      .select({ id: documentPermissions.id })
      .from(documentPermissions)
      .where(
        and(
          eq(documentPermissions.documentId, documentId),
          eq(documentPermissions.userId, userId!),
          eq(documentPermissions.permission, requiredPermission),
        ),
      )
      .limit(1);

    if (userDirectPermission.length > 0) {
      return next();
    }

    // ── Verificación de permiso por departamento ─────────────────────────────
    const userDeptResult = await db
      .select({ departmentId: departmentUsers.departmentId })
      .from(departmentUsers)
      .where(eq(departmentUsers.userId, userId!))
      .limit(1);

    const userDepartmentId = userDeptResult[0]?.departmentId;

    if (userDepartmentId) {
      const deptPermission = await db
        .select({ id: documentPermissions.id })
        .from(documentPermissions)
        .where(
          and(
            eq(documentPermissions.documentId, documentId),
            eq(documentPermissions.departmentId, userDepartmentId),
            eq(documentPermissions.permission, requiredPermission),
          ),
        )
        .limit(1);

      if (deptPermission.length > 0) {
        return next();
      }
    }

    // ── Verificación adicional para "share" en directores ────────────────────
    if (requiredPermission === "share" && userRole === "director") {
      if (!userDepartmentId) {
        return res.status(403).json({
          message: "Director sin departamento asignado",
        });
      }

      const sharePermResult = await db
        .select({ id: directorSharePermissions.directorId })
        .from(directorSharePermissions)
        .where(
          and(
            eq(directorSharePermissions.directorId, userId!),
            eq(directorSharePermissions.departmentId, userDepartmentId),
          ),
        )
        .limit(1);

      if (sharePermResult.length > 0) {
        return next();
      }

      return res.status(403).json({
        message: "No tienes permiso para compartir documentos",
      });
    }

    // ── Sin ningún permiso válido ────────────────────────────────────────────
    return res.status(403).json({ message: "Permission denied" });
  };
}
