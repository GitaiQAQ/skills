---
id: adoption.invoke-by-intent
status: pending_decision
owner: TODO
introduced_in: 0.0.2
actor: Behavior Registry 使用者
intent: 用一句自然语言意图调用能力，不先学习底层命令和物理路径
implementation:
  - SKILL.md
  - agents/openai.yaml
driver: 使用 $behavior-as-source 提出初始化、维护、验证、影响分析、版本比较或报告请求
oracle:
  - Agent 从请求映射到对应工作流
  - 只有必要输入无法从项目发现时才要求用户补充
evidence:
  result: not_run
  run_id: TODO
  minimal_failure: null
hidden_scenarios_ref: TODO
review_log: []
---

# 按意图调用 Behavior 能力

```gherkin
Scenario: 使用者只说明要完成的 Behavior 工作
  Given 使用者不了解 behavior-as-source 的 CLI 和文件路径
  When 使用者用一句话提出初始化、维护、验证、影响分析、版本比较或报告意图
  Then Agent 选择对应工作流并发现当前项目中的必要路径
  And 只有必要输入无法从项目发现时才要求使用者补充
```

## Rationale

来源：使用者需要一个意图式入口，而不是先理解内部命令、模板位置和 Registry 术语。
