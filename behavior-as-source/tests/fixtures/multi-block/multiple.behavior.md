---
id: creation.budget.multi-block
status: pending_decision
owner: TODO
introduced_in: TODO
actor: 用户
intent: 验证多个 block
implementation:
  - ../valid/implementation.js
driver: TODO
oracle:
  - lint 报告 gherkin-count
evidence:
  result: not_run
  run_id: TODO
  minimal_failure: null
hidden_scenarios_ref: TODO
review_log: []
---

# 多个 Gherkin block

```gherkin
Scenario: 第一个行为
  Given 第一个条件
  When 执行动作
  Then 得到结果
```

```gherkin
Scenario: 第二个行为
  Given 第二个条件
  When 执行动作
  Then 得到结果
```

## Rationale

测试 block 数量规则。
