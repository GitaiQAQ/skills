# Behavior as Source Agent Notes

本目录记录 `behavior-as-source` Skill 和 CLI 的长期产品、交互、工具链与维护决定。它不保存消费仓的行为条目、运行证据或一次性任务日志。

## 所有权边界

- 本目录拥有跨项目通用的 Schema、CLI、review 流程、状态解释、导出和 Living Documentation 策略。
- 消费仓拥有自身 `*.behavior.md`、Owner 决定、实现映射、Driver、Oracle、证据和接入配置。
- 通用能力只能在 `behavior-as-source` 源码中实现。不得直接修改用户级安装目录或消费仓 `node_modules`。

## 结构

Note 路径为：

```text
.agents/notes/{lifecycle}/{class}/yyyy-mm-dd-topic.md
```

Lifecycle 使用 `proposed`、`implemented`、`rejected`、`archived`。Class 使用 `architecture`、`feature`、`bug-fix`、`simplification`、`process`、`testing`、`integration`。

每篇 proposed Note 必须以 `Problem` 开始，并包含 `Proposal`、`Alternatives considered`、`Acceptance criteria` 和 `Risks`。一个决定只有一个 owning Note；实现后应把仍有效的内容迁为 implemented，不长期保留并行提案。

## 当前 owning Notes

- [`implemented/architecture/2026-10-15-behavior-as-source-v2-background-and-design.md`](implemented/architecture/2026-10-15-behavior-as-source-v2-background-and-design.md) —— Behavior as Source v2 的产品背景、架构和实施记录。
- [`proposed/process/2026-10-16-behavior-review-and-living-documentation.md`](proposed/process/2026-10-16-behavior-review-and-living-documentation.md) —— Behavior as Source 的查询、开发、review、状态解释和 Living Documentation 交互策略。
