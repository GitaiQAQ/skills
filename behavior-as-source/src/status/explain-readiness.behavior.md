---
id: tooling.registry.explain-readiness
status: pending_decision
owner: TODO
introduced_in: TODO
actor: Behavior 维护者
intent: 查看一条 Behavior 为什么尚未满足晋级条件
implementation:
  - src/fs.mjs
  - src/readiness.mjs
  - src/impact.mjs
  - scripts/behavior-impact.mjs
driver: node --test tests/impact.test.mjs
oracle:
  - tests/impact.test.mjs 验证生命周期、Owner review、证据适用性和 active 缺失条件分开返回
evidence:
  result: not_run
  run_id: TODO
  minimal_failure: null
hidden_scenarios_ref: TODO
review_log: []
---

# 解释 Behavior 的当前状态和缺失条件

```gherkin
Scenario: 维护者查看一条未完成的 Behavior
  Given Behavior 的生命周期、Owner review、实现、证据和隐藏场景条件不完全相同
  When 维护者查询该 Behavior 的详情
  Then 工具分别显示每项事实和未满足条件
  And 工具不把未知、缺失或历史失败合并成新的持久化状态
```

## Rationale

来源：US-1、US-2 和最初的状态查看需求。使用者需要知道“还缺什么”，而不是只看到一个生命周期枚举。
