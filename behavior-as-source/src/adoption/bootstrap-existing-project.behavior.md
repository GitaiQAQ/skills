---
id: adoption.bootstrap-existing-project
status: pending_decision
owner: TODO
introduced_in: TODO
actor: 项目维护者
intent: 在已有项目中建立诚实的首批 Behavior Registry
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

# 在已有项目中建立首批 Behavior

```gherkin
Scenario: 一个已有项目首次采用 Behavior as Source
  Given 项目已有需求、代码和测试但没有 Behavior Registry
  When 维护者选择真实用户流程并建立首批 Behavior
  Then 每条 Behavior 只关联已核实的来源、实现和测试
  And 未经 Owner 确认的历史行为保持 pending_decision 而不自动变成 active
```

## Rationale

来源：Skill 的首次建立 Registry 使用场景。迁移目标是显式暴露已知和未知，不是把现状批量认证为正确需求。
