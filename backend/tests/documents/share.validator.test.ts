import test from "node:test";
import assert from "node:assert";

import { shareDocumentSchema } from "../../src/modules/documents/documents.validators.js";

test("rejects both user and department", () => {
  assert.throws(() => {
    shareDocumentSchema.parse({
      documentId: 1,
      userId: "uuid",
      departmentId: 1,
      permission: "view",
    });
  });
});
