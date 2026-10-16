---
id: tooling.registry.locate-unique-id
status: pending_decision
owner: TODO
introduced_in: TODO
actor: Behavior 使用者
intent: 从稳定 Behavior ID 定位唯一源文件
implementation:
  - src/registry.mjs
  - scripts/behavior-locate.mjs
driver: npm run test:unit
oracle:
  - tests/cli.test.mjs 验证已知 ID 返回对应文件且未知 ID 返回退出码 1
evidence:
  result: not_run
  run_id: TODO
  minimal_failure: null
hidden_scenarios_ref: TODO
review_log: []
---

# 从 ID 定位唯一 Behavior 文件

```gherkin
Scenario: 定位一个 Behavior
  Given Registry 中一个 Behavior ID 只对应一个源文件
  When 使用者按该 ID 查询位置
  Then 工具返回唯一源文件路径
  And ID 缺失或重复时返回明确错误而不选择任意文件
```

## Rationale

来源：US-1、US-2 和 US-6。稳定 ID 必须能可靠回到唯一可编辑原文。
