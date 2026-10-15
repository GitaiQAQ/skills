---
id: creation.budget.vague-filename
status: pending_decision
owner: TODO
introduced_in: TODO
actor: 用户
intent: 验证模糊文件名
implementation:
  - ../valid/implementation.js
driver: TODO
oracle:
  - lint 报告 vague-filename
evidence:
  result: not_run
  run_id: TODO
  minimal_failure: null
hidden_scenarios_ref: TODO
review_log: []
---

# 模糊文件名

```gherkin
Scenario: 文件名没有描述行为
  Given 文件名为 foo
  When 系统校验条目
  Then lint 输出 warning
```

## Rationale

测试模糊文件名。
