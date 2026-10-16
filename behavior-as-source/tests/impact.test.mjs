import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { behaviorDetails, parseBehaviorFile, parseBehaviorSource } from "../src/index.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function pendingBehavior() {
  return parseBehaviorSource(
    path.join(root, "pending.behavior.md"),
    `---
id: example.pending
status: pending_decision
owner: TODO
introduced_in: v1
actor: 用户
intent: 查看缺失条件
implementation: []
driver: TODO
oracle:
  - TODO
evidence:
  result: not_run
  run_id: TODO
  minimal_failure: null
hidden_scenarios_ref: TODO
review_log: []
---

# 待决行为

\`\`\`gherkin
Scenario: 查看待决状态
  Given 行为尚未完成
  When 用户查看详情
  Then 工具列出缺失条件
\`\`\`
`,
    root,
  );
}

test("behavior details separate lifecycle, review, evidence, and active readiness", () => {
  const details = behaviorDetails(pendingBehavior());
  assert.equal(details.status, "pending_decision");
  assert.equal(details.owner, "TODO");
  assert.deepEqual(details.review_log, []);
  assert.deepEqual(details.evidence, { result: "not_run", run_id: "TODO", minimal_failure: null });
  assert.equal(details.evidence_applicability, "not_available");
  assert.deepEqual(details.missing_for_active, [
    "owner_confirmation",
    "implementation",
    "passed_evidence",
    "evidence_record",
    "hidden_scenarios",
  ]);
});

test("active behavior keeps historical evidence separate from version applicability", () => {
  const fixtureRoot = path.join(root, "tests/fixtures/valid");
  const details = behaviorDetails(parseBehaviorFile(path.join(fixtureRoot, "initialize.behavior.md"), fixtureRoot));
  assert.equal(details.status, "active");
  assert.equal(details.evidence.result, "passed");
  assert.equal(details.evidence_applicability, "unknown");
  assert.deepEqual(details.missing_for_active, []);
});
