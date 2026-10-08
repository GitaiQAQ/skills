# Agent Notes

本目录是项目的长期决策账本，也是自治维护跨时间学习的反馈面。Note 记录决定、原因、边界和被放弃的方案；它不替代代码、项目文档、CI、审计日志或任务状态。

## 目录和命名

Note 路径必须是：

```text
.agents/notes/{proposed,implemented,rejected,archived}/{architecture,feature,bug-fix,simplification,process,testing,integration}/yyyy-mm-dd-topic.md
```

目录按需创建，不要求预建空的 lifecycle/class 目录。`topic` 使用小写 kebab-case，日期必须真实有效；不同 lifecycle 和 class 间不得存在同名 Note。

## Header 与正文

proposed、implemented 和 rejected Note 以如下格式开始：

```text
# Agent Note: <title>
Status: <status>
```

其中 rejected 使用 `Status: rejected — <一行原因>`。archived Note 保留 `Status: implemented`，下一行增加 `Archived: yyyy-mm-dd`。Header 后空一行，正文立即以 `## Problem` 开始。

所有章节必须非空并保持以下相对顺序：

- proposed：`Problem`、`Proposal`、`Alternatives considered`、`Acceptance criteria`、`Risks`
- implemented：`Problem`、`Decision`、`Alternatives considered`、`Consequences`
- rejected：`Problem`、`Proposal`、`Alternatives considered`、`Reintroduction conditions`
- archived：`Problem`、`Decision`、`Alternatives considered`、`Consequences`

`Alternatives considered` 至少包含一个以加粗名称开头的真实备选段落，不得只写“无”。`Problem` 一经进入 Git 历史即固定；状态迁移或后续编辑不得改写。archived Note 一旦封存不得修改。

## 索引

- 本 README 必须索引全部 proposed 和 implemented Note，且不得保留失效条目。
- 存在 rejected Note 时，`rejected/INDEX.md` 必须索引全部 rejected Note；没有 rejected Note 时无需创建该文件。
- archived Note 不属于当前索引。
- Note 与索引中的本地链接必须相对、不得越出仓库，并且目标存在。

## 验证

从目标仓库运行全局 verifier（脚本由 `hone-it` Skill 按名解析，不依赖物理安装路径）：

```bash
node <hone-it Skill>/scripts/verify-agent-notes.mjs .
```

验证器只检查 Notes 契约和 Git 中已有 Note 的不可改写约束，不证明代码正确、任务完成或生产可发布。

## 当前 owning Notes

- [`implemented/process/YYYY-MM-DD-project-rsi-adoption.md`](implemented/process/YYYY-MM-DD-project-rsi-adoption.md) —— 项目采用 Project RSI 递归改进闭环。
