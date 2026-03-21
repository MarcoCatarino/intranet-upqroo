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
  createNewDocument,
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

export async function createDocumentController(req: Request, res: Response) {
  const data = createDocumentSchema.parse(req.body);

  const documentId = await createNewDocument(
    data.title,
    req.user!.id,
    data.departmentId,
    data.description,
  );

  res.json({
    documentId,
  });
}

export async function uploadDocumentController(req: Request, res: Response) {
  const file = req.file;

  if (!file) {
    return res.status(400).json({
      message: "File required",
    });
  }

  const documentId = Number(req.body.documentId);

  await queueDocumentUpload({
    documentId,
    tmpPath: file.path,
    mimeType: file.mimetype,
    fileSize: file.size,
    uploadedBy: req.user!.id,
  });

  res.json({
    message: "uploaded and queued",
  });
}

export async function updateDocumentController(req: Request, res: Response) {
  const documentId = Number(req.params.documentId);

  const data = updateDocumentSchema.parse(req.body);

  await updateDocument(documentId, req.user!.id, data);

  res.json({
    message: "document updated",
  });
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
    req.user!.role ?? "student",
    page,
    limit,
  );

  res.json(result);
}

export async function getDocumentController(req: Request, res: Response) {
  const documentId = Number(req.params.documentId);

  const document = await getDocument(documentId);

  if (!document) {
    return res.status(404).json({
      message: "document not found",
    });
  }

  res.json(document);
}

export async function shareDocumentController(req: Request, res: Response) {
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

  const results = await searchUserDocuments(req.user!.id, query);

  res.json(results);
}

export async function getAuditLogsController(req: Request, res: Response) {
  const documentId = Number(req.params.documentId);

  const logs = await getDocumentAuditLogs(documentId);

  res.json(logs);
}
