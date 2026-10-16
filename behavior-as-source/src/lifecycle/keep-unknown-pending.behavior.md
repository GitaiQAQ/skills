---
id: registry.lifecycle.keep-unknown-pending
status: pending_decision
owner: TODO
introduced_in: TODO
actor: Agent 或 Behavior 作者
intent: 在需求或 Owner 未确认时保留未知状态
implementation:
  - SKILL.md
  - templates/behavior.md
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

# 未确认的行为保持待决

```gherkin
Scenario: 来源不足以确认行为
  Given 作者无法从用户或授权记录确认 Owner 或完整语义
  When 作者记录这条候选 Behavior
  Then 条目使用 owner TODO 和 status pending_decision
  And Agent 不根据历史实现自行批准该行为
```

## Rationale

来源：US-1 和 Skill 的 Owner 边界。未知必须保持可见，不能通过默认值变成已确认事实。
