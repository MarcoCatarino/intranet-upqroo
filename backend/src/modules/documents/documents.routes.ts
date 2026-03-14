import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware.js";
import { documentRoleMiddleware } from "../../middleware/documentRole.middleware.js";
import { uploadMiddleware } from "../../middleware/upload.middleware.js";

import {
  createDocumentController,
  deleteDocumentController,
  documentPermissionsController,
  downloadDocumentController,
  listDocumentsController,
  shareDocumentController,
  uploadDocumentController,
  versionsController,
} from "./documents.controller.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| DOCUMENTS
|--------------------------------------------------------------------------
*/

router.post("/", authMiddleware, createDocumentController);

router.get("/", authMiddleware, listDocumentsController);

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
