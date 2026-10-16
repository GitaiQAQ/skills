---
id: registry.authoring.one-rule-per-file
status: pending_decision
owner: TODO
introduced_in: TODO
actor: Behavior 作者
intent: 为一条可观察规则维护一个唯一 Behavior 文件
implementation:
  - SKILL.md
  - templates/behavior.md
  - src/lint.mjs
driver: npm run test:unit
oracle:
  - tests/parse-lint.test.mjs 验证一个文件不能包含多个 Scenario 或多个 Gherkin block
evidence:
  result: not_run
  run_id: TODO
  minimal_failure: null
hidden_scenarios_ref: TODO
review_log: []
---

# 一个文件只保存一条可观察规则

```gherkin
Scenario: 作者新增 Behavior
  Given 当前需求不能与已有 Behavior 使用同一个稳定 ID 表达
  When 作者创建 Behavior 文件
  Then 文件包含一个一级标题和一个 Gherkin Scenario 或 Scenario Outline
  And 该文件只拥有这一条可观察规则
```

## Rationale

来源：US-1。单条规则边界使 ID、Owner、实现和证据可以独立演进。
