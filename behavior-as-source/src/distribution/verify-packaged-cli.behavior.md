---
id: distribution.verify-packaged-cli
status: pending_decision
owner: TODO
introduced_in: TODO
actor: behavior-as-source 发布维护者
intent: 在消费项目升级前验证实际发布包
implementation:
  - package.json
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

# 使用独立 Registry 验证发布包

```gherkin
Scenario: 维护者准备发布 behavior-as-source
  Given 候选源码已通过自身 Registry lint 和独立 Node 测试
  When 维护者从候选包创建干净安装并对独立消费 fixture 运行 CLI
  Then 安装后的 CLI 产生与源码 checkout 相同的契约结果
  And 外部复验失败时不得用候选自检成功替代发布验证
```

## Rationale

来源：US-0。外部 fixture 和安装边界用于发现候选实现与自有 Registry 共享的缺陷。
