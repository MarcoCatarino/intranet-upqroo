import { db } from "../../infrastructure/database/drizzle.js";
import { users } from "../../infrastructure/database/schema/users.schema.js";
import type { UserRole } from "../../infrastructure/database/schema/users.schema.js";

import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

export async function findUserByGoogleId(googleId: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.googleId, googleId));

  return result[0];
}

export async function findUserByEmail(email: string) {
  const result = await db.select().from(users).where(eq(users.email, email));

  return result[0];
}

export async function updateUserGoogleId(userId: string, googleId: string) {
  await db.update(users).set({ googleId }).where(eq(users.id, userId));
}

export async function createUser(data: {
  googleId?: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdBy?: string;
}) {
  const id = randomUUID();

  await db.insert(users).values({
    id,
    googleId: data.googleId ?? null,
    email: data.email,
    name: data.name,
    role: data.role,
    avatarUrl: data.avatarUrl,
    createdBy: data.createdBy ?? null,
  });

  return id;
}
