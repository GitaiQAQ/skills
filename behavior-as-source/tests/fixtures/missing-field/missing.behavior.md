---
id: creation.budget.missing
status: pending_decision
owner: TODO
introduced_in: TODO
actor: 用户
intent: 验证缺字段
implementation:
  - ../valid/implementation.js
driver: TODO
evidence:
  result: not_run
  run_id: TODO
  minimal_failure: null
hidden_scenarios_ref: TODO
review_log: []
---

# 缺少 Oracle

```gherkin
Scenario: 缺少必填字段
  Given 条目缺少 Oracle
  When 系统校验条目
  Then 系统报告 Schema 错误
```

## Rationale

测试缺字段规则。
