---
id: tooling.registry.self-check
status: active
owner: Gitai
introduced_in: unreleased
actor: behavior-as-source 维护者
intent: 在修改通用工具时先校验工具自身的 Behavior Registry
implementation:
  - package.json
  - scripts/behavior-lint.mjs
driver: npm run self-check
oracle:
  - tests/cli.test.mjs 中的 CLI success paths work 断言验证 behavior-lint 能校验独立 Registry
evidence:
  result: passed
  run_id: evidence/tooling.registry.self-check.md
  minimal_failure: null
hidden_scenarios_ref: evidence/tooling.registry.self-check.md#hidden-packaged-cli
review_log:
  - date: "2026-10-16"
    reviewer: Gitai
    decision: approved
---

# 修改工具时先校验自身 Behavior Registry

```gherkin
Scenario: 自检先校验 Registry 再运行独立测试
  Given behavior-as-source 源码中存在自身 Behavior 和独立 Node 测试
  When 维护者运行包级自检
  Then 自检先校验自身 Registry 再运行独立测试，并在任一步失败时返回非零退出码
```

## Rationale

来源：`.agents/notes/proposed/process/2026-10-16-behavior-review-and-living-documentation.md` 的自举提案。Gitai 于 2026-10-16 确认本条规则。
