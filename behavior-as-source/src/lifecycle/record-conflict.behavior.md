---
id: registry.lifecycle.record-conflict
status: pending_decision
owner: TODO
introduced_in: TODO
actor: Behavior 作者
intent: 在有效来源相互冲突时阻止静默选边
implementation:
  - SKILL.md
  - schemas/behavior.schema.json
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

# 显式记录相互冲突的行为

```gherkin
Scenario: 两个有效来源要求不同结果
  Given 作者发现两个不能同时成立的 Behavior 要求
  When Owner 尚未裁决冲突
  Then 相关条目标为 conflict 并通过 conflicts_with 相互定位
  And Agent 不自行选择其中一条作为 active
```

## Rationale

来源：US-1 和 US-6。冲突是待裁决事实，不是 lint 可以自动解决的格式问题。
