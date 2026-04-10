import { Request, Response } from "express";

import {
  createDepartmentService,
  getDepartments,
  getDepartment,
  addUserService,
  removeUserService,
  usersInDepartment,
  grantProfessorUploadService,
  revokeProfessorUploadService,
  grantEmployeeUploadService,
  revokeEmployeeUploadService,
  getEmployeeUploadPermissionsService,
  updateDepartmentService,
  deleteDepartmentService,
  grantDirectorShareService,
  revokeDirectorShareService,
  grantDirectorEmployeeService,
  revokeDirectorEmployeeService,
} from "./departments.service.js";

import {
  createDepartmentSchema,
  updateDepartmentSchema,
  departmentIdSchema,
  addUserSchema,
  professorUploadSchema,
  employeeUploadSchema,
  directorShareSchema,
  directorEmployeeSchema,
} from "./departments.validators.js";

export async function createDepartmentController(req: Request, res: Response) {
  const data = createDepartmentSchema.parse(req.body);
  const department = await createDepartmentService(data);
  res.status(201).json(department);
}

export async function listDepartmentsController(_req: Request, res: Response) {
  const departments = await getDepartments();
  res.json(departments);
}

export async function departmentController(req: Request, res: Response) {
  const { departmentId } = departmentIdSchema.parse(req.params);
  const department = await getDepartment(departmentId);

  if (!department) {
    return res.status(404).json({ message: "Department not found" });
  }

  res.json(department);
}

export async function updateDepartmentController(req: Request, res: Response) {
  const { departmentId } = departmentIdSchema.parse(req.params);
  const data = updateDepartmentSchema.parse(req.body);
  await updateDepartmentService(departmentId, data);
  res.json({ message: "Department updated" });
}

export async function deleteDepartmentController(req: Request, res: Response) {
  const { departmentId } = departmentIdSchema.parse(req.params);
  await deleteDepartmentService(departmentId);
  res.status(204).send();
}

export async function addUserController(req: Request, res: Response) {
  const data = addUserSchema.parse(req.body);
  const result = await addUserService(data);
  res.status(201).json(result);
}

export async function removeUserController(req: Request, res: Response) {
  const departmentId = Number(req.params.departmentId);
  const userId = req.params.userId;
  await removeUserService(departmentId, userId);
  res.status(204).send();
}

export async function departmentUsersController(req: Request, res: Response) {
  const { departmentId } = departmentIdSchema.parse(req.params);
  const users = await usersInDepartment(departmentId);
  res.json(users);
}

/* =========================
   PROFESSOR UPLOAD
========================= */

export async function grantProfessorUploadController(
  req: Request,
  res: Response,
) {
  const { departmentId, professorId } = professorUploadSchema.parse(req.params);
  await grantProfessorUploadService({
    professorId,
    departmentId,
    grantedBy: req.user!.id,
  });
  res.status(201).json({ message: "Upload permission granted" });
}

export async function revokeProfessorUploadController(
  req: Request,
  res: Response,
) {
  const { departmentId, professorId } = professorUploadSchema.parse(req.params);
  await revokeProfessorUploadService({ professorId, departmentId });
  res.status(204).send();
}

/* =========================
   EMPLOYEE UPLOAD
========================= */

export async function grantEmployeeUploadController(
  req: Request,
  res: Response,
) {
  const { departmentId, employeeId } = employeeUploadSchema.parse(req.params);
  await grantEmployeeUploadService({
    employeeId,
    departmentId,
    grantedBy: req.user!.id,
  });
  res.status(201).json({ message: "Employee upload permission granted" });
}

export async function revokeEmployeeUploadController(
  req: Request,
  res: Response,
) {
  const { departmentId, employeeId } = employeeUploadSchema.parse(req.params);
  await revokeEmployeeUploadService({ employeeId, departmentId });
  res.status(204).send();
}

export async function listEmployeeUploadController(
  req: Request,
  res: Response,
) {
  const { departmentId } = departmentIdSchema.parse(req.params);
  const permissions = await getEmployeeUploadPermissionsService(departmentId);
  res.json(permissions);
}

/* =========================
   DIRECTOR SHARE
========================= */

export async function grantDirectorShareController(
  req: Request,
  res: Response,
) {
  const { departmentId, directorId } = directorShareSchema.parse(req.params);
  await grantDirectorShareService({
    directorId,
    departmentId,
    grantedBy: req.user!.id,
  });
  res.status(201).json({ message: "Share permission granted" });
}

export async function revokeDirectorShareController(
  req: Request,
  res: Response,
) {
  const { departmentId, directorId } = directorShareSchema.parse(req.params);
  await revokeDirectorShareService({ directorId, departmentId });
  res.status(204).send();
}

/* =========================
   DIRECTOR EMPLOYEE CREATION
========================= */

export async function grantDirectorEmployeeController(
  req: Request,
  res: Response,
) {
  const { departmentId, directorId } = directorEmployeeSchema.parse(req.params);
  await grantDirectorEmployeeService({
    directorId,
    departmentId,
    grantedBy: req.user!.id,
  });
  res.status(201).json({ message: "Employee creation permission granted" });
}

export async function revokeDirectorEmployeeController(
  req: Request,
  res: Response,
) {
  const { departmentId, directorId } = directorEmployeeSchema.parse(req.params);
  await revokeDirectorEmployeeService({ directorId, departmentId });
  res.status(204).send();
}
