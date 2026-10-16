---
id: adoption.use-node-api
status: pending_decision
owner: TODO
introduced_in: TODO
actor: Node 使用者
intent: 在 Node 项目中直接复用 Registry API
implementation:
  - package.json
  - src/index.mjs
  - src/types.mjs
driver: npm run test:unit
oracle:
  - package root 导出 parseBehaviorSource、parseBehaviorFile、parseBehaviorDir、discoverBehaviorPaths、validateBehaviorMeta、behaviorSchema、lintBehavior、lintBehaviorRegistry、diffBehaviorRefs、compareSteps、renderBehaviorDiffMarkdown、behaviorsForImplementation、behaviorDetails、parseRegistryForImpact、behaviorStatuses、evidenceResults
evidence:
  result: not_run
  run_id: TODO
  minimal_failure: null
hidden_scenarios_ref: TODO
review_log: []
---

# Node 使用者从 package root 导入稳定 API

```gherkin
Scenario: Node 项目直接调用 Registry 能力
  Given 项目已安装 @flome/behavior-as-source
  When 使用者从 package root 导入 API
  Then 使用者获得解析、校验、diff、影响查询和状态 API 的命名导出
  And 导出契约不要求启动 CLI 子进程
```

## Rationale

来源：package.json 的 exports 字段和现有单元测试对 package root 的直接导入。公共 API 是真实外部入口，不应只依赖 CLI 子进程。
