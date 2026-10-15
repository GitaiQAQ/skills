---
id: creation.budget.initialize
status: active
owner: Creation Team
introduced_in: v1
actor: 创建广告的用户
intent: 获得可提交的预算初始值
implementation:
  - implementation.js
driver: node --test initialize.test.js
oracle:
  - initialize.test.js 校验预算初始值
evidence:
  result: passed
  run_id: evidence.md
  minimal_failure: null
hidden_scenarios_ref: hidden/budget-initialize
review_log: []
---

# Create 模式初始化预算

```gherkin
Scenario: 使用账户配置初始化预算
  Given 页面处于 Create 模式
  When 系统初始化预算
  Then 预算具有可提交的初始值
```

## Rationale

来源：fixture product rule。
