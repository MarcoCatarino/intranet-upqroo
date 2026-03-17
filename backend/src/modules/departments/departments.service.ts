import {
  createDepartment,
  listDepartments,
  findDepartmentById,
  addUserToDepartment,
  removeUserFromDepartment,
  listUsersInDepartment,
  insertProfessorUploadPermission,
  deleteProfessorUploadPermission,
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
