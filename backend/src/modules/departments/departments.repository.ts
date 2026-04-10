import { db } from "../../infrastructure/database/drizzle.js";
import { and, eq, isNull } from "drizzle-orm";

import { departments } from "../../infrastructure/database/schema/departments.schema.js";
import { departmentUsers } from "../../infrastructure/database/schema/departments_users.schema.js";
import { users } from "../../infrastructure/database/schema/users.schema.js";
import { professorUploadPermissions } from "../../infrastructure/database/schema/professor_upload_permissions.schema.js";
import { employeeUploadPermissions } from "../../infrastructure/database/schema/employee_upload_permissions.schema.js";
import { directorSharePermissions } from "../../infrastructure/database/schema/director_share_permissions.schema.js";
import { directorEmployeePermissions } from "../../infrastructure/database/schema/director_employee_permissions.schema.js";

export async function createDepartment(data: {
  name: string;
  slug: string;
  parentId?: number;
}) {
  return db.insert(departments).values({
    name: data.name,
    slug: data.slug,
    parentId: data.parentId ?? null,
  });
}

export async function listDepartments() {
  return db.select().from(departments).where(isNull(departments.deletedAt));
}

export async function findDepartmentById(departmentId: number) {
  const result = await db
    .select()
    .from(departments)
    .where(and(eq(departments.id, departmentId), isNull(departments.deletedAt)))
    .limit(1);

  return result[0] ?? null;
}

export async function updateDepartment(
  departmentId: number,
  data: { name?: string; slug?: string },
) {
  await db
    .update(departments)
    .set({ ...data })
    .where(eq(departments.id, departmentId));
}

export async function softDeleteDepartment(departmentId: number) {
  await db
    .update(departments)
    .set({ deletedAt: new Date() })
    .where(eq(departments.id, departmentId));
}

export async function addUserToDepartment(data: {
  departmentId: number;
  userId: string;
  role: string;
}) {
  return db.insert(departmentUsers).values(data);
}

export async function removeUserFromDepartment(
  departmentId: number,
  userId: string,
) {
  return db
    .delete(departmentUsers)
    .where(
      and(
        eq(departmentUsers.departmentId, departmentId),
        eq(departmentUsers.userId, userId),
      ),
    );
}

export async function listUsersInDepartment(departmentId: number) {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    })
    .from(departmentUsers)
    .innerJoin(users, eq(users.id, departmentUsers.userId))
    .where(eq(departmentUsers.departmentId, departmentId));
}

/* =========================
   PROFESSOR UPLOAD PERMISSIONS
========================= */

export async function insertProfessorUploadPermission(data: {
  professorId: string;
  departmentId: number;
  grantedBy: string;
}) {
  return db.insert(professorUploadPermissions).values(data);
}

export async function deleteProfessorUploadPermission(data: {
  professorId: string;
  departmentId: number;
}) {
  return db
    .delete(professorUploadPermissions)
    .where(
      and(
        eq(professorUploadPermissions.professorId, data.professorId),
        eq(professorUploadPermissions.departmentId, data.departmentId),
      ),
    );
}

/* =========================
   EMPLOYEE UPLOAD PERMISSIONS
========================= */

export async function insertEmployeeUploadPermission(data: {
  employeeId: string;
  departmentId: number;
  grantedBy: string;
}) {
  return db.insert(employeeUploadPermissions).values(data);
}

export async function deleteEmployeeUploadPermission(data: {
  employeeId: string;
  departmentId: number;
}) {
  return db
    .delete(employeeUploadPermissions)
    .where(
      and(
        eq(employeeUploadPermissions.employeeId, data.employeeId),
        eq(employeeUploadPermissions.departmentId, data.departmentId),
      ),
    );
}

export async function listEmployeeUploadPermissions(departmentId: number) {
  return db
    .select({
      employeeId: employeeUploadPermissions.employeeId,
      grantedBy: employeeUploadPermissions.grantedBy,
      createdAt: employeeUploadPermissions.createdAt,
    })
    .from(employeeUploadPermissions)
    .where(eq(employeeUploadPermissions.departmentId, departmentId));
}

/* =========================
   DIRECTOR SHARE PERMISSIONS
========================= */

export async function insertDirectorSharePermission(data: {
  directorId: string;
  departmentId: number;
  grantedBy: string;
}) {
  return db.insert(directorSharePermissions).values(data);
}

export async function deleteDirectorSharePermission(data: {
  directorId: string;
  departmentId: number;
}) {
  return db
    .delete(directorSharePermissions)
    .where(
      and(
        eq(directorSharePermissions.directorId, data.directorId),
        eq(directorSharePermissions.departmentId, data.departmentId),
      ),
    );
}

export async function getDirectorSharePermission(
  directorId: string,
  departmentId: number,
) {
  const result = await db
    .select()
    .from(directorSharePermissions)
    .where(
      and(
        eq(directorSharePermissions.directorId, directorId),
        eq(directorSharePermissions.departmentId, departmentId),
      ),
    )
    .limit(1);

  return result[0] ?? null;
}

/* =========================
   DIRECTOR EMPLOYEE PERMISSIONS
========================= */

export async function insertDirectorEmployeePermission(data: {
  directorId: string;
  departmentId: number;
  grantedBy: string;
}) {
  return db.insert(directorEmployeePermissions).values(data);
}

export async function deleteDirectorEmployeePermission(data: {
  directorId: string;
  departmentId: number;
}) {
  return db
    .delete(directorEmployeePermissions)
    .where(
      and(
        eq(directorEmployeePermissions.directorId, data.directorId),
        eq(directorEmployeePermissions.departmentId, data.departmentId),
      ),
    );
}

export async function getDirectorEmployeePermission(
  directorId: string,
  departmentId: number,
) {
  const result = await db
    .select()
    .from(directorEmployeePermissions)
    .where(
      and(
        eq(directorEmployeePermissions.directorId, directorId),
        eq(directorEmployeePermissions.departmentId, departmentId),
      ),
    )
    .limit(1);

  return result[0] ?? null;
}
