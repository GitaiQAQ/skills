---
id: tooling.diff.report-complete-change
status: pending_decision
owner: TODO
introduced_in: TODO
actor: MR Reviewer
intent: 查看会影响行为判断的完整版本差异
implementation:
  - src/fs.mjs
  - src/parse.mjs
  - src/diff.mjs
  - scripts/behavior-diff.mjs
driver: node --test tests/diff.test.mjs
oracle:
  - tests/diff.test.mjs 中的 git ref diff reports complete Gherkin and review metadata changes 断言
evidence:
  result: not_run
  run_id: TODO
  minimal_failure: null
hidden_scenarios_ref: TODO
review_log: []
---

# 报告完整 Behavior 语义差异

```gherkin
Scenario: 两个 Git ref 中的 Behavior 发生变化
  Given Reviewer 固定了 base ref 和 head ref
  When Reviewer 运行 behavior-diff
  Then 结果报告 Gherkin、生命周期、Owner、实现、Driver、Oracle、证据和 review 的变化
  And Examples、Data Table 或 Doc String 的变化不会被报告为无变化
```

## Rationale

来源：US-4。Review 摘要必须覆盖完整 Gherkin 参数和影响判断的元数据，不能把未比较字段显示为无变化。
