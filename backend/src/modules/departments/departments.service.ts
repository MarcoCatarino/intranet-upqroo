import {
  createDepartment,
  listDepartments,
  findDepartmentById,
  addUserToDepartment,
  removeUserFromDepartment,
  listUsersInDepartment,
  insertProfessorUploadPermission,
  deleteProfessorUploadPermission,
  insertEmployeeUploadPermission,
  deleteEmployeeUploadPermission,
  listEmployeeUploadPermissions,
  updateDepartment,
  softDeleteDepartment,
  insertDirectorSharePermission,
  deleteDirectorSharePermission,
  getDirectorSharePermission,
  insertDirectorEmployeePermission,
  deleteDirectorEmployeePermission,
  getDirectorEmployeePermission,
} from "./departments.repository.js";

export async function createDepartmentService(data: {
  name: string;
  slug: string;
  parentId?: number;
}) {
  return createDepartment(data);
}

export async function getDepartments() {
  return listDepartments();
}

export async function getDepartment(departmentId: number) {
  return findDepartmentById(departmentId);
}

export async function updateDepartmentService(
  departmentId: number,
  data: { name?: string; slug?: string },
) {
  const existing = await findDepartmentById(departmentId);
  if (!existing) throw new Error("Departamento no encontrado");
  return updateDepartment(departmentId, data);
}

export async function deleteDepartmentService(departmentId: number) {
  const existing = await findDepartmentById(departmentId);
  if (!existing) throw new Error("Departamento no encontrado");
  return softDeleteDepartment(departmentId);
}

export async function addUserService(data: {
  departmentId: number;
  userId: string;
  role: string;
}) {
  return addUserToDepartment(data);
}

export async function removeUserService(departmentId: number, userId: string) {
  return removeUserFromDepartment(departmentId, userId);
}

export async function usersInDepartment(departmentId: number) {
  return listUsersInDepartment(departmentId);
}

/* =========================
   PROFESSOR UPLOAD
========================= */

export async function grantProfessorUploadService(data: {
  professorId: string;
  departmentId: number;
  grantedBy: string;
}) {
  return insertProfessorUploadPermission(data);
}

export async function revokeProfessorUploadService(data: {
  professorId: string;
  departmentId: number;
}) {
  return deleteProfessorUploadPermission(data);
}

/* =========================
   EMPLOYEE UPLOAD
========================= */

export async function grantEmployeeUploadService(data: {
  employeeId: string;
  departmentId: number;
  grantedBy: string;
}) {
  return insertEmployeeUploadPermission(data);
}

export async function revokeEmployeeUploadService(data: {
  employeeId: string;
  departmentId: number;
}) {
  return deleteEmployeeUploadPermission(data);
}

export async function getEmployeeUploadPermissionsService(
  departmentId: number,
) {
  return listEmployeeUploadPermissions(departmentId);
}

/* =========================
   DIRECTOR SHARE
========================= */

export async function grantDirectorShareService(data: {
  directorId: string;
  departmentId: number;
  grantedBy: string;
}) {
  return insertDirectorSharePermission(data);
}

export async function revokeDirectorShareService(data: {
  directorId: string;
  departmentId: number;
}) {
  return deleteDirectorSharePermission(data);
}

export async function checkDirectorShareService(
  directorId: string,
  departmentId: number,
) {
  return getDirectorSharePermission(directorId, departmentId);
}

/* =========================
   DIRECTOR EMPLOYEE CREATION
========================= */

export async function grantDirectorEmployeeService(data: {
  directorId: string;
  departmentId: number;
  grantedBy: string;
}) {
  return insertDirectorEmployeePermission(data);
}

export async function revokeDirectorEmployeeService(data: {
  directorId: string;
  departmentId: number;
}) {
  return deleteDirectorEmployeePermission(data);
}

export async function checkDirectorEmployeeService(
  directorId: string,
  departmentId: number,
) {
  return getDirectorEmployeePermission(directorId, departmentId);
}
