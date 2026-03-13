import test from "node:test";
import assert from "node:assert";

import { validateInstitutionEmail } from "../../src/modules/auth/auth.domain.js";

test("allows institutional email", () => {
  assert.doesNotThrow(() => {
    validateInstitutionEmail("user@upqroo.edu.mx");
  });
});

test("rejects external email", () => {
  assert.throws(() => {
    validateInstitutionEmail("user@gmail.com");
  });
});
