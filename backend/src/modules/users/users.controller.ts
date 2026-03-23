import { Request, Response } from "express";

import {
  getUserProfile,
  getAllUsers,
  searchUser,
  getUsersByDepartment,
  createManagedUserService,
} from "./users.service.js";

import {
  searchUsersSchema,
  departmentUsersSchema,
  paginationSchema,
  createUserSchema,
} from "./users.validators.js";

import type { UserRole } from "../../infrastructure/database/schema/users.schema.js";

export async function getMyProfileController(req: Request, res: Response) {
  const user = await getUserProfile(req.user!.id);

  if (user) {
    return res.json(user);
  }

  if (req.user!.role === "student" || req.user!.role === "professor") {
    return res.json({
      id: req.user!.id,
      email: req.user!.email,
      name: req.user!.email.split("@")[0],
      role: req.user!.role,
      avatarUrl: null,
      createdAt: new Date().toISOString(),
      departmentId: req.user!.departmentId ?? null,
    });
  }

  return res.status(404).json({ message: "User not found" });
}

export async function listUsersController(req: Request, res: Response) {
  const { page, limit } = paginationSchema.parse(req.query);
  const result = await getAllUsers(page, limit);
  res.json(result);
}

export async function searchUsersController(req: Request, res: Response) {
  const { q } = searchUsersSchema.parse(req.query);
  const users = await searchUser(q);
  res.json(users);
}

export async function usersByDepartmentController(req: Request, res: Response) {
  const { departmentId } = departmentUsersSchema.parse(req.params);
  const users = await getUsersByDepartment(departmentId);
  res.json(users);
}

export async function createUserController(req: Request, res: Response) {
  const data = createUserSchema.parse(req.body);

  const result = await createManagedUserService({
    creatorId: req.user!.id,
    creatorRole: req.user!.role as UserRole,
    name: data.name,
    email: data.email,
    role: data.role as UserRole,
    departmentId: data.departmentId,
  });

  res.status(201).json(result);
}
