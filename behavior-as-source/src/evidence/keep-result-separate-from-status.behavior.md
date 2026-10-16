---
id: evidence.keep-result-separate-from-status
status: pending_decision
owner: TODO
introduced_in: TODO
actor: Behavior 维护者
intent: 分开记录生命周期与某次验证结果
implementation:
  - schemas/behavior.schema.json
  - templates/registry-report.md
driver: 使用 behavior-as-source 读取有效 Registry 并填写 templates/registry-report.md
oracle:
  - 最终 Markdown 分别输出 status 与 evidence 统计
evidence:
  result: not_run
  run_id: TODO
  minimal_failure: null
hidden_scenarios_ref: TODO
review_log: []
---

# 验证结果不自动改变生命周期

```gherkin
Scenario: Driver 产生一次验证结果
  Given Behavior 有独立的 status 和 evidence 字段
  When 维护者记录 passed、failed、blocked 或 not_run 结果
  Then 工具保留原生命周期并单独展示验证结果
  And 命令成功不自动把 Behavior 改为 active 或 passed
```

## Rationale

来源：US-3 和成熟度报告约束。生命周期、执行结果和产品发布状态是不同事实。
