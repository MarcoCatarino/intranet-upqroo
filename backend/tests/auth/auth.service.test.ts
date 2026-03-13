import test from "node:test";
import assert from "node:assert";
import jwt from "jsonwebtoken";

process.env.JWT_SECRET = "test_secret";

test("jwt creation works", () => {
  const token = jwt.sign(
    {
      userId: "abc",
      email: "user@upqroo.edu.mx",
    },
    process.env.JWT_SECRET as string,
  );

  const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

  assert.equal(decoded.userId, "abc");
});
