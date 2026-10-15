# Behavior 字段说明

机器校验的唯一真相是 [`schemas/behavior.schema.json`](../schemas/behavior.schema.json)。本页只解释使用边界，不复制字段和枚举定义。

- `id` 是稳定行为标识。语义修改保留 ID，文件名不需要等于 ID。
- `implementation` 使用仓库相对路径。`pending_decision` 可以使用空数组；`active` 至少包含一个真实路径。
- `driver` 是可直接运行的现有测试命令；没有 Driver 时写 `TODO`。
- `oracle` 是非空字符串数组，指向真实断言或判断规则。命令退出码不能代替业务断言。
- `evidence.run_id` 指向仓库内实际存在的证据文件；`passed` 不允许使用 `TODO`。
- `review_log: []` 表示尚无审查记录，不表示 Owner 已确认。
- `rationale` 可以写在 frontmatter；复杂说明使用 `## Rationale`。

创建条目使用 [`templates/behavior.md`](../templates/behavior.md)，校验使用 `npx --no-install behavior-lint <project-root>`。
