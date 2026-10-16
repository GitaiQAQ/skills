---
id: tooling.impact.trace-explicit-mapping
status: pending_decision
owner: TODO
introduced_in: TODO
actor: MR 作者
intent: 在编码前查询源码与 Behavior 的显式映射
implementation:
  - src/fs.mjs
  - src/impact.mjs
  - scripts/behavior-impact.mjs
driver: npm run test:unit
oracle:
  - tests/cli.test.mjs 验证按实现路径查到 Behavior 并按 ID 返回实现、Driver、Oracle 和证据路径
evidence:
  result: not_run
  run_id: TODO
  minimal_failure: null
hidden_scenarios_ref: TODO
review_log: []
---

# 查询源码和 Behavior 的显式影响关系

```gherkin
Scenario: MR 作者检查待修改文件
  Given Behavior 的 implementation 显式列出一个源码路径
  When MR 作者按该路径查询影响并查看命中的 Behavior
  Then 工具返回 Behavior ID、源文件、实现、Driver、Oracle 和证据路径
  And 空结果保持为空而不声明该源码没有行为影响
```

## Rationale

来源：US-2。工具只能证明显式映射，不能把缺失映射解释为不存在影响。
