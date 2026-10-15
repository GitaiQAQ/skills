---
id: creation.budget.active-gate
status: active
owner: TODO
introduced_in: v1
actor: 用户
intent: 验证 active 门禁
implementation:
  - ../valid/implementation.js
driver: node --test
oracle:
  - 测试断言
evidence:
  result: not_run
  run_id: TODO
  minimal_failure: null
hidden_scenarios_ref: TODO
review_log: []
---

# 无效 active 条目

```gherkin
Scenario: active 条目缺少晋级条件
  Given Owner 和证据尚未准备
  When 条目标为 active
  Then lint 报告 active-gate
```

## Rationale

测试 active 门禁。
