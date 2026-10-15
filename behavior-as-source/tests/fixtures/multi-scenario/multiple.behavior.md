---
id: creation.budget.multi-scenario
status: pending_decision
owner: TODO
introduced_in: TODO
actor: 用户
intent: 验证多个 Scenario
implementation:
  - ../valid/implementation.js
driver: TODO
oracle:
  - lint 报告 scenario-count
evidence:
  result: not_run
  run_id: TODO
  minimal_failure: null
hidden_scenarios_ref: TODO
review_log: []
---

# 多个 Scenario

```gherkin
Scenario: 第一个行为
  Given 第一个条件
  When 执行动作
  Then 得到结果

Scenario: 第二个行为
  Given 第二个条件
  When 执行动作
  Then 得到结果
```

## Rationale

测试 Scenario 数量规则。
