import { Router } from "express";
import multer from "multer";

import { authMiddleware } from "../../middleware/auth.middleware.js";
import { roleMiddleware } from "../../middleware/admin.middleware.js";
import { env } from "../../config/env.js";

import {
  uploadCsvController,
  listEnrollmentsController,
} from "./students.controller.js";

const router = Router();

if (!env.TMP_PATH) {
  throw new Error("TMP_PATH not configured");
}

const csvUpload = multer({
  dest: env.TMP_PATH,
  limits: {
    fileSize: 500 * 1024,
    files: 1,
  },
});

/*
|--------------------------------------------------------------------------
| Subir CSV de padrón — director y admin
|--------------------------------------------------------------------------
*/
router.post(
  "/upload-csv",
  authMiddleware,
  roleMiddleware("admin", "director"),
  csvUpload.single("file"),
  uploadCsvController,
);

/*
|--------------------------------------------------------------------------
| Ver padrón de un departamento — director y admin
|--------------------------------------------------------------------------
*/
router.get(
  "/:departmentId/enrollments",
  authMiddleware,
  roleMiddleware("admin", "director"),
  listEnrollmentsController,
);

export default router;
