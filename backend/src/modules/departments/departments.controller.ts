import { Request, Response } from "express";

import {
  createDepartmentService,
  getDepartments,
  getDepartment,
  addUserService,
  removeUserService,
  usersInDepartment,
} from "./departments.service.js";

import {
  createDepartmentSchema,
  departmentIdSchema,
  addUserSchema,
} from "./departments.validators.js";

/**
 * POST /departments
 */
export async function createDepartmentController(req: Request, res: Response) {
  const data = createDepartmentSchema.parse(req.body);

  const department = await createDepartmentService(data);

  res.status(201).json(department);
}

/**
 * GET /departments
 */
export async function listDepartmentsController(_req: Request, res: Response) {
  const departments = await getDepartments();

  res.json(departments);
}

/**
 * GET /departments/:departmentId
 */
export async function departmentController(req: Request, res: Response) {
  const { departmentId } = departmentIdSchema.parse(req.params);

  const department = await getDepartment(departmentId);

  if (!department) {
    return res.status(404).json({ message: "Department not found" });
  }

  res.json(department);
}

/**
 * POST /departments/users
 */
export async function addUserController(req: Request, res: Response) {
  const data = addUserSchema.parse(req.body);

  const result = await addUserService(data);

  res.status(201).json(result);
}

/**
 * DELETE /departments/:departmentId/user/:userId
 */
export async function removeUserController(req: Request, res: Response) {
  const departmentId = Number(req.params.departmentId);
  const userId = req.params.userId;

  await removeUserService(departmentId, userId);

  res.status(204).send();
}

/**
 * GET /departments/:departmentId/users
 */
export async function departmentUsersController(req: Request, res: Response) {
  const { departmentId } = departmentIdSchema.parse(req.params);

  const users = await usersInDepartment(departmentId);

  res.json(users);
}
