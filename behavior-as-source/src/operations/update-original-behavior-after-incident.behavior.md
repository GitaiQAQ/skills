---
id: operations.update-original-behavior-after-incident
status: pending_decision
owner: TODO
introduced_in: TODO
actor: On-call 或维护者
intent: 把事故中的永久结论写回原 Behavior
implementation:
  - SKILL.md
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

# 事故结论回写原 Behavior

```gherkin
Scenario: 线上结果与已记录行为不一致
  Given 维护者已定位线上版本、原 Behavior、实现和证据
  When 维护者判断问题是实现偏离、规则变化或来源冲突
  Then 实现偏离时保留语义并修复代码，规则变化时由 Owner 修改原 Behavior，来源冲突时标记 conflict
  And 原始日志留在权威系统且 Behavior 只保存可定位引用
```

## Rationale

来源：US-6。事故修复必须更新长期事实，而不是只留在聊天、工单或一次性测试中。
