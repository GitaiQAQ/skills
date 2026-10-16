---
id: evidence.use-project-native-driver
status: pending_decision
owner: TODO
introduced_in: TODO
actor: 开发者
intent: 使用项目现有测试栈验证 Behavior
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

# 使用项目原生 Driver 和 Oracle

```gherkin
Scenario: 开发者验证已实现的 Behavior
  Given 消费项目已有可以执行被测动作并判断结果的测试
  When 开发者关联 Behavior 的 driver 和 oracle
  Then Driver 复用该项目的测试命令且 Oracle 指向真实业务断言
  And Skill 不创建 Cucumber Runner 或 step definition
```

## Rationale

来源：US-3。Behavior as Source 管理行为和证据关联，不接管消费项目的测试执行体系。
