---
id: living-doc.refuse-stale-output
status: pending_decision
owner: TODO
introduced_in: TODO
actor: Living Documentation 发布任务
intent: 生成失败时不把旧页面标为当前版本
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

# 生成失败时拒绝陈旧页面

```gherkin
Scenario: 当前 commit 的静态文档生成失败
  Given 已发布页面来自较早 commit
  When 当前 commit 的 Registry 无法校验或渲染
  Then 发布任务返回失败且不把旧页面标记为当前版本
  And 读者仍能识别旧页面的来源 commit
```

## Rationale

来源：US-5。可用的旧页面不能冒充当前事实，否则阅读体验会掩盖发布失败。
