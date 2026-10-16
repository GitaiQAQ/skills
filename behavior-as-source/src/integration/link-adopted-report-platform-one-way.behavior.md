---
id: integration.link-adopted-report-platform-one-way
status: pending_decision
owner: TODO
introduced_in: TODO
actor: 测试管理平台集成者
intent: 在组织已采用报告平台时只单向链接结果，行为正文仍以 Registry 为唯一事实源
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

# 已采用平台上的单向结果链接

```gherkin
Scenario: 组织已采用 Allure 本地报告或 Xray/Zephyr 远端管理
  Given 组织已实际采用 Allure 本地报告，或 Xray/Zephyr 远端测试管理，且行为正文唯一位于 *.behavior.md
  When 集成者把 Behavior 与平台视图关联
  Then 只单向链接 Behavior ID、版本、永久链接与真实结果，不启用平台侧 Gherkin 编辑与回导
  And 平台导航标签（如 Allure 的 epic/feature/story）仅作导航，不覆盖 Registry 的治理字段
  And 行为正文仍唯一由 *.behavior.md 拥有，平台编辑不会回导为第二份行为源
```

## Rationale

来源：US-5（本条目扩展为 US-5b），以及 owning Note《2026-10-16 Behavior review and living documentation》“下游报告与 Living Documentation”和 BDD 生态调研报告 §7.8–7.9。平台原生的双向导入导出是厂商能力，本方案刻意不启用回导，以免与 `*.behavior.md` 争夺正文事实所有权。需区分两类平台：Allure 是本地静态报告产物，无远端账号概念；Xray/Zephyr 是远端测试管理平台，认证方式按组织实际配置，本条目不预设唯一凭据形式。“本轮不访问/不写入远端平台账号”是本次调研范围边界，不是永久能力规则；后续冻结包落盘或组织采用时另行决定。本条目仅在组织已实际采用对应平台且有明确读者时触发，当前无调用者，保持 pending_decision。
