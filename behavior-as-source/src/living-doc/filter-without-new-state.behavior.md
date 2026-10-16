---
id: living-doc.filter-without-new-state
status: pending_decision
owner: TODO
introduced_in: TODO
actor: Registry 读者
intent: 按角色需要筛选行为而不创建第二套状态
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

# 角色视图只筛选同一 Registry

```gherkin
Scenario: 不同角色按 ID、Owner、状态或证据筛选行为
  Given Living Documentation 来自一个固定 commit 的同一 Registry
  When 产品、开发、QA 或 On-call 选择适合自己的筛选条件
  Then 每个视图只改变可见条目而不改变 Behavior 字段或状态解释
  And 所有视图都能回到同一源文件和来源 commit
```

## Rationale

来源：US-5。角色视图是读取预设，不是新的 Registry、权限系统或生命周期。
