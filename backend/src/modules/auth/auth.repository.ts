import { db } from "../../infrastructure/database/drizzle.js";
import { users } from "../../infrastructure/database/schema/users.schema.js";

import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

export async function findUserByGoogleId(googleId: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.googleId, googleId));

  return result[0];
}

export async function createUser(data: {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}) {
  const id = randomUUID();

  await db.insert(users).values({
    id,
    googleId: data.googleId,
    email: data.email,
    name: data.name,
    avatarUrl: data.avatarUrl,
  });

  return id;
}
