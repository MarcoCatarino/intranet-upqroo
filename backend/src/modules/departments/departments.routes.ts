import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware.js";

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
| Departments
|--------------------------------------------------------------------------
*/

/**
 * Create department
 * POST /departments
 */
router.post("/", authMiddleware, createDepartmentController);

/**
 * List departments
 * GET /departments
 */
router.get("/", authMiddleware, listDepartmentsController);

/**
 * Get department
 * GET /departments/:departmentId
 */
router.get("/:departmentId", authMiddleware, departmentController);

/*
|--------------------------------------------------------------------------
| Department Users
|--------------------------------------------------------------------------
*/

/**
 * Add user to department
 * POST /departments/users
 */
router.post("/users", authMiddleware, addUserController);

/**
 * Remove user from department
 * DELETE /departments/:departmentId/user/:userId
 */
router.delete(
  "/:departmentId/user/:userId",
  authMiddleware,
  removeUserController,
);

/**
 * List users in department
 * GET /departments/:departmentId/users
 */
router.get("/:departmentId/users", authMiddleware, departmentUsersController);

export default router;
