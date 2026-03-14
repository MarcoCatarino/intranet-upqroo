import { Request, Response, NextFunction } from "express";
import { userHasDocumentAccess } from "../modules/documents/documents.repository.js";
export async function documentPermissionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user?.id;
  const documentId =
    Number(req.params.documentId) || Number(req.body.documentId);
  if (!documentId) {
    return res.status(400).json({
      message: "Document id required",
    });
  }
  const allowed = await userHasDocumentAccess(userId!, documentId);
  if (!allowed) {
    return res.status(403).json({
      message: "Access denied",
    });
  }
  next();
}
