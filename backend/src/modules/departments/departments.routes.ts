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
  grantEmployeeUploadController,
  revokeEmployeeUploadController,
  listEmployeeUploadController,
  grantDirectorShareController,
  revokeDirectorShareController,
  grantDirectorEmployeeController,
  revokeDirectorEmployeeController,
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
| Permisos de subida para empleados — admin o director
|--------------------------------------------------------------------------
*/
router.get(
  "/:departmentId/employee-upload",
  authMiddleware,
  roleMiddleware("admin", "director"),
  listEmployeeUploadController,
);

router.post(
  "/:departmentId/employee-upload/:employeeId",
  authMiddleware,
  roleMiddleware("admin", "director"),
  grantEmployeeUploadController,
);

router.delete(
  "/:departmentId/employee-upload/:employeeId",
  authMiddleware,
  roleMiddleware("admin", "director"),
  revokeEmployeeUploadController,
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

/*
|--------------------------------------------------------------------------
| Permiso de creación de empleados para directores — admin o secretary
|--------------------------------------------------------------------------
*/
router.post(
  "/:departmentId/director-employee/:directorId",
  authMiddleware,
  roleMiddleware("admin", "secretary"),
  grantDirectorEmployeeController,
);

router.delete(
  "/:departmentId/director-employee/:directorId",
  authMiddleware,
  roleMiddleware("admin", "secretary"),
  revokeDirectorEmployeeController,
);

export default router;
