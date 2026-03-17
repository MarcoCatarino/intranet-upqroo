import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware.js";
import { adminMiddleware } from "../../middleware/admin.middleware.js";

import {
  createDepartmentController,
  listDepartmentsController,
  departmentController,
  addUserController,
  removeUserController,
  departmentUsersController,
} from "./departments.controller.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Departments — Lectura (cualquier usuario autenticado)
|--------------------------------------------------------------------------
*/

/**
 * GET /departments
 */
router.get("/", authMiddleware, listDepartmentsController);

/**
 * GET /departments/:departmentId
 */
router.get("/:departmentId", authMiddleware, departmentController);

/**
 * GET /departments/:departmentId/users
 */
router.get("/:departmentId/users", authMiddleware, departmentUsersController);

/*
|--------------------------------------------------------------------------
| Departments — Escritura (solo admin)
|--------------------------------------------------------------------------
*/

/**
 * POST /departments
 */
router.post("/", authMiddleware, adminMiddleware, createDepartmentController);

/**
 * POST /departments/users
 */
router.post("/users", authMiddleware, adminMiddleware, addUserController);

/**
 * DELETE /departments/:departmentId/user/:userId
 */
router.delete(
  "/:departmentId/user/:userId",
  authMiddleware,
  adminMiddleware,
  removeUserController,
);

export default router;
