import { db } from "../../infrastructure/database/drizzle.js";
import { eq, like, or } from "drizzle-orm";

import { users } from "../../infrastructure/database/schema/users.schema.js";
import { departmentUsers } from "../../infrastructure/database/schema/departments_users.schema.js";

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
      avatarUrl: users.avatarUrl,
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

export async function countUsers() {
  const result = await db.select({ id: users.id }).from(users);

  return result.length;
}
