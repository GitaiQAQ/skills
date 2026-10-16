---
id: adoption.keep-consumer-facts-local
status: pending_decision
owner: TODO
introduced_in: TODO
actor: 消费项目维护者
intent: 让项目行为和通用工具各自只有一个事实所有者
implementation:
  - SKILL.md
  - references/project-adoption.md
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

# 消费项目保留自己的行为事实

```gherkin
Scenario: 项目接入通用 Behavior 工具
  Given 通用 package 提供 Schema、parser 和 CLI
  When 消费项目建立或修改 Behavior Registry
  Then 消费项目只在本仓维护 Behavior、Owner、实现、Driver、Oracle 和证据
  And 通用 Skill 不复制或持久化消费项目的行为事实
```

## Rationale

来源：Skill Notes 的所有权边界。通用实现和项目事实分开，才能避免多份 Registry 漂移。
