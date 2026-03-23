import test from "node:test";
import assert from "node:assert";

import { shareDocumentSchema } from "../../src/modules/documents/documents.validators.js";

test("accepts share with department", () => {
  const result = shareDocumentSchema.parse({
    documentId: 1,
    departmentId: 2,
    permission: "edit",
  });

  assert.equal(result.permission, "edit");
  assert.equal(result.departmentId, 2);
});

test("rejects share without departmentId", () => {
  assert.throws(() => {
    shareDocumentSchema.parse({
      documentId: 1,
      permission: "view",
    });
  });
});

test("rejects share with invalid permission", () => {
  assert.throws(() => {
    shareDocumentSchema.parse({
      documentId: 1,
      departmentId: 2,
      permission: "invalid-permission",
    });
  });
});
