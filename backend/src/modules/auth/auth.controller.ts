import { Request, Response } from "express";

import { googleAuthSchema } from "./auth.validators.js";
import { loginWithGoogle } from "./auth.service.js";

export async function googleLogin(req: Request, res: Response) {
  const parsed = googleAuthSchema.parse(req.body);

  const result = await loginWithGoogle(parsed.token);

  res.cookie("token", result.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 1000 * 60 * 60 * 4,
  });

  res.json({
    user: result.user,
  });
}
