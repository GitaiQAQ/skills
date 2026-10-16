---
id: tooling.diff.reject-direct-deletion
status: pending_decision
owner: TODO
introduced_in: TODO
actor: MR Reviewer
intent: 阻止 Behavior 通过删除文件丢失历史
implementation:
  - src/fs.mjs
  - src/diff.mjs
  - scripts/behavior-diff.mjs
driver: npm run test:unit
oracle:
  - tests/diff.test.mjs 中的 git ref diff reports changed steps and direct deletion 断言
evidence:
  result: not_run
  run_id: TODO
  minimal_failure: null
hidden_scenarios_ref: TODO
review_log: []
---

# 直接删除 Behavior 时使 diff 失败

```gherkin
Scenario: head ref 不再包含 base ref 中的 Behavior ID
  Given base ref 包含一条 Behavior
  When head ref 直接删除其文件而没有标记 deprecated
  Then behavior-diff 报告非法删除并返回非零退出码
```

## Rationale

来源：US-4。删除文件会切断旧版本的可追踪历史，废弃必须保留原条目。
