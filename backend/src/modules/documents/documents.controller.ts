import { Request, Response } from "express";

import { createDocumentSchema } from "./documents.validators.js";
import {
  createNewDocument,
  storeDocumentFile,
  shareDocument,
  getUserDocuments,
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

export async function listDocumentsController(req: Request, res: Response) {
  const docs = await getUserDocuments(req.user!.id);

  res.json(docs);
}

export async function shareDocumentController(req: Request, res: Response) {
  const { documentId, userId, role } = req.body;

  await shareDocument({
    documentId,
    userId,
    role,
    grantedBy: req.user!.id,
  });

  res.json({ message: "shared" });
}

export async function downloadDocumentController(req: Request, res: Response) {
  const { documentId, version } = req.params;

  const filePath = `storage/documents/${documentId}/v${version}.pdf`;

  res.download(filePath);
}

export async function deleteDocumentController(req: Request, res: Response) {
  await softDeleteDocument(Number(req.params.documentId));

  res.json({ message: "deleted" });
}
