import test from "node:test";
import assert from "node:assert";
import jwt from "jsonwebtoken";

import { authMiddleware } from "../../src/middleware/auth.middleware.js";
import { env } from "../../src/config/env.js";

test("middleware accepts valid token", () => {
  const token = jwt.sign(
    {
      userId: "test-user",
      email: "test@upqroo.edu.mx",
    },
    env.AUTH.JWT_SECRET,
  );

  let nextCalled = false;

  const req = {
    cookies: {
      [env.AUTH.COOKIE_NAME]: token,
    },
  };

  const res = {
    status: () => res,
    json: () => {},
  };

  const next = () => {
    nextCalled = true;
  };

  authMiddleware(req as any, res as any, next);

  assert.equal(nextCalled, true);
});
