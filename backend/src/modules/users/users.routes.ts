import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware.js";

import {
  getMyProfileController,
  listUsersController,
  searchUsersController,
  usersByDepartmentController,
} from "./users.controller.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Profile
|--------------------------------------------------------------------------
*/

/**
 * GET /users/me
 */
router.get("/me", authMiddleware, getMyProfileController);

/*
|--------------------------------------------------------------------------
| Users
|--------------------------------------------------------------------------
*/

/**
 * GET /users
 */
router.get("/", authMiddleware, listUsersController);

/**
 * GET /users/search?q=
 */
router.get("/search", authMiddleware, searchUsersController);

/*
|--------------------------------------------------------------------------
| Departments
|--------------------------------------------------------------------------
*/

/**
 * GET /users/department/:departmentId
 */
router.get(
  "/department/:departmentId",
  authMiddleware,
  usersByDepartmentController,
);

export default router;
