---
id: registry.lifecycle.activate-with-complete-proof
status: pending_decision
owner: TODO
introduced_in: TODO
actor: Behavior Owner
intent: 只在实现和证明条件完整时把行为设为 active
implementation:
  - src/fs.mjs
  - src/readiness.mjs
  - src/lint.mjs
  - schemas/behavior.schema.json
driver: npm run test:unit
oracle:
  - tests/parse-lint.test.mjs 验证缺 Owner、实现、passed 证据或隐藏场景引用的 active 条目被拒绝
evidence:
  result: not_run
  run_id: TODO
  minimal_failure: null
hidden_scenarios_ref: TODO
review_log: []
---

# 完整证明后才能激活 Behavior

```gherkin
Scenario: 作者把 Behavior 晋级为 active
  Given Behavior 已有确认 Owner、真实实现、passed 证据和隐藏场景引用
  When 作者把 status 修改为 active
  Then lint 接受没有生效冲突的条目
  And 任一条件缺失时 lint 拒绝该次晋级
```

## Rationale

来源：US-1 和 US-3。`active` 表示已确认且有证据，不等于文件格式正确或代码路径存在。
