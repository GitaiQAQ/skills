---
id: adoption.upgrade-by-version
status: pending_decision
owner: TODO
introduced_in: TODO
actor: 消费项目维护者
intent: 通过明确版本升级 Behavior CLI 和 Skill
implementation:
  - README.md
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

# 消费项目按版本升级通用能力

```gherkin
Scenario: 消费项目采用新的 behavior-as-source 版本
  Given 新版本已通过源码自检和发布包复验
  When 项目维护者更新固定 package 或 Skill 版本
  Then 项目使用新版本重新校验自己的 Registry
  And 维护者不直接修改 node_modules 或用户级安装副本制造本地能力
```

## Rationale

来源：真实发布和消费流程。版本升级必须可复现，安装副本不能成为未发布修复的事实源。
