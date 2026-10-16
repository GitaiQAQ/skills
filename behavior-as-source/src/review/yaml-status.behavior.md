---
id: review.show-yaml-status
status: pending_decision
owner: TODO
introduced_in: TODO
actor: LLM Agent
intent: 用稳定 YAML 获取待审 Behavior 队列
implementation:
  - package.json
  - scripts/behavior-review.mjs
  - src/review.mjs
driver: node --test tests/cli.test.mjs
oracle:
  - tests/cli.test.mjs 验证 behavior-review status --yaml 输出 total、items、id、status、reasons 和 path
evidence:
  result: not_run
  run_id: TODO
  minimal_failure: null
hidden_scenarios_ref: TODO
review_log: []
---

# 用 YAML 输出待审 Behavior 队列

```gherkin
Scenario: LLM 需要结构化获取待审队列
  Given Registry 中存在待决、假设或冲突 Behavior
  When LLM 运行 behavior-review status --yaml
  Then 命令输出 total 和 items 列表
  And 每项包含 id、status、reasons 和 path
  And 输出不包含终端链接控制字符
```

## Rationale

来源：US-4 和最小 review 方案。YAML 是 LLM 消费的稳定摘要；终端链接和 JSON 不是必要契约。
