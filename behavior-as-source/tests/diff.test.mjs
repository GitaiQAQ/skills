import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { compareSteps, diffBehaviorRefs, renderBehaviorDiffMarkdown } from "../src/index.mjs";

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

function richBehavior(value) {
  return `---
id: example.behavior.complete-diff
status: pending_decision
owner: ${value.owner}
introduced_in: v1
changed_in: ${value.version}
actor: 用户
intent: 比较完整行为语义
implementation:
  - implementation.js
driver: ${value.driver}
oracle:
  - ${value.oracle}
evidence:
  result: ${value.evidence}
  run_id: ${value.runId}
  minimal_failure: null
hidden_scenarios_ref: ${value.hidden}
review_log:
  - decision: ${value.review}
---

# ${value.title}

\`\`\`gherkin
Scenario Outline: ${value.scenario}
  Given 输入说明
    \`\`\`
    ${value.docString}
    \`\`\`
  When 提交数据
    | field | value          |
    | mode  | ${value.table} |
  Then 返回 <result>

  Examples:
    | result            |
    | ${value.example}  |
\`\`\`

## Rationale

${value.rationale}
`;
}

test("git ref diff reports complete Gherkin and review metadata changes", () => {
  const repository = fs.mkdtempSync(path.join(os.tmpdir(), "behavior-complete-diff-"));
  try {
    execFileSync("git", ["init", "-q"], { cwd: repository });
    execFileSync("git", ["config", "user.email", "test@example.com"], { cwd: repository });
    execFileSync("git", ["config", "user.name", "Test"], { cwd: repository });
    fs.writeFileSync(path.join(repository, "implementation.js"), "export const value = 1;\n");
    const file = path.join(repository, "complete.behavior.md");
    const before = {
      owner: "Team A", version: "v1", driver: "node old.test.mjs", oracle: "old assertion",
      evidence: "not_run", runId: "old-run.md", hidden: "hidden/old", review: "pending",
      title: "旧标题", scenario: "旧场景", docString: "旧文本", table: "old", example: "old", rationale: "旧理由。",
    };
    const after = {
      owner: "Team B", version: "v2", driver: "node new.test.mjs", oracle: "new assertion",
      evidence: "blocked", runId: "new-run.md", hidden: "hidden/new", review: "approved",
      title: "新标题", scenario: "新场景", docString: "新文本", table: "new", example: "new", rationale: "新理由。",
    };
    fs.writeFileSync(file, richBehavior(before));
    execFileSync("git", ["add", "."], { cwd: repository });
    execFileSync("git", ["commit", "-qm", "before"], { cwd: repository });
    const refA = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repository, encoding: "utf8" }).trim();

    fs.writeFileSync(file, richBehavior(after));
    execFileSync("git", ["commit", "-qam", "after"], { cwd: repository });
    const refB = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repository, encoding: "utf8" }).trim();

    const result = diffBehaviorRefs(refA, refB, repository);
    const [changed] = result.modified;
    assert.deepEqual(
      changed.frontmatter.map((item) => item.field),
      ["owner", "changed_in", "driver", "oracle", "evidence", "hidden_scenarios_ref", "review_log"],
    );
    assert.deepEqual(
      changed.content.map((item) => item.field),
      ["title", "rationale"],
    );
    assert.deepEqual(
      changed.gherkin.map((item) => item.field),
      ["scenario_name", "examples", "data_tables", "doc_strings"],
    );
    const markdown = renderBehaviorDiffMarkdown(result);
    assert.match(markdown, /Gherkin examples/);
    assert.match(markdown, /review_log/);
  } finally {
    fs.rmSync(repository, { recursive: true, force: true });
  }
});
