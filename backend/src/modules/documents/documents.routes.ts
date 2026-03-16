import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware.js";
import { documentRoleMiddleware } from "../../middleware/documentRole.middleware.js";
import { uploadMiddleware } from "../../middleware/upload.middleware.js";

import {
  createDocumentController,
  deleteDocumentController,
  documentPermissionsController,
  downloadDocumentController,
  getDocumentController,
  listDocumentsController,
  revokePermissionController,
  shareDocumentController,
  updateDocumentController,
  uploadDocumentController,
  versionsController,
} from "./documents.controller.js";
import { retryFailedJobsController } from "./documents.admin.controller.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| DOCUMENTS
|--------------------------------------------------------------------------
*/

router.post("/", authMiddleware, createDocumentController);

router.get("/", authMiddleware, listDocumentsController);

router.get(
  "/:documentId",
  authMiddleware,
  documentRoleMiddleware("view"),
  getDocumentController,
);

router.patch(
  "/:documentId",
  authMiddleware,
  documentRoleMiddleware("edit"),
  updateDocumentController,
);

router.delete(
  "/:documentId",
  authMiddleware,
  documentRoleMiddleware("edit"),
  deleteDocumentController,
);

/*
|--------------------------------------------------------------------------
| SHARING
|--------------------------------------------------------------------------
*/

router.get(
  "/:documentId/permissions",
  authMiddleware,
  documentRoleMiddleware("share"),
  documentPermissionsController,
);

router.post(
  "/share",
  authMiddleware,
  documentRoleMiddleware("share"),
  shareDocumentController,
);

router.delete(
  "/:documentId/permissions",
  authMiddleware,
  documentRoleMiddleware("share"),
  revokePermissionController,
);

router.post("/retry-failed", retryFailedJobsController);

/*
|--------------------------------------------------------------------------
| VERSIONS
|--------------------------------------------------------------------------
*/

router.post(
  "/upload",
  authMiddleware,
  documentRoleMiddleware("upload_version"),
  uploadMiddleware.single("file"),
  uploadDocumentController,
);

router.get(
  "/:documentId/versions",
  authMiddleware,
  documentRoleMiddleware("view"),
  versionsController,
);

/*
|--------------------------------------------------------------------------
| DOWNLOAD
|--------------------------------------------------------------------------
*/

router.get(
  "/:documentId/version/:version",
  authMiddleware,
  documentRoleMiddleware("download"),
  downloadDocumentController,
);

export default router;
