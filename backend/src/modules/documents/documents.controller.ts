import { Request, Response } from "express";
import { db } from "../../infrastructure/database/drizzle.js";
import { eq, and } from "drizzle-orm";

import { documentVersions } from "../../infrastructure/database/schema/document_versions.schema.js";

import {
  createDocumentSchema,
  shareDocumentSchema,
} from "./documents.validators.js";
import {
  createNewDocument,
  storeDocumentFile,
  shareDocument,
  getUserDocuments,
  getPermissionsForDocument,
} from "./documents.service.js";
import {
  getDocumentVersions,
  softDeleteDocument,
} from "./documents.repository.js";

export async function createDocumentController(req: Request, res: Response) {
  const data = createDocumentSchema.parse(req.body);

  const documentId = await createNewDocument(
    data.title,
    req.user!.id,
    data.departmentId,
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

  await storeDocumentFile({
    documentId,
    tmpPath: file.path,
    mimeType: file.mimetype,
    fileSize: file.size,
    uploadedBy: req.user!.id,
  });

  res.json({
    message: "uploaded",
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
  const docs = await getUserDocuments(req.user!.id);

  res.json(docs);
}

export async function shareDocumentController(req: Request, res: Response) {
  const { documentId, userId, departmentId, permission } =
    shareDocumentSchema.parse(req.body);

  if (!userId && !departmentId) {
    return res.status(400).json({
      message: "userId or departmentId required",
    });
  }

  await shareDocument({
    documentId,
    userId,
    departmentId,
    permission,
    grantedBy: req.user!.id,
  });

  res.json({
    message: "shared",
  });
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
  await softDeleteDocument(Number(req.params.documentId));

  res.json({ message: "deleted" });
}
