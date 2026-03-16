import test from "node:test";
import assert from "node:assert";

function getNextVersion(current: number | null) {
  return (current ?? 0) + 1;
}

test("increments version correctly", () => {
  const next = getNextVersion(1);

  assert.equal(next, 2);
});

test("starts version at 1", () => {
  const next = getNextVersion(null);

  assert.equal(next, 1);
});