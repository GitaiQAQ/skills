---
id: living-doc.render-versioned-readonly
status: pending_decision
owner: TODO
introduced_in: TODO
actor: 产品、开发、QA 或 On-call
intent: 按固定源码版本阅读 Behavior Registry
implementation: []
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

# 生成带来源版本的只读行为文档

```gherkin
Scenario: Reviewer 在固定 commit 的只读视图里看到分层治理状态
  Given 生成任务固定了一个源码 commit
  And 该 commit 的 Registry 中一条 Behavior 已登记生命周期、Owner 审查记录、最近一次 evidence 与被验证版本
  When 任务从该 commit 生成静态文档，Reviewer 在页面查看这条 Behavior
  Then 页面显示来源 commit 并链接 Behavior 原文、实现、Oracle 和证据
  And 页面分别显示生命周期、审查记录、最近结果(evidence.result 与 run_id)、未满足的晋级条件、证据是否适用当前版本、以及是否已发布
  And 任一字段缺失时显式显示 unknown 或 TODO，不留空被误读为已满足
  And “本次执行 passed”“行为 active”“是否已发布”是三个独立标记，不合并为一个状态
  And “是否已发布”只消费消费项目发布系统的事实，取不到来源时显示 unknown，Registry 不新增 released 字段或状态机
  And 历史结果对应其他 commit 时提示证据可能过期、适用性为 unknown，不显示为当前版本已通过
  And 页面不能编辑 Behavior 或反向写入 Registry
```

## Rationale

来源：US-5（本条目扩展为 US-5a），以及 owning Note《2026-10-16 Behavior review and living documentation》“社区方案判断 / 下游报告与 Living Documentation”与 BDD 生态调研报告附录。Living Documentation 是可丢弃的版本化视图，不是第二份事实源；它把 Registry 的治理字段（lifecycle、review_log、证据适用性）与执行结果分层呈现，使 Reviewer 不会把“本次 passed”误读为“已 active”或“已 released”。发布状态只能来自消费项目发布系统，Registry 不为此新增字段或状态机。
