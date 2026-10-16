---
id: integration.accept-protocol-result-from-real-producer
status: pending_decision
owner: TODO
introduced_in: TODO
actor: 测试结果集成者
intent: 只从真实 producer 的协议化结果读取场景级证据，并诚实标注证据粒度
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

# 只接受真实 producer 的协议化结果

```gherkin
Scenario: 把真实 producer 的结果流关联到 Behavior
  Given 消费项目用原生 Driver 跑测试，由真实 producer（官方 emitter 或保真 adapter）产出结果
  When 集成者把结果关联到 Behavior
  Then Registry 校验结果符合协议结构、确有真实 producer 来源，并把 scenario/step 结果映射到 Behavior ID 与被验证版本
  And 没有场景或步骤粒度时只链接原始报告并标明关联粒度（file/scenario/step），不从退出码或无粒度结果编造通过事件
  And 旧 Cucumber JSON 或 JUnit XML 不是新内部标准；能保真保留场景结果的边缘 adapter 可接受，无法保真则只链接原始报告
```

## Rationale

来源：US-3（本条目扩展为 US-3a），以及 owning Note《2026-10-16 Behavior review and living documentation》“测试结果交换协议”与 BDD 生态调研报告 §7.1–7.2。Cucumber Messages 是首选场景级结果协议，但其 emitter 有版本下限（JVM≥6.0.0、Ruby≥4.0.0、JS≥7.0.0、ReqnRoll≥3.0.0）只作为兼容性背景写在此处，不作为通用拒绝门槛——保真 adapter 即使来自较旧或非官方实现也可产出协议。契约要求是：结果符合协议结构、来自真实 producer、可映射到 Behavior ID 与版本、粒度诚实。旧 Cucumber JSON 为 maintenance mode、JUnit XML 无官方 schema，二者不是新内部标准；能保真保留场景结果的边缘 adapter 可接受，无法保真则只链接原始报告，绝不从退出码或文件级报告编造 step 通过事件。
