---
id: tooling.registry.report-maturity
status: active
owner: 3o
introduced_in: 0.0.2
actor: Behavior Registry 维护者
intent: 使用统一口径查看 Registry 规格成熟度，不把它误写成项目交付进展或测试证据
implementation:
  - SKILL.md
  - templates/registry-report.md
  - README.md
driver: node --test tests/report-methodology.test.mjs
oracle:
  - tests/report-methodology.test.mjs 断言通用 Registry 报告只回答规格成熟度
  - tests/report-methodology.test.mjs 断言通用模板不输出项目交付进展、场景通过率或项目完成百分比
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

# 报告 Registry 规格成熟度

```gherkin
Scenario: 从有效 Registry 生成规格成熟度快照
  Given 项目中的 Behavior Registry 通过标准校验
  When Agent 按 Registry 报告模板生成当前快照
  Then 报告分别列出 status、evidence 和隐藏场景引用统计
  And 报告声明规格成熟度不等于项目交付完成度或场景通过率
```

## Rationale

来源：首个真实消费项目曾用本地脚本解析 Behavior frontmatter 并渲染报告。进度报告方法论要求把规格成熟度、交付进展和测试证据分列；本条只定义 Registry 规格成熟度。项目路线图、分母和交付口径仍由消费项目拥有。
