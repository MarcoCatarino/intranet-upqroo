import {
  findUserById,
  listUsers,
  searchUsers,
  listUsersByDepartment,
  countUsers,
  createManagedUser,
  getDepartmentOfUser,
} from "./users.repository.js";

import { addUserToDepartment } from "../departments/departments.repository.js";
import { getDirectorEmployeePermission } from "../departments/departments.repository.js";

import { CREATABLE_ROLES } from "./users.validators.js";
import type { UserRole } from "../../infrastructure/database/schema/users.schema.js";

export async function getUserProfile(userId: string) {
  return findUserById(userId);
}

export async function getAllUsers(page: number, limit: number) {
  const [data, total] = await Promise.all([
    listUsers(page, limit),
    countUsers(),
  ]);
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function searchUser(query: string) {
  return searchUsers(query);
}

export async function getUsersByDepartment(departmentId: number) {
  return listUsersByDepartment(departmentId);
}

export async function createManagedUserService(data: {
  creatorId: string;
  creatorRole: UserRole;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: number;
}) {
  // ── 1. Role hierarchy check ──────────────────────────────────────────────
  const allowed = CREATABLE_ROLES[data.creatorRole] ?? [];
  if (!allowed.includes(data.role)) {
    throw new Error(
      `El rol "${data.creatorRole}" no puede crear usuarios con rol "${data.role}"`,
    );
  }

  // ── 2. Director-specific logic ───────────────────────────────────────────
  if (data.creatorRole === "director") {
    const creatorDept = await getDepartmentOfUser(data.creatorId);

    if (!creatorDept) {
      throw new Error("El director no tiene un departamento asignado");
    }

    // Directors always get their own department assigned to created users
    data.departmentId = creatorDept;

    // Employee creation requires explicit permission granted by secretary/admin
    if (data.role === "employee") {
      const perm = await getDirectorEmployeePermission(
        data.creatorId,
        creatorDept,
      );
      if (!perm) {
        throw new Error(
          "No tienes permiso para crear empleados. Solicita a tu Secretaría que te habilite este permiso.",
        );
      }
    }
  }

  // ── 3. Department required for certain roles ─────────────────────────────
  if (
    (data.role === "director" ||
      data.role === "assistant" ||
      data.role === "professor" ||
      data.role === "employee") &&
    !data.departmentId
  ) {
    throw new Error("Se requiere departmentId para este rol");
  }

  // ── 4. Create user and assign department ─────────────────────────────────
  const newUserId = await createManagedUser({
    email: data.email,
    name: data.name,
    role: data.role,
    createdBy: data.creatorId,
  });

  if (data.departmentId) {
    await addUserToDepartment({
      departmentId: data.departmentId,
      userId: newUserId,
      role: data.role,
    });
  }

  return { userId: newUserId };
}
