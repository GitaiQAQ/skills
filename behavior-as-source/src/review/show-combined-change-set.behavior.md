---
id: review.show-combined-change-set
status: pending_decision
owner: TODO
introduced_in: TODO
actor: MR Reviewer
intent: 联合审查规则、实现、测试和证据变化
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

# MR 展示完整行为变更集

```gherkin
Scenario: MR 改变 Behavior 或其实现证明
  Given CI 已固定 MR 的 base commit 和 head commit
  When Reviewer 查看行为审查结果
  Then 结果把 Behavior 原文差异、实现差异、Oracle、证据版本和未满足条件关联到同一 Behavior ID
  And 摘要失败时仍保留原始 Git diff 且不显示无行为变化
```

## Rationale

来源：US-4。Owner 的语义批准、代码 review 和运行证据必须同时可见，但彼此不能替代。
