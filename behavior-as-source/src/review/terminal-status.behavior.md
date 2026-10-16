---
id: review.show-terminal-status
status: pending_decision
owner: TODO
introduced_in: TODO
actor: Behavior Reviewer
intent: 在终端找到下一条需要人工审查的行为
implementation:
  - package.json
  - scripts/behavior-review.mjs
  - src/review.mjs
  - src/cli.mjs
driver: node --test tests/cli.test.mjs
oracle:
  - tests/cli.test.mjs 验证 behavior-review status 输出待审 Behavior、审查原因和可点击文件链接
evidence:
  result: not_run
  run_id: TODO
  minimal_failure: null
hidden_scenarios_ref: TODO
review_log: []
---

# 终端显示待审查 Behavior 队列

```gherkin
Scenario: Reviewer 需要决定下一步审查哪条行为
  Given Registry 中存在待决、假设或冲突 Behavior
  When Reviewer 运行 behavior-review status
  Then 命令按优先级列出需要人工处理的 Behavior 和原因
  And 每条 Behavior 的文件路径可点击或可直接复制
  And 命令不修改 Registry
```

## Rationale

来源：US-4 和最小 review 方案。Git 和 Vim 已经承担版本与编辑；工具只需要回答“现在看哪里、为什么看”。
