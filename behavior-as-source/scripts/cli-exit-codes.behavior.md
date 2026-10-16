---
id: tooling.registry.cli-exit-codes
status: pending_decision
owner: TODO
introduced_in: TODO
actor: CI 调用者
intent: 用稳定退出码区分成功、Registry 问题和参数错误
implementation:
  - src/cli.mjs
  - scripts/behavior-lint.mjs
  - scripts/behavior-diff.mjs
  - scripts/behavior-impact.mjs
  - scripts/behavior-list.mjs
  - scripts/behavior-locate.mjs
  - scripts/behavior-review.mjs
driver: npm run test:unit
oracle:
  - tests/cli.test.mjs 中的 CLI uses exit code 1 for registry problems and 2 for usage errors 断言
evidence:
  result: not_run
  run_id: TODO
  minimal_failure: null
hidden_scenarios_ref: TODO
review_log: []
---

# CLI 使用稳定退出码

```gherkin
Scenario Outline: 调用方判断 CLI 结果
  Given 调用方执行一个 Behavior Registry CLI
  When 命令结果属于 <result>
  Then 进程退出码为 <exit_code>

  Examples:
    | result        | exit_code |
    | 成功          | 0         |
    | Registry 问题 | 1         |
    | 参数错误      | 2         |
```

## Rationale

来源：CLI README 和 US-0、US-4。CI 必须能稳定区分输入用法错误与 Registry 本身的问题。
