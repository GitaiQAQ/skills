---
id: integration.link-real-execution-report
status: pending_decision
owner: TODO
introduced_in: TODO
actor: 测试报告集成者
intent: 把真实测试结果关联到 Behavior 而不编造步骤事件
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

# 只关联真实执行报告

```gherkin
Scenario: 消费项目提供 Cucumber Messages、Allure 或原生测试报告
  Given 报告来自真实 Driver 且能定位运行版本
  When 集成者把报告关联到 Behavior
  Then Living Documentation 链接原始报告并保留其实际证据粒度
  And 没有场景或步骤证据时不生成虚假的通过事件
```

## Rationale

来源：US-3、US-5 和社区方案分析。报告系统拥有执行结果，不拥有 Behavior 生命周期。
