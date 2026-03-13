import test from "node:test";
import assert from "node:assert";
import jwt from "jsonwebtoken";

import { authMiddleware } from "../../src/middleware/auth.middleware.js";

process.env.JWT_SECRET = "test_secret";

test("middleware accepts valid token", () => {
  const token = jwt.sign(
    { userId: "123", email: "user@upqroo.edu.mx" },
    process.env.JWT_SECRET as string,
  );

  const req: any = {
    cookies: { token },
  };

  const res: any = {
    status: () => res,
    json: () => {},
  };

  let nextCalled = false;

  const next = () => {
    nextCalled = true;
  };

  authMiddleware(req, res, next);

  assert.equal(nextCalled, true);
  assert.equal(req.user.id, "123");
});
