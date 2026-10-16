---
id: schema.change-with-explicit-migration
status: pending_decision
owner: TODO
introduced_in: TODO
actor: behavior-as-source 维护者
intent: 在修改 Schema 契约时显式处理版本兼容性
implementation:
  - schemas/behavior.schema.json
  - src/schema.mjs
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

# Schema 变化必须提供显式迁移边界

```gherkin
Scenario: 新 Schema 不再兼容上一稳定版本
  Given 已发布版本和消费项目使用现有 Behavior Schema
  When 维护者提出不兼容的字段或枚举变化
  Then 变更说明标明受影响版本、迁移方法和新旧验证边界
  And 维护者不能因旧版本无法解析新输入而静默跳过兼容性 review
```

## Rationale

来源：US-0 的自举风险。Schema 同时约束候选工具和消费项目，破坏性变化必须显式评审。
