import {
  createDepartment,
  listDepartments,
  findDepartmentById,
  addUserToDepartment,
  removeUserFromDepartment,
  listUsersInDepartment,
} from "./departments.repository.js";

export async function createDepartmentService(data: {
  name: string;
  slug: string;
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
