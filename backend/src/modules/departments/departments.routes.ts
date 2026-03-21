import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware.js";
import { roleMiddleware } from "../../middleware/admin.middleware.js";

import {
  createDepartmentController,
  listDepartmentsController,
  departmentController,
  updateDepartmentController,
  deleteDepartmentController,
  addUserController,
  removeUserController,
  departmentUsersController,
  grantProfessorUploadController,
  revokeProfessorUploadController,
  grantDirectorShareController,
  revokeDirectorShareController,
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
| Escritura de departamentos — solo admin
|--------------------------------------------------------------------------
*/
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  createDepartmentController,
);

router.patch(
  "/:departmentId",
  authMiddleware,
  roleMiddleware("admin"),
  updateDepartmentController,
);

router.delete(
  "/:departmentId",
  authMiddleware,
  roleMiddleware("admin"),
  deleteDepartmentController,
);

/*
|--------------------------------------------------------------------------
| Usuarios en departamento — solo admin
|--------------------------------------------------------------------------
*/
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

/*
|--------------------------------------------------------------------------
| Permisos de compartir para directores — admin o secretary
|--------------------------------------------------------------------------
*/
router.post(
  "/:departmentId/director-share/:directorId",
  authMiddleware,
  roleMiddleware("admin", "secretary"),
  grantDirectorShareController,
);

router.delete(
  "/:departmentId/director-share/:directorId",
  authMiddleware,
  roleMiddleware("admin", "secretary"),
  revokeDirectorShareController,
);

export default router;
