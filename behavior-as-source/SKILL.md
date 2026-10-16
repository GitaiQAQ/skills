---
name: behavior-as-source
description: 把产品规则写成与实现同仓的单条 Markdown + Gherkin 文件，并用 CLI 查重、校验、查询实现影响、比较版本和生成有来源的报告。用于首次建立 Behavior Registry，从需求、代码变更或事故中新增、修改、废弃和验证行为。不用于一般文档润色、代码质量审查、没有项目模板的工时估算或运行 Cucumber 测试。
---

# Behavior as Source

一个 `*.behavior.md` 文件记录一条产品规则：谁在什么条件下执行什么动作，用户或系统能看到什么结果。文件同时记录 Owner、适用版本、实现路径、测试命令和证据路径。实现、测试、评审和 Release Notes 使用同一个稳定 Behavior ID 查找这条规则。

## 直接使用

用户只需用一句话说明意图，不必提供 CLI、Skill 物理路径或模板路径：

- `用 $behavior-as-source 初始化当前项目的 Behavior Registry。`
- `用 $behavior-as-source 登记、修改或废弃这个行为。`
- `用 $behavior-as-source 检查 <Behavior ID> 为什么还不能 active。`
- `用 $behavior-as-source 分析 <文件路径或 Behavior ID> 的影响。`
- `用 $behavior-as-source 比较 <refA> 和 <refB> 的行为变化。`
- `用 $behavior-as-source 生成成熟度报告、项目进度报告或版本说明。`

根据意图选择下方工作流，只在缺少必要输入且无法从当前项目发现时提问。不要让用户先选择底层命令。

## 开始前

先阅读目标项目的指令、相关实现、现有测试和需求来源。说明目标、非目标、验收标准和保持不变的内容。所有条目路径都相对目标项目根目录。

字段与结构以 [JSON Schema](schemas/behavior.schema.json) 为唯一机器契约。字段说明见 [behavior-schema.md](references/behavior-schema.md)，命令说明见 [tooling.md](references/tooling.md)。

Owner 必须来自用户或项目授权记录。Owner 未确认时使用 `owner: TODO` 和 `status: pending_decision`。AI 不得自任 Owner，也不得把历史实现自动认定为正确需求。

本 Skill 不接 Cucumber Runner，不写 step definition，不支持一文件多 Behavior，也不提供 Skill 更新 CLI。升级使用普通版本管理或 Skill 安装流程。

## 写出可以检查的行为

每个字段都要让维护者能回到代码、命令或原始来源。不要用“完善能力”“打通链路”“保证一致”“正确处理”代替实际动作和结果。

- `actor` 写触发行为的人或系统，例如“广告创建页用户”或“发布流水线”。
- `intent` 写 Actor 要完成的任务，例如“保存预算并看到服务端确认值”。不要写项目目标或价值口号。
- `Given` 写执行前已经存在的输入、状态或权限。
- `When` 写一次明确触发，例如点击按钮、调用接口或运行命令。
- `Then` 写可从 UI、API、文件、退出码或持久化状态检查的结果。结果必须能由 `oracle` 判断。
- `implementation`、`driver`、`oracle` 和 `evidence.run_id` 写真实路径、命令或判断规则。未知项保留 `TODO`，不要补造。

例如，不要写：

```gherkin
When 系统处理配置
Then 配置能力保持一致
```

应写成类似下面的可检查结果；字段和值仍须来自当前项目：

```gherkin
When 发布流水线运行 behavior-lint .
Then 命令发现无效 Behavior 时以退出码 1 结束
```

提交前逐句检查：主语是谁、读取什么、执行什么、结果在哪里可见。任一项答不出来时，继续读取来源或将该项标为未知，不交付抽象概括。

## 工作流

### 1. 查找现有行为

先运行：

```bash
npx --no-install behavior-list <project-root>
npx --no-install behavior-locate <behavior-id> <project-root>
```

