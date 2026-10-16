---
id: tooling.registry.machine-readable-output
status: pending_decision
owner: TODO
introduced_in: TODO
actor: CI 和自动化调用者
intent: 在不解析人类文本的情况下读取 CLI 结果
implementation:
  - src/cli.mjs
  - scripts/behavior-lint.mjs
  - scripts/behavior-diff.mjs
  - scripts/behavior-impact.mjs
  - scripts/behavior-list.mjs
  - scripts/behavior-locate.mjs
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

# CLI 提供机器可读结果

```gherkin
Scenario: 自动化调用者请求 JSON
  Given 一个 Behavior Registry CLI 已产生确定结果
  When 调用者使用该命令声明的 JSON 选项
  Then 标准输出只包含可解析 JSON
  And 退出码仍按同一结果语义返回
```

## Rationale

来源：CLI README 和 US-4、US-5。机器接口不能依赖表格列宽或自然语言文案。
