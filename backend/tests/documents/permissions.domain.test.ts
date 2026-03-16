import test from "node:test";
import assert from "node:assert";

import { shareDocumentSchema } from "../../src/modules/documents/documents.validators.js";

test("accepts share with user", () => {
  const result = shareDocumentSchema.parse({
    documentId: 1,
    userId: "uuid-test",
    permission: "view",
  });

  assert.equal(result.permission, "view");
});

test("accepts share with department", () => {
  const result = shareDocumentSchema.parse({
    documentId: 1,
    departmentId: 2,
    permission: "edit",
  });

  assert.equal(result.permission, "edit");
});

test("rejects share without target", () => {
  assert.throws(() => {
    shareDocumentSchema.parse({
      documentId: 1,
      permission: "view",
    });
  });
});
