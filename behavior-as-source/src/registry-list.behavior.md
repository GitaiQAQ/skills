---
id: tooling.registry.list-behaviors
status: pending_decision
owner: TODO
introduced_in: TODO
actor: Behavior Owner
intent: 在编辑规则前查看 Registry 中已有的 Behavior
implementation:
  - src/registry.mjs
  - scripts/behavior-list.mjs
driver: npm run test:unit
oracle:
  - tests/cli.test.mjs 中的 CLI success paths work 断言验证列表包含已知 Behavior ID
evidence:
  result: not_run
  run_id: TODO
  minimal_failure: null
hidden_scenarios_ref: TODO
review_log: []
---

# 按稳定顺序列出 Behavior

```gherkin
Scenario: 按状态或 Owner 查看已有 Behavior
  Given 项目中存在多条带稳定 ID、状态和 Owner 的 Behavior
  When Behavior Owner 按状态或 Owner 查询 Registry
  Then 工具按 Behavior ID 排序返回所有匹配条目及其源文件
```

## Rationale

来源：US-1。Owner 必须先发现已有规则，避免为同一语义创建第二条 Behavior。
