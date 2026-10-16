---
id: tooling.registry.reject-invalid-files
status: pending_decision
owner: TODO
introduced_in: TODO
actor: Behavior 维护者
intent: 在 review 前拒绝不符合 Registry 契约的文件
implementation:
  - src/fs.mjs
  - schemas/behavior.schema.json
  - src/parse.mjs
  - src/readiness.mjs
  - src/lint.mjs
  - scripts/behavior-lint.mjs
driver: npm run test:unit
oracle:
  - tests/parse-lint.test.mjs 验证 Schema、Gherkin 数量、Scenario 数量、ID 唯一性和 active 门禁错误
evidence:
  result: not_run
  run_id: TODO
  minimal_failure: null
hidden_scenarios_ref: TODO
review_log: []
---

# 拒绝不符合契约的 Behavior 文件

```gherkin
Scenario: 校验整个 Registry
  Given 项目包含 Markdown frontmatter 和 Gherkin Behavior 文件
  When 维护者运行 behavior-lint
  Then 工具报告每个结构、Schema、路径和生命周期门禁问题
  And 任一 error 使命令返回非零退出码
```

## Rationale

来源：US-0 和 US-1。结构校验只判断 Registry 契约，不把 lint 成功解释为业务行为通过。
