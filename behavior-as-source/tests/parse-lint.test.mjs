import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { lintBehavior, lintBehaviorRegistry, parseBehaviorDir, parseBehaviorFile } from "../src/index.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixtureRoot = path.join(root, "tests/fixtures");

function file(group, name) {
  const groupRoot = path.join(fixtureRoot, group);
  return parseBehaviorFile(path.join(groupRoot, name), groupRoot);
}

test("valid Markdown and Gherkin behavior passes lint", () => {
  const behavior = file("valid", "initialize.behavior.md");
  assert.equal(behavior.title, "Create 模式初始化预算");
  assert.equal(behavior.scenarioCount, 1);
  assert.deepEqual(lintBehavior(behavior), []);
});

test("file rules report the required failures", () => {
  assert.ok(lintBehavior(file("missing-field", "missing.behavior.md")).some((item) => item.rule === "schema"));
  assert.ok(lintBehavior(file("multi-block", "multiple.behavior.md")).some((item) => item.rule === "gherkin-count"));
  assert.ok(lintBehavior(file("multi-scenario", "multiple.behavior.md")).some((item) => item.rule === "scenario-count"));
  assert.ok(lintBehavior(file("active-gate", "invalid.behavior.md")).some((item) => item.rule === "active-gate"));
  assert.ok(lintBehavior(file("vague", "foo.behavior.md")).some((item) => item.rule === "vague-filename" && item.severity === "warning"));
});

test("registry reports duplicate IDs", () => {
  const files = parseBehaviorDir(path.join(fixtureRoot, "duplicate"));
  const duplicates = lintBehaviorRegistry(files).filter((item) => item.rule === "id-unique");
  assert.equal(duplicates.length, 2);
});
