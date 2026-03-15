import test from "node:test";
import assert from "node:assert";

import { createDocumentSchema } from "../../src/modules/documents/documents.validators.js";

test("accepts valid document creation", () => {
  const result = createDocumentSchema.parse({
    title: "Budget 2025",
    departmentId: 1,
  });

  assert.equal(result.title, "Budget 2025");
});

test("rejects empty title", () => {
  assert.throws(() => {
    createDocumentSchema.parse({
      title: "",
      departmentId: 1,
    });
  });
});

test("rejects missing department", () => {
  assert.throws(() => {
    createDocumentSchema.parse({
      title: "Budget",
    });
  });
});
