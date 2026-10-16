---
id: integration.export-gherkin-losslessly
status: pending_decision
owner: TODO
introduced_in: TODO
actor: BDD 工具集成者
intent: 向社区工具导出 Gherkin 而不丢失场景语义
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

# 无损导出 Gherkin

```gherkin
Scenario: 集成者为外部工具生成 feature 输入
  Given Behavior 包含 Scenario Outline、Examples、Data Table 或 Doc String
  When 集成者从 Behavior Registry 单向导出 Gherkin
  Then 导出结果保留全部场景语义并标明来源 Behavior ID 和 commit
  And 导出文件不成为编辑入口或 Driver 的新事实源
```

## Rationale

来源：US-5 和 Living Documentation 生态分析。社区格式可以作为读取适配层，但不能替代 Markdown Behavior 原文。
