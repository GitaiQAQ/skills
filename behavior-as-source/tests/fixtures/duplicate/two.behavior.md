---
id: creation.budget.duplicate
status: pending_decision
owner: TODO
introduced_in: TODO
actor: 用户
intent: 验证重复 ID
implementation:
  - ../valid/implementation.js
driver: TODO
oracle:
  - lint 报告 id-unique
evidence:
  result: not_run
  run_id: TODO
  minimal_failure: null
hidden_scenarios_ref: TODO
review_log: []
---

# 重复 ID 二

```gherkin
Scenario: 第二条重复行为
  Given 两个文件使用同一 ID
  When 系统校验 Registry
  Then 系统报告重复 ID
```

## Rationale

测试重复 ID。
