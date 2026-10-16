---
id: tooling.registry.refuse-unmapped-progress-state
status: active
owner: 3o
introduced_in: unreleased
actor: 项目进度报告维护者
intent: 在阶段状态没有明确映射时避免生成臆测的完成百分比
implementation:
  - SKILL.md
  - README.md
driver: node --test tests/report-methodology.test.mjs
oracle:
  - tests/report-methodology.test.mjs 断言未映射状态使交付进展显示为 unknown，且不输出完成百分比
  - tests/report-methodology.test.mjs 断言项目模板必须声明完整状态映射
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

# 拒绝用未映射状态计算进度

```gherkin
Scenario: 阶段来源包含模板未定义的状态词
  Given 项目根目录存在 .agents/templates/progress-report.md
  And 阶段来源包含未映射到模板计算口径的状态词
  When Agent 使用 behavior-as-source 的 report 能力生成报告
  Then 报告指出未映射的状态词和来源文件
  And 报告把交付进展显示为 unknown
  And 报告不输出完成百分比
```

## Rationale

来源：`.agents/notes/proposed/process/2026-10-16-behavior-progress-report-methodology.md`。阶段状态词是消费项目的私有口径；缺少明确映射时，报告不能把符号猜测为完成、部分完成或阻塞。
