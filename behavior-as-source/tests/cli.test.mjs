import assert from "node:assert/strict";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const valid = path.join(root, "tests/fixtures/valid");

function run(script, args, status = 0) {
  const result = spawnSync(process.execPath, [path.join(root, "scripts", script), ...args], {
    cwd: root,
    encoding: "utf8",
  });
  assert.equal(result.status, status, `${script} ${args.join(" ")}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
  return result;
}

test("CLI success paths work", () => {
  assert.match(run("behavior-lint.mjs", [valid]).stdout, /0 errors/);
  assert.match(run("behavior-list.mjs", [valid]).stdout, /creation\.budget\.initialize/);
  assert.match(run("behavior-locate.mjs", ["creation.budget.initialize", valid]).stdout, /initialize\.behavior\.md/);
  assert.match(run("behavior-impact.mjs", ["--path", "implementation.js", "--root", valid]).stdout, /creation\.budget\.initialize/);
  const review = run("behavior-review.mjs", ["status", "--links"]).stdout;
  assert.match(review, /Needs review: \d+/);
  assert.match(review, /adoption\.use-node-api/);
  assert.match(review, /\u001b\]8;;file:\/\//);
  const yaml = run("behavior-review.mjs", ["status", "--yaml"]).stdout;
  assert.match(yaml, /^total: \d+$/m);
  assert.match(yaml, /^items:$/m);
  assert.match(yaml, /- id: adoption\.use-node-api/);
  assert.match(yaml, /status: pending_decision/);
  assert.match(yaml, /reasons:/);
  assert.match(yaml, /path: src\/adoption\/use-node-api\.behavior\.md/);
  assert.doesNotMatch(yaml, /\u001b\]8;;/);
  const details = run("behavior-impact.mjs", ["--id", "creation.budget.initialize", "--root", valid, "--json"]).stdout;
  assert.match(details, /"status": "active"/);
  assert.match(details, /"evidence_applicability": "unknown"/);
  assert.match(details, /"missing_for_active": \[\]/);
});

test("CLI uses exit code 1 for registry problems and 2 for usage errors", () => {
  run("behavior-lint.mjs", [path.join(root, "tests/fixtures/missing-field")], 1);
  run("behavior-locate.mjs", ["missing", valid], 1);
  run("behavior-impact.mjs", [], 2);
  run("behavior-review.mjs", ["status", "--yaml", "--links"], 2);
});
