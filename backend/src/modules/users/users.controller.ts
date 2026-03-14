import { Request, Response } from "express";

import {
  getUserProfile,
  getAllUsers,
  searchUser,
  getUsersByDepartment,
} from "./users.service.js";

import {
  searchUsersSchema,
  departmentUsersSchema,
} from "./users.validators.js";

/**
 * GET /users/me
 */
export async function getMyProfileController(req: Request, res: Response) {
  const user = await getUserProfile(req.user!.id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  res.json(user);
}

/**
 * GET /users
 */
export async function listUsersController(_req: Request, res: Response) {
  const users = await getAllUsers();

  res.json(users);
}

/**
 * GET /users/search?q=
 */
export async function searchUsersController(req: Request, res: Response) {
  const { q } = searchUsersSchema.parse(req.query);

  const users = await searchUser(q);

  res.json(users);
}

/**
 * GET /users/department/:departmentId
 */
export async function usersByDepartmentController(req: Request, res: Response) {
  const { departmentId } = departmentUsersSchema.parse(req.params);

  const users = await getUsersByDepartment(departmentId);

  res.json(users);
}
