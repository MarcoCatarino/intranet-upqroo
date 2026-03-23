import { Request, Response } from "express";

import { googleAuthSchema } from "./auth.validators.js";
import { loginWithGoogle } from "./auth.service.js";

import { env } from "../../config/env.js";

const isProduction = process.env.NODE_ENV === "production";

export async function googleLogin(req: Request, res: Response) {
  const parsed = googleAuthSchema.parse(req.body);

  const result = await loginWithGoogle(parsed.token);

  res.cookie(env.AUTH.COOKIE_NAME, result.token, {
    httpOnly: true,
    sameSite: "strict",
    secure: isProduction,
    maxAge: 1000 * 60 * 60 * 4,
  });

  res.json({
    user: result.user,
  });
}

export function logout(_req: Request, res: Response) {
  res.clearCookie(env.AUTH.COOKIE_NAME, {
    httpOnly: true,
    sameSite: "strict",
    secure: isProduction,
  });

  res.status(204).send();
}