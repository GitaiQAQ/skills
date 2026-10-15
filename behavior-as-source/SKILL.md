---
name: behavior-as-source
description: 在现有项目中维护可执行、可版本化的 Markdown + Gherkin 行为事实源。用于首次建立 Behavior Registry，从需求、代码变更或事故中新增、修改、废弃和验证行为，运行 behavior-lint/diff/impact/list/locate，并按需生成版本说明。不用于一般文档润色、代码质量审查或运行 Cucumber 测试。
---

# Behavior as Source

对可观察的产品规则维护一个带 Owner、版本、实现和证据的 `*.behavior.md` 条目。实现、测试、评审和 Release Notes 使用同一个稳定 Behavior ID。

## 开始前

先阅读目标项目的指令、相关实现、现有测试和需求来源。说明目标、非目标、验收标准和保持不变的内容。所有条目路径都相对目标项目根目录。

字段与结构以 [JSON Schema](schemas/behavior.schema.json) 为唯一机器契约。字段说明见 [behavior-schema.md](references/behavior-schema.md)，命令说明见 [tooling.md](references/tooling.md)。

Owner 必须来自用户或项目授权记录。Owner 未确认时使用 `owner: TODO` 和 `status: pending_decision`。AI 不得自任 Owner，也不得把历史实现自动认定为正确需求。

本 Skill 不接 Cucumber Runner，不写 step definition，不支持一文件多 Behavior，也不提供 Skill 更新 CLI。升级使用普通版本管理或 Skill 安装流程。

## 工作流

### 1. 查找现有行为

先运行：

```bash
npx --no-install behavior-list <project-root>
npx --no-install behavior-locate <behavior-id> <project-root>
```

从 PRD、迁移文档、Diff、事故或反馈提取 Actor、Intent、Given、When、Then 和可定位来源。确定本次是新增、修改、废弃还是冲突。信息不足时使用 `pending_decision`；语义冲突时使用 `conflict` 和 `conflicts_with`，等待 Owner 裁决。

### 2. 编写条目

复制 [behavior.md](templates/behavior.md)，在负责该行为的主实现旁创建人读短名的 `<name>.behavior.md`。一个文件只保存一个 Behavior，并且必须包含：

- YAML frontmatter，`id` 是第一个 key；
- 一个一级标题；
- 恰好一个 `gherkin` fenced block；
- block 内恰好一个 `Scenario` 或 `Scenario Outline`；
- 可选的 `## Rationale` 和 `## Notes`。

跨目录实现继续完整列入 `implementation`，不要复制 Behavior 文件。语义修改保留 ID，并填写 `changed_in`。

### 3. 校验 Registry

从目标项目根目录运行：

```bash
npx --no-install behavior-lint .
```

error 阻塞变更，warning 默认不阻塞。不要通过放宽 Schema、增加 ignore 或修改测试断言来掩盖真实问题。

### 4. 关联并运行证据

填写真实的 `implementation`、`driver` 和 `oracle`。Driver 复用项目现有测试命令，不创建 BDD Runner。先运行相关现有测试；只有当前行为无法被现有测试证明时，才按项目测试规则添加最小测试。

把运行记录保存在项目已有证据目录。`evidence.run_id` 使用仓库相对文件路径。未运行时写：

```yaml
evidence:
  result: not_run
  run_id: TODO
  minimal_failure: null
```

失败和阻塞必须保留真实状态，不能编造成功证据。

### 5. 晋级或废弃

只有同时满足以下条件，才把条目标为 `active`：

- Owner 已确认且不为 `TODO`；
- `implementation` 至少包含一个真实路径；
- `evidence.result` 为 `passed`；
- `evidence.run_id` 指向现存证据文件；
- `hidden_scenarios_ref` 已建立且不为 `TODO`；
- 没有生效冲突。

废弃时保留文件，设置 `status: deprecated`、`deprecated_in` 和理由。不得直接删除历史 Behavior。

### 6. 查看影响和版本差异

```bash
npx --no-install behavior-impact --path <source-file> --root <project-root>
npx --no-install behavior-impact --id <behavior-id> --root <project-root>
npx --no-install behavior-diff <refA> <refB> --root <project-root>
```

版本差异必须包含新增、修改和废弃。直接删除 Behavior 会报告错误，不能冒充废弃。

## 交付

交付实际修改的路径、Behavior ID、已执行检查、未执行项及原因，以及待 Owner 决定的问题。格式 lint 只证明 Registry 契约有效，不能代替业务 Driver 与 Oracle。
