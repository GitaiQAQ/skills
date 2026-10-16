---
id: review.keep-approvals-separate
status: pending_decision
owner: TODO
introduced_in: TODO
actor: MR Reviewer
intent: 区分行为语义批准、代码审查和执行证据
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

# 分开显示三类批准和证明

```gherkin
Scenario: MR 同时包含 Owner review、代码 review 和测试结果
  Given 三类记录来自不同角色或系统
  When Reviewer 查看 Behavior 的审查状态
  Then 结果分别显示语义批准、代码审查和执行证据的来源
  And 任一记录不能自动替代另外两类记录
```

## Rationale

来源：US-4。联合展示用于发现缺口，不用于把不同授权和证明合并成一个 approved 标志。
