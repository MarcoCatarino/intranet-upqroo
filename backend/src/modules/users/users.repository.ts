import { db } from "../../infrastructure/database/drizzle.js";
import { eq, like, or, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import { users } from "../../infrastructure/database/schema/users.schema.js";
import { departmentUsers } from "../../infrastructure/database/schema/departments_users.schema.js";
import type { UserRole } from "../../infrastructure/database/schema/users.schema.js";

export async function findUserById(userId: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result[0] ?? null;
}

export async function listUsers(page: number, limit: number) {
  const offset = (page - 1) * limit;

  return db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      avatarUrl: users.avatarUrl,
      createdBy: users.createdBy,
      createdAt: users.createdAt,
    })
    .from(users)
    .limit(limit)
    .offset(offset);
}

export async function searchUsers(query: string) {
  return db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(or(like(users.name, `%${query}%`), like(users.email, `%${query}%`)));
}

export async function listUsersByDepartment(departmentId: number) {
  return db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
    })
    .from(departmentUsers)
    .innerJoin(users, eq(users.id, departmentUsers.userId))
    .where(eq(departmentUsers.departmentId, departmentId));
}

export async function countUsers(): Promise<number> {
  const result = await db.select({ count: sql<number>`COUNT(*)` }).from(users);

  return result[0]?.count ?? 0;
}

export async function createManagedUser(data: {
  email: string;
  name: string;
  role: UserRole;
  createdBy: string;
}) {
  const id = randomUUID();

  await db.insert(users).values({
    id,
    googleId: null,
    email: data.email,
    name: data.name,
    role: data.role,
    createdBy: data.createdBy,
  });

  return id;
}

export async function getDepartmentOfUser(userId: string) {
  const result = await db
    .select({ departmentId: departmentUsers.departmentId })
    .from(departmentUsers)
    .where(eq(departmentUsers.userId, userId))
    .limit(1);

  return result[0]?.departmentId ?? null;
}
