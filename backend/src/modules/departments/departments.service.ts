import {
  createDepartment,
  listDepartments,
  findDepartmentById,
  addUserToDepartment,
  removeUserFromDepartment,
  listUsersInDepartment,
  insertProfessorUploadPermission,
  deleteProfessorUploadPermission,
  updateDepartment,
  softDeleteDepartment,
  insertDirectorSharePermission,
  deleteDirectorSharePermission,
  getDirectorSharePermission,
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

// Nuevo: editar
export async function updateDepartmentService(
  departmentId: number,
  data: { name?: string; slug?: string },
) {
  const existing = await findDepartmentById(departmentId);

  if (!existing) {
    throw new Error("Departamento no encontrado");
  }

  return updateDepartment(departmentId, data);
}

// Nuevo: eliminar (soft)
export async function deleteDepartmentService(departmentId: number) {
  const existing = await findDepartmentById(departmentId);

  if (!existing) {
    throw new Error("Departamento no encontrado");
  }

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
