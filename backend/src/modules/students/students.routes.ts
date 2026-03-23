import { Router } from "express";
import multer from "multer";
import os from "node:os";

import { authMiddleware } from "../../middleware/auth.middleware.js";
import { roleMiddleware } from "../../middleware/admin.middleware.js";

import {
  uploadCsvController,
  listEnrollmentsController,
} from "./students.controller.js";

const router = Router();

// Multer configurado para guardar el CSV en el directorio temporal del SO.
// No usamos el TMP_PATH del sistema de documentos para no mezclar
// archivos temporales de diferentes flujos.
const csvUpload = multer({
  dest: os.tmpdir(),
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
