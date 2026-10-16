---
id: registry.lifecycle.preserve-id-on-change
status: pending_decision
owner: TODO
introduced_in: TODO
actor: Behavior Owner
intent: 修改行为语义时保留可追踪身份
implementation:
  - SKILL.md
  - schemas/behavior.schema.json
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

# 语义变化保留 Behavior ID

```gherkin
Scenario: Owner 修改现有规则
  Given 一条稳定 Behavior 已表达同一业务规则
  When Owner 修改其可观察结果
  Then 作者保留原 Behavior ID 并更新 changed_in 和修改理由
  And 作者不创建第二条 Behavior 掩盖历史变化
```

## Rationale

来源：US-1。稳定 ID 使需求、实现、证据和版本差异保持连续。