从 PRD、迁移文档、Diff、事故或反馈中记录 Actor、Intent、Given、When、Then，并写出来源路径、工单或提交。确定本次是新增、修改、废弃还是冲突。信息不足时使用 `pending_decision`；语义冲突时使用 `conflict` 和 `conflicts_with`，等待 Owner 裁决。

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

### 6. 查询实现影响或 active 缺失条件

```bash
npx --no-install behavior-impact --path <source-file> --root <project-root>
npx --no-install behavior-impact --id <behavior-id> --root <project-root>
```

`--path` 只报告在 `implementation` 中明确登记该路径的 Behavior。空结果表示“没有显式映射”，不表示该文件没有行为影响。

`--id` 返回生命周期、Owner review、证据、证据适用性和 `active` 缺失条件。交付时逐项列出实际值和缺失字段，不要只说“尚未就绪”。`missing_for_active` 是从现有字段派生的读取结果，不是新的持久化状态；`evidence_applicability: unknown` 表示当前 Schema 没有足够版本信息，不能把历史 `passed` 当成当前版本已通过。

### 7. 生成报告

生成报告时，先检查目标项目根目录的 `.agents/templates/progress-report.md`。存在时完整读取，并按其中的标题、表格、计算规则和输出顺序生成项目进度或工作量报告；同时读取 [registry-report.md](templates/registry-report.md)，遵守其中对 Registry 状态、证据和未知项的限制。项目模板不存在时，只生成通用 Registry 成熟度报告，不推断产品完成度或剩余工时。最终报告的来源部分必须说明实际使用了项目模板还是通用模板；不要要求用户输入模板路径。

项目进度模板必须声明阶段来源、承诺范围的分母版本、单位和完整状态映射。生成的项目报告必须分列规格成熟度、交付进展和测试证据；`evidence.result`、场景通过率或 Registry 成熟度都不能替代交付进展。交付进展的百分比只可使用已映射的阶段状态计算。模板缺少上述口径，或阶段来源出现未映射状态时，报告必须列出状态词和来源文件，将交付进展写为 `unknown`，且不输出完成百分比。不得猜测状态含义、补默认权重或从路线图文本推导映射。通用 Skill 不复制或持久化消费项目的阶段事实。

读取选定模板中的 HTML 注释，保留模板规定的标题和表格，直接填写最终 Markdown；不要先定义结构化输出字段或 JSON 中间文件。报告必须给出扫描范围、Behavior 总数、各分类数量和比例，并为主要缺口列出 Behavior ID、文件路径、阻塞字段和下一步动作。“成熟度偏低”“仍需完善”之类没有数据和对象的句子不能作为结论。

报告分别统计 Behavior status、evidence result 和隐藏场景引用；不得把 `evidence.result: passed` 当成 `status: active`，也不得把 Registry 成熟度改写成产品完成百分比或剩余工时。通用 Registry 报告只回答规格成熟度，不补写项目交付进展或测试通过率。

### 8. 比较版本并生成版本说明

```bash
npx --no-install behavior-diff <refA> <refB> --root <project-root>
```

版本差异必须包含新增、修改和废弃。修改必须覆盖完整 Gherkin 语义、标题、理由、生命周期、Owner、实现、Driver、Oracle、证据、隐藏场景和 review。直接删除 Behavior 会报告错误，不能冒充废弃。

生成版本说明时，先对用户给出的两个 Git ref 运行 `behavior-diff`。按新增、修改和废弃分组。每项写稳定 Behavior ID，并说明哪个 Given、When、Then 或生命周期字段从什么值改成什么值。不要写“优化流程”“增强能力”或“调整逻辑”。不得从 Behavior diff 推断实现已交付、测试已通过或版本已发布。缺少任一 ref 时，只有无法从项目发布约定中确定后才询问用户。

## 交付

交付实际修改的路径和 Behavior ID。逐项列出已执行命令及结果、未执行项及原因、待 Owner 决定的问题。不要只写“已完成校验”或“存在少量待办”。格式 lint 只证明 Registry 契约有效，不能代替业务 Driver 与 Oracle。
