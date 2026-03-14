import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware.js";
import { documentRoleMiddleware } from "../../middleware/documentRole.middleware.js";
import { uploadMiddleware } from "../../middleware/upload.middleware.js";

import {
  createDocumentController,
  deleteDocumentController,
  downloadDocumentController,
  listDocumentsController,
  shareDocumentController,
  uploadDocumentController,
  versionsController,
} from "./documents.controller.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Document CRUD
|--------------------------------------------------------------------------
*/

/**
 * Create a new document
 * POST /documents
 */
router.post("/", authMiddleware, createDocumentController);

/**
 * List documents accessible by the user
 * GET /documents
 */
router.get("/", authMiddleware, listDocumentsController);

/**
 * Soft delete document
 * DELETE /documents/:documentId
 */
router.delete(
  "/:documentId",
  authMiddleware,
  documentRoleMiddleware("edit"),
  deleteDocumentController,
);

/*
|--------------------------------------------------------------------------
| Document permissions
|--------------------------------------------------------------------------
*/

/**
 * Share document with user or department
 * POST /documents/share
 */
router.post(
  "/share",
  authMiddleware,
  documentRoleMiddleware("share"),
  shareDocumentController,
);

/*
|--------------------------------------------------------------------------
| Document versions
|--------------------------------------------------------------------------
*/

/**
 * Upload new version of document
 * POST /documents/upload
 */
router.post(
  "/upload",
  authMiddleware,
  documentRoleMiddleware("upload_version"),
  uploadMiddleware.single("file"),
  uploadDocumentController,
);

/**
 * List document versions
 * GET /documents/:documentId/versions
 */
router.get(
  "/:documentId/versions",
  authMiddleware,
  documentRoleMiddleware("view"),
  versionsController,
);

/**
 * Download specific version
 * GET /documents/:documentId/version/:version
 */
router.get(
  "/:documentId/version/:version",
  authMiddleware,
  documentRoleMiddleware("download"),
  downloadDocumentController,
);

export default router;
