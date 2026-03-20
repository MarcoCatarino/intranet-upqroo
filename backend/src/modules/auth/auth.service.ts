import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

import type { AuthUser } from "./auth.types.js";
import {
  validateInstitutionEmail,
  resolveRoleFromEmail,
} from "./auth.domain.js";
import { findUserByGoogleId, createUser } from "./auth.repository.js";

import { env } from "../../config/env.js";

const client = new OAuth2Client(env.GOOGLE.CLIENT_ID);

// Roles que NO se persisten en la base de datos
const EPHEMERAL_ROLES = ["student", "professor"] as const;

export async function loginWithGoogle(token: string) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: env.GOOGLE.CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error("Invalid Google token");
  }

  validateInstitutionEmail(payload.email!);

  const role = resolveRoleFromEmail(payload.email!);

  let user: AuthUser;

  // Alumnos y profesores: autenticación sin persistencia en DB
  if (EPHEMERAL_ROLES.includes(role as (typeof EPHEMERAL_ROLES)[number])) {
    user = {
      id: payload.sub, // googleId como identificador de sesión
      email: payload.email!,
      name: payload.name!,
      role,
    };
  } else {
    // Admin, secretary, director, assistant → se buscan o crean en DB
    const dbUser = await findUserByGoogleId(payload.sub);

    if (!dbUser) {
      const userId = await createUser({
        googleId: payload.sub,
        email: payload.email!,
        name: payload.name!,
        role,
        avatarUrl: payload.picture,
      });

      user = {
        id: userId,
        email: payload.email!,
        name: payload.name!,
        role,
      };
    } else {
      user = {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role as AuthUser["role"],
      };
    }
  }

  const tokenJwt = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    env.AUTH.JWT_SECRET,
    {
      expiresIn: env.AUTH.JWT_EXPIRES,
    },
  );

  return {
    token: tokenJwt,
    user,
  };
}
