import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

import type { AuthUser } from "./auth.types.js";
import {
  validateInstitutionEmail,
  resolveRoleFromEmail,
} from "./auth.domain.js";
import {
  findUserByGoogleId,
  findUserByEmail,
  updateUserGoogleId,
  createUser,
} from "./auth.repository.js";

import { env } from "../../config/env.js";

const client = new OAuth2Client(env.GOOGLE.CLIENT_ID);

const EPHEMERAL_ROLES = ["student", "professor"] as const;
type EphemeralRole = (typeof EPHEMERAL_ROLES)[number];

export async function loginWithGoogle(token: string) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: env.GOOGLE.CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload) throw new Error("Invalid Google token");

  validateInstitutionEmail(payload.email!);

  let user: AuthUser;

  const byGoogleId = await findUserByGoogleId(payload.sub);

  if (byGoogleId) {
    user = {
      id: byGoogleId.id,
      email: byGoogleId.email,
      name: byGoogleId.name,
      role: byGoogleId.role as AuthUser["role"],
    };
  } else {
    const byEmail = await findUserByEmail(payload.email!);

    if (byEmail) {
      await updateUserGoogleId(byEmail.id, payload.sub);

      user = {
        id: byEmail.id,
        email: byEmail.email,
        name: byEmail.name,
        role: byEmail.role as AuthUser["role"],
      };
    } else {
      const role = resolveRoleFromEmail(payload.email!);

      if (EPHEMERAL_ROLES.includes(role as EphemeralRole)) {
        user = {
          id: payload.sub,
          email: payload.email!,
          name: payload.name!,
          role,
        };
      } else {
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
      }
    }
  }

  const tokenJwt = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    env.AUTH.JWT_SECRET,
    { expiresIn: env.AUTH.JWT_EXPIRES },
  );

  return { token: tokenJwt, user };
}
