import test from "node:test";
import assert from "node:assert";

import { shareDocumentSchema } from "../../src/modules/documents/documents.validators.js";

test("requires departmentId or userId", () => {
  assert.throws(() => {
    shareDocumentSchema.parse({
      documentId: 1,
      permission: "view",
    });
  });
});

test("rejects both departmentId and userId at once", () => {
  assert.throws(() => {
    shareDocumentSchema.parse({
      documentId: 1,
      departmentId: 2,
      userId: "abc-123",
      permission: "view",
    });
  });
});

test("accepts all valid permission types", () => {
  const permissions = ["view", "download", "upload_version", "edit", "share"];

  for (const permission of permissions) {
    const result = shareDocumentSchema.parse({
      documentId: 1,
      departmentId: 3,
      permission,
    });
    assert.equal(result.permission, permission);
  }
});

test("rejects departmentId zero or negative", () => {
  assert.throws(() => {
    shareDocumentSchema.parse({
      documentId: 1,
      departmentId: 0,
      permission: "view",
    });
  });
});
