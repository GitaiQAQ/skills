---
id: registry.lifecycle.deprecate-with-history
status: pending_decision
owner: TODO
introduced_in: TODO
actor: Behavior Owner
intent: 停止承诺行为时保留历史身份和理由
implementation:
  - SKILL.md
  - src/diff.mjs
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

# 废弃 Behavior 时保留历史

```gherkin
Scenario: Owner 停止承诺一条行为
  Given Registry 中存在一条不再适用的 Behavior
  When Owner 废弃该行为
  Then 作者保留文件和稳定 ID，并记录 deprecated_in 与理由
  And 版本差异把它显示为废弃而不是删除
```

## Rationale

来源：US-1 和 Release Notes 流程。保留条目才能解释旧版本曾承诺什么以及为何停止。
