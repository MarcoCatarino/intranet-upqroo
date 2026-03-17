import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware.js";
import { roleMiddleware } from "../../middleware/admin.middleware.js";

import {
  createDepartmentController,
  listDepartmentsController,
  departmentController,
  addUserController,
  removeUserController,
  departmentUsersController,
  grantProfessorUploadController,
  revokeProfessorUploadController,
} from "./departments.controller.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Lectura — cualquier usuario autenticado
|--------------------------------------------------------------------------
*/

router.get("/", authMiddleware, listDepartmentsController);

router.get("/:departmentId", authMiddleware, departmentController);

router.get("/:departmentId/users", authMiddleware, departmentUsersController);

/*
|--------------------------------------------------------------------------
| Escritura — solo admin
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  createDepartmentController,
);

router.post(
  "/users",
  authMiddleware,
  roleMiddleware("admin"),
  addUserController,
);

router.delete(
  "/:departmentId/user/:userId",
  authMiddleware,
  roleMiddleware("admin"),
  removeUserController,
);

/*
|--------------------------------------------------------------------------
| Permisos de subida para profesores — admin o director
|--------------------------------------------------------------------------
*/

router.post(
  "/:departmentId/professor-upload/:professorId",
  authMiddleware,
  roleMiddleware("admin", "director"),
  grantProfessorUploadController,
);

router.delete(
  "/:departmentId/professor-upload/:professorId",
  authMiddleware,
  roleMiddleware("admin", "director"),
  revokeProfessorUploadController,
);

export default router;
