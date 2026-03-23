import { Request, Response } from "express";
import { db } from "../../infrastructure/database/drizzle.js";
import { eq, and } from "drizzle-orm";

import { documentVersions } from "../../infrastructure/database/schema/document_versions.schema.js";

import {
  createDocumentSchema,
  paginationSchema,
  revokePermissionSchema,
  shareDocumentSchema,
  updateDocumentSchema,
} from "./documents.validators.js";

import {
  canEditDocument,
  canShareDocument,
  canDeleteDocument,
  canUploadDocument,
  canProfessorUpload,
} from "./documents.domain.js";

import {
  createNewDocument,
  verifyProfessorCanUpload,
  queueDocumentUpload,
  shareDocument,
  getUserDocuments,
  getPermissionsForDocument,
  revokeDocumentPermission,
  getDocument,
  updateDocument,
  searchUserDocuments,
  getDocumentAuditLogs,
} from "./documents.service.js";

import {
  getDocumentVersions,
  softDeleteDocument,
} from "./documents.repository.js";
import { insertAuditLog } from "./documents.audit.repository.js";
import type { UserRole } from "../../infrastructure/database/schema/users.schema.js";

export async function createDocumentController(req: Request, res: Response) {
  const userRole = req.user!.role as UserRole;

  if (!canUploadDocument(userRole)) {
    return res
      .status(403)
      .json({ message: "No tienes permiso para crear documentos" });
  }

  const data = createDocumentSchema.parse(req.body);

  const documentId = await createNewDocument(
    data.title,
    req.user!.id,
    data.departmentId,
    data.description,
  );

  res.json({ documentId });
}

export async function uploadDocumentController(req: Request, res: Response) {
  const userRole = req.user!.role as UserRole;
  const documentId = Number(req.body.documentId);

  if (userRole === "professor") {
    const hasPermission = await verifyProfessorCanUpload(
      req.user!.id,
      documentId,
    );
    if (!canProfessorUpload(userRole, hasPermission)) {
      return res
        .status(403)
        .json({ message: "No tienes permiso para subir archivos" });
    }
  } else if (!canProfessorUpload(userRole, true)) {
    return res
      .status(403)
      .json({ message: "No tienes permiso para subir archivos" });
  }

  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "File required" });
  }

  await queueDocumentUpload({
    documentId,
    tmpPath: file.path,
    mimeType: file.mimetype,
    fileSize: file.size,
    uploadedBy: req.user!.id,
  });

  res.json({ message: "uploaded and queued" });
}

export async function updateDocumentController(req: Request, res: Response) {
  const userRole = req.user!.role as UserRole;

  if (!canEditDocument(userRole)) {
    return res
      .status(403)
      .json({ message: "No tienes permiso para editar documentos" });
  }

  const documentId = Number(req.params.documentId);
  const data = updateDocumentSchema.parse(req.body);

  await updateDocument(documentId, req.user!.id, data);

  res.json({ message: "document updated" });
}

export async function versionsController(req: Request, res: Response) {
  const versions = await getDocumentVersions(Number(req.params.documentId));
  res.json(versions);
}

export async function documentPermissionsController(
  req: Request,
  res: Response,
) {
  const documentId = Number(req.params.documentId);
  const permissions = await getPermissionsForDocument(documentId);
  res.json(permissions);
}

export async function listDocumentsController(req: Request, res: Response) {
  const { page, limit } = paginationSchema.parse(req.query);

  const result = await getUserDocuments(
    req.user!.id,
    req.user!.email,
    req.user!.role ?? "student",
    page,
    limit,
    req.user!.departmentId,
  );

  res.json(result);
}

export async function getDocumentController(req: Request, res: Response) {
  const documentId = Number(req.params.documentId);

  const document = await getDocument(documentId);

  if (!document) {
    return res.status(404).json({ message: "document not found" });
  }

  res.json(document);
}

export async function shareDocumentController(req: Request, res: Response) {
  const userRole = req.user!.role as UserRole;

  if (!canShareDocument(userRole)) {
    return res
      .status(403)
      .json({ message: "No tienes permiso para compartir documentos" });
  }

  const { documentId, departmentId, permission } = shareDocumentSchema.parse(
    req.body,
  );

  await shareDocument({
    documentId,
    departmentId,
    permission,
    grantedBy: req.user!.id,
  });

  res.json({ message: "shared" });
}

export async function revokePermissionController(req: Request, res: Response) {
  const documentId = Number(req.params.documentId);
  const { departmentId } = revokePermissionSchema.parse(req.body);

  await revokeDocumentPermission({
    documentId,
    departmentId,
    revokedBy: req.user!.id,
  });

  res.json({ message: "permission revoked" });
}

export async function downloadDocumentController(req: Request, res: Response) {
  const documentId = Number(req.params.documentId);
  const version = Number(req.params.version);

  const result = await db
    .select()
    .from(documentVersions)
    .where(
      and(
        eq(documentVersions.documentId, documentId),
        eq(documentVersions.version, version),
      ),
    );

  const file = result[0];

  if (!file) {
    return res.status(404).json({ message: "version not found" });
  }

  res.download(file.filePath);
}

export async function deleteDocumentController(req: Request, res: Response) {
  const userRole = req.user!.role as UserRole;

  if (!canDeleteDocument(userRole)) {
    return res
      .status(403)
      .json({ message: "No tienes permiso para eliminar documentos" });
  }

  const documentId = Number(req.params.documentId);

  await softDeleteDocument(documentId);

  await insertAuditLog({
    documentId,
    userId: req.user!.id,
    action: "document_deleted",
    metadata: {},
  });

  res.json({ message: "deleted" });
}

export async function searchDocumentsController(req: Request, res: Response) {
  const query = String(req.query.q || "");
  const results = await searchUserDocuments(
    req.user!.id,
    query,
    req.user!.role ?? "student",
    req.user!.departmentId,
  );
  res.json(results);
}

export async function getAuditLogsController(req: Request, res: Response) {
  const documentId = Number(req.params.documentId);
  const logs = await getDocumentAuditLogs(documentId);
  res.json(logs);
}
