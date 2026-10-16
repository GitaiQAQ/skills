---
id: evidence.show-version-applicability
status: pending_decision
owner: TODO
introduced_in: TODO
actor: Reviewer 或 Registry 读者
intent: 判断历史证据是否适用于当前源码版本
implementation:
  - src/fs.mjs
  - src/impact.mjs
driver: node --test tests/impact.test.mjs
oracle:
  - tests/impact.test.mjs 验证历史 passed 与当前版本适用性分开显示
evidence:
  result: not_run
  run_id: TODO
  minimal_failure: null
hidden_scenarios_ref: TODO
review_log: []
---

# 显示证据与当前版本的适用关系

```gherkin
Scenario: Behavior 引用了其他版本产生的 passed 证据
  Given 当前源码版本与证据记录的验证版本不同
  When Reviewer 查看 Behavior 状态
  Then 工具把历史结果显示为 passed 并把当前适用性显示为过期或未知
  And 工具不把历史 passed 显示为当前版本已通过
```

## Rationale

来源：US-4 和 US-5。证据结果是历史事实；是否适用于当前输入必须单独判断。
