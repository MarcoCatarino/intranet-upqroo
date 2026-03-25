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

test("accepts share with userId", () => {
  const result = shareDocumentSchema.parse({
    documentId: 1,
    userId: "abc-123",
    permission: "view",
  });

  assert.equal(result.userId, "abc-123");
});

test("rejects share without departmentId or userId", () => {
  assert.throws(() => {
    shareDocumentSchema.parse({
      documentId: 1,
      permission: "view",
    });
  });
});

test("rejects share with both departmentId and userId", () => {
  assert.throws(() => {
    shareDocumentSchema.parse({
      documentId: 1,
      departmentId: 2,
      userId: "abc-123",
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
