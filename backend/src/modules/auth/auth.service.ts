import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

import type { AuthUser } from "./auth.types.js";
import { validateInstitutionEmail } from "./auth.domain.js";
import { findUserByGoogleId, createUser } from "./auth.repository.js";

import { env } from "../../config/env.js";

const client = new OAuth2Client(env.GOOGLE.CLIENT_ID);

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

  const dbUser = await findUserByGoogleId(payload.sub);

  let user: AuthUser;

  if (!dbUser) {
    const userId = await createUser({
      googleId: payload.sub,
      email: payload.email!,
      name: payload.name!,
      avatarUrl: payload.picture,
    });

    user = {
      id: userId,
      email: payload.email!,
      name: payload.name!,
    };
  } else {
    user = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
    };
  }

  const tokenJwt = jwt.sign(
    {
      userId: user.id,
      email: user.email,
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
