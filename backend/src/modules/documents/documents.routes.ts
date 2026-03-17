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
  searchDocumentsController,
  shareDocumentController,
  updateDocumentController,
  uploadDocumentController,
  versionsController,
} from "./documents.controller.js";
import { retryFailedJobsController } from "./documents.admin.controller.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| DOCUMENTS — Rutas estáticas primero
|--------------------------------------------------------------------------
*/

router.get("/", authMiddleware, listDocumentsController);

router.get("/search", authMiddleware, searchDocumentsController);

router.post("/", authMiddleware, createDocumentController);

/*
|--------------------------------------------------------------------------
| VERSIONS & UPLOAD — Rutas estáticas antes de /:documentId
|--------------------------------------------------------------------------
*/

router.post(
  "/upload",
  authMiddleware,
  documentRoleMiddleware("upload_version"),
  uploadMiddleware.single("file"),
  uploadDocumentController,
);

/*
|--------------------------------------------------------------------------
| SHARING — Rutas estáticas antes de /:documentId
|--------------------------------------------------------------------------
*/

router.post(
  "/share",
  authMiddleware,
  documentRoleMiddleware("share"),
  shareDocumentController,
);

router.post("/retry-failed", authMiddleware, retryFailedJobsController);

/*
|--------------------------------------------------------------------------
| DOCUMENTS — Rutas dinámicas con /:documentId
|--------------------------------------------------------------------------
*/

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

router.get(
  "/:documentId/versions",
  authMiddleware,
  documentRoleMiddleware("view"),
  versionsController,
);

router.get(
  "/:documentId/permissions",
  authMiddleware,
  documentRoleMiddleware("share"),
  documentPermissionsController,
);

router.delete(
  "/:documentId/permissions",
  authMiddleware,
  documentRoleMiddleware("share"),
  revokePermissionController,
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
