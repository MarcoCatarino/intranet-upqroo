import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware.js";
import { roleMiddleware } from "../../middleware/admin.middleware.js";

import {
  getMyProfileController,
  listUsersController,
  searchUsersController,
  usersByDepartmentController,
  createUserController,
} from "./users.controller.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Profile
|--------------------------------------------------------------------------
*/
router.get("/me", authMiddleware, getMyProfileController);

/*
|--------------------------------------------------------------------------
| Crear usuario — admin, secretary y director según jerarquía
|--------------------------------------------------------------------------
*/
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "secretary", "director"),
  createUserController,
);

/*
|--------------------------------------------------------------------------
| Listar y buscar — solo admin ve la lista completa
|--------------------------------------------------------------------------
*/
router.get("/", authMiddleware, roleMiddleware("admin"), listUsersController);

router.get("/search", authMiddleware, searchUsersController);

/*
|--------------------------------------------------------------------------
| Por departamento
|--------------------------------------------------------------------------
*/
router.get(
  "/department/:departmentId",
  authMiddleware,
  usersByDepartmentController,
);

export default router;
