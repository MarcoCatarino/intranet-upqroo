import { db } from "../../infrastructure/database/drizzle.js";
import { and, eq } from "drizzle-orm";

import { departments } from "../../infrastructure/database/schema/departments.schema.js";
import { departmentUsers } from "../../infrastructure/database/schema/departments_users.schema.js";
import { users } from "../../infrastructure/database/schema/users.schema.js";
import { professorUploadPermissions } from "../../infrastructure/database/schema/professor_upload_permissions.schema.js";

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
  return db.select().from(departments);
}

export async function findDepartmentById(departmentId: number) {
  const result = await db
    .select()
    .from(departments)
    .where(eq(departments.id, departmentId))
    .limit(1);

  return result[0] ?? null;
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
    })
    .from(departmentUsers)
    .innerJoin(users, eq(users.id, departmentUsers.userId))
    .where(eq(departmentUsers.departmentId, departmentId));
}

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
