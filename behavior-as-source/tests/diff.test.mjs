import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { compareSteps, diffBehaviorRefs } from "../src/index.mjs";

const before = [
  { keyword: "Given", text: "a" },
  { keyword: "Then", text: "old" },
];
const after = [
  { keyword: "Given", text: "a" },
  { keyword: "Then", text: "new" },
  { keyword: "And", text: "saved" },
];

test("step diff identifies modifications and additions", () => {
  assert.deepEqual(compareSteps(before, after).map((item) => item.kind), ["modified", "added"]);
});

function behavior(result) {
  return `---
id: example.behavior.change
status: pending_decision
owner: TODO
introduced_in: v1
actor: 用户
intent: 比较行为
implementation: []
driver: TODO
oracle:
  - 比较 Then
evidence:
  result: not_run
  run_id: TODO
  minimal_failure: null
hidden_scenarios_ref: TODO
review_log: []
---

# 比较行为

\`\`\`gherkin
Scenario: 比较结果
  Given 固定输入
  When 执行动作
  Then ${result}
\`\`\`

## Rationale

测试 Git ref diff。
`;
}

test("git ref diff reports changed steps and direct deletion", () => {
  const repository = fs.mkdtempSync(path.join(os.tmpdir(), "behavior-diff-"));
  try {
    execFileSync("git", ["init", "-q"], { cwd: repository });
    execFileSync("git", ["config", "user.email", "test@example.com"], { cwd: repository });
    execFileSync("git", ["config", "user.name", "Test"], { cwd: repository });
    const file = path.join(repository, "change.behavior.md");
    fs.writeFileSync(file, behavior("旧结果"));
    execFileSync("git", ["add", "."], { cwd: repository });
    execFileSync("git", ["commit", "-qm", "before"], { cwd: repository });
    const refA = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repository, encoding: "utf8" }).trim();

    fs.writeFileSync(file, behavior("新结果"));
    execFileSync("git", ["commit", "-qam", "after"], { cwd: repository });
    const refB = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repository, encoding: "utf8" }).trim();
    const changed = diffBehaviorRefs(refA, refB, repository);
    assert.equal(changed.modified.length, 1);
    assert.equal(changed.modified[0].steps[0].kind, "modified");

    fs.rmSync(file);
    execFileSync("git", ["commit", "-qam", "delete"], { cwd: repository });
    const refC = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repository, encoding: "utf8" }).trim();
    assert.equal(diffBehaviorRefs(refB, refC, repository).errors.length, 1);
  } finally {
    fs.rmSync(repository, { recursive: true, force: true });
  }
});
