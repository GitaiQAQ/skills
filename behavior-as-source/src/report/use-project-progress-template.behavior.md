---
id: tooling.registry.use-project-progress-template
status: active
owner: 3o
introduced_in: 0.0.2
actor: Behavior Registry 维护者
intent: 用消费项目自己的模板生成三层分列的阶段进度报告，不把项目事实复制进通用 Skill
implementation:
  - SKILL.md
  - README.md
driver: node --test tests/report-methodology.test.mjs
oracle:
  - tests/report-methodology.test.mjs 断言项目报告分列规格成熟度、交付进展和测试证据
  - tests/report-methodology.test.mjs 断言项目模板声明分母版本、单位和完整状态映射
  - tests/report-methodology.test.mjs 断言通用 Skill 不持久化消费项目的阶段事实
evidence:
  result: passed
  run_id: evidence/tooling.registry.progress-report-methodology.md
  minimal_failure: null
hidden_scenarios_ref: evidence/tooling.registry.progress-report-methodology.md
review_log:
  - date: "2026-10-16"
    reviewer: 3o
    decision: approved
---

# 使用项目模板生成三层分列的进度报告

```gherkin
Scenario: 项目状态可映射时从消费项目模板生成阶段进度报告
  Given 项目中的 Behavior Registry 通过标准校验
  And 项目根目录存在 .agents/templates/progress-report.md
  And 模板声明分母版本、单位和阶段状态映射
  When Agent 使用 behavior-as-source 的 report 能力生成报告
  Then 报告遵循项目模板声明的阶段来源、计算口径和输出骨架
  And 报告分列规格成熟度、交付进展和测试证据
  And 报告声明场景通过率不等于项目完成率
  And 通用 Skill 不复制或持久化项目阶段事实
```

## Rationale

来源：消费项目需要把进度与工作量报告归入 Behavior report 能力，同时让项目模板继续拥有项目专用口径。进度报告方法论要求分母版本、单位和状态映射由项目模板声明。
