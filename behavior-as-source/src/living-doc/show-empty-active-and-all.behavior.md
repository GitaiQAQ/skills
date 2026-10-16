---
id: living-doc.show-empty-active-and-all
status: pending_decision
owner: TODO
introduced_in: TODO
actor: Registry 读者
intent: 在没有 active 行为时仍能查看完整 Registry
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

# 区分 active 空集与完整 Registry

```gherkin
Scenario: 当前版本没有 active Behavior
  Given Registry 包含待决、冲突或已废弃 Behavior 但没有 active Behavior
  When 读者打开 Living Documentation
  Then active 视图显示真实空集
  And 全部行为视图仍允许读者查看现有条目及其未完成原因
```

## Rationale

来源：首个消费项目的真实状态。没有 active 不等于 Registry 为空。
