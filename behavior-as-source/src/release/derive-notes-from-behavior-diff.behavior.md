---
id: release.derive-notes-from-behavior-diff
status: pending_decision
owner: TODO
introduced_in: TODO
actor: 发布维护者
intent: 从固定版本差异生成可追踪的行为变更说明
implementation:
  - SKILL.md
driver: 使用 behavior-diff 比较两个固定 Git ref，并按 Skill 规则生成版本说明
oracle:
  - 版本说明按新增、修改和废弃列出稳定 Behavior ID
  - 版本说明不把行为变化写成实现、测试或发布事实
evidence:
  result: not_run
  run_id: TODO
  minimal_failure: null
hidden_scenarios_ref: TODO
review_log: []
---

# 从 Behavior diff 生成版本说明

```gherkin
Scenario: 发布维护者比较两个发布版本
  Given 两个发布版本都能解析其 Behavior Registry
  When 维护者生成行为版本说明
  Then 说明只列出新增、语义修改和废弃的稳定 Behavior ID
  And 每项可以回到对应版本的 Behavior 原文
```

## Rationale

来源：Skill 的版本说明使用场景。版本说明是可重建的读取产物，不拥有行为语义。
