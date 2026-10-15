# Agent Skill 评测方案调研

访问日期统一为 **2026-10-15**。本文只采用官方文档、官方 GitHub 仓库、规范或原始代码。结论分为：

- **官方标准**：来源项目明确规定或实现的格式、流程。
- **开源工具惯例**：工具支持并反复采用的做法，但不是跨项目标准。
- **本项目建议**：针对 `technical-writing-zh` 的组合或扩展，不应冒充社区共识。

## 当前目录

初始检查时，目录包含 `SKILL.md` 和 `references/` 下的 4 份参考文档；最终核对时，目录还包含未跟踪的 `evals/evals.json`、`evals/trigger-evals.json`、`package.json` 和 `scripts/prepare-evals.mjs`。这些文件不是本文修改范围。本文是本次唯一写入文件；不修改现有 Skill、参考资料或已有 eval 文件。

## 结论摘要

最成熟、可直接借鉴的组合是：

1. 用 Anthropic Skill Creator 的 `evals/evals.json` 管理任务，按同一 prompt 同轮运行 `with_skill` 和 `without_skill`，保留逐运行结果、断言证据、时间/token，并以 benchmark 汇总。
2. 用确定性 grader 检查事实、术语、数字、条件和结构；用模型 grader 或人工盲选评估无法可靠字符串匹配的质量。
3. 用 Inspect AI 的 Dataset / Solver / Scorer / EvalLog 思路组织跨模型和重复运行；用 promptfoo 的断言类型、阈值和输出格式补足轻量离线评分。
4. OpenAI 有可复用的 Evals 数据集与 grader 格式，但没有发现针对“Skill 包”本身的官方专用 benchmark 或统一 with/without-skill schema。

## 1. Anthropic Skill Creator / skills 仓库

### 1.1 Eval case 组织

**官方做法：** 每个 Skill 在自身目录保存 `evals/evals.json`。文件包含 `skill_name` 和 `evals[]`；每个 case 至少有整数 `id`、用户任务 `prompt`，可选 `expected_output`、输入 `files` 和可验证的 `expectations`。输入文件路径相对 Skill 根目录。

这适合技术写作 Skill，因为 case 可以同时固定“待改写文档”、任务 prompt 和可检查的事实/结构期望。当前 `skill-creator` 的 schema 使用 `expectations`；其运行说明部分使用了 `assertions` 一词，落地时应以 schema 和 grader 输出字段为准。

来源：

- [Anthropic `skill-creator/SKILL.md`](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md)，访问日期：2026-10-15。
- [Anthropic `skill-creator/references/schemas.md`](https://github.com/anthropics/skills/blob/main/skills/skill-creator/references/schemas.md)，访问日期：2026-10-15。

### 1.2 with-skill / without-skill 对照

**官方做法：** 对每一个 case，在同一轮同时启动：

- `with_skill`：加载当前 Skill；
- `without_skill`：新建 Skill 时不加载 Skill；改进已有 Skill 时加载编辑前的 snapshot，命名为 `old_skill`。

两组使用相同 prompt 和输入文件，输出分别写入 `with_skill/outputs/` 与 `without_skill/outputs/` 或 `old_skill/outputs/`。这样可以估计 Skill 的增量价值，而不是只看模型本身的绝对能力。Anthropic 还要求在运行期间记录时间数据，避免只比较结果、不比较成本。

来源：

- [Anthropic `skill-creator/SKILL.md` 的 Running and evaluating test cases](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md)，访问日期：2026-10-15。

### 1.3 Grader、比较和 benchmark

**官方做法：**

- 每个运行目录保存 `grading.json`，核心字段是 `expectations[].text/passed/evidence` 和 `summary.pass_rate`。
- 可保存 `claims`、用户备注、执行指标和时间，便于发现“表面通过但事实错误”的断言。
- `timing.json` 保存 `total_tokens`、`duration_ms` 及执行器/评测器时间。
- `benchmark.json` 按 `eval_id`、`configuration`、`run_number` 保存结果，并汇总 `mean/stddev/min/max`；官方示例汇总 pass rate、时间、tokens 及 with/without 的 delta。
- `comparison.json` 支持盲选 A/B：记录 winner、reasoning，以及 correctness、completeness、accuracy、organization、formatting、usability 等 rubric。
- 官方分析器会提醒非区分性断言、高方差 case 和时间/token 取舍；这说明“总通过率”不能单独作为结论。

这是一套**按 Skill 生成 benchmark** 的工作流，不是 Anthropic 为所有 Skill 发布的固定公共数据集。当前官方仓库的 benchmark schema 也没有把某个中文写作质量标准预先固化进去。

来源：

- [Anthropic `schemas.md`：`grading.json`、`timing.json`、`benchmark.json`、`comparison.json`](https://github.com/anthropics/skills/blob/main/skills/skill-creator/references/schemas.md)，访问日期：2026-10-15。
- [Anthropic `agents/grader.md`](https://github.com/anthropics/skills/blob/main/skills/skill-creator/agents/grader.md)，访问日期：2026-10-15。
- [Anthropic `agents/comparator.md`](https://github.com/anthropics/skills/blob/main/skills/skill-creator/agents/comparator.md)，访问日期：2026-10-15。
- [Anthropic `scripts/aggregate_benchmark.py`](https://github.com/anthropics/skills/blob/main/skills/skill-creator/scripts/aggregate_benchmark.py)，访问日期：2026-10-15。

## 2. OpenAI 官方 Evals、Graders 与 Agents 适配

### 2.1 官方数据集和 Evals 格式

**官方做法：** OpenAI Evals 仓库使用 JSONL 保存数据，每行是一个样本。所有模板需要 `input`；基础 `Match`、`Includes`、`FuzzyMatch` 还需要 `ideal`。模型评分模板的额外字段由评分 prompt 中的占位符决定。YAML registry 记录 eval 的 `id`、描述、指标、实现类和 `args`；名称采用 `<eval_name>.<split>.<version>`，修改数据或规则时应递增版本。

这对 Skill 评测的直接价值是：任务样本、参考答案/事实和版本可以独立于执行器保存；同一批数据可以换模型或换 completion function 重跑。OpenAI 的 Completion Function Protocol 把“模型前的工具、浏览器或 Agent 操作”统一为输入 chat / 输出文本的接口，可作为 Skill runner 的适配边界。

来源：

- [OpenAI Evals README](https://github.com/openai/evals/blob/main/README.md)，访问日期：2026-10-15。
- [OpenAI Evals `build-eval.md`](https://github.com/openai/evals/blob/main/docs/build-eval.md)，访问日期：2026-10-15。
- [OpenAI Evals `eval-templates.md`](https://github.com/openai/evals/blob/main/docs/eval-templates.md)，访问日期：2026-10-15。
- [OpenAI Evals `completion-fns.md`](https://github.com/openai/evals/blob/main/docs/completion-fns.md)，访问日期：2026-10-15。

### 2.2 官方 grader 格式

**官方做法：** OpenAI Platform Graders 使用 JSON。grader 通过 `{{item.*}}` 读取数据集项，通过 `{{sample.*}}` 读取模型样本，常用输出是 `sample.output_text`，也支持 `output_json`、`output_tools`。官方类型包括：

- `string_check`：等于、不等于、包含、大小写不敏感包含；
- `text_similarity`：fuzzy match、BLEU、GLEU、METEOR、cosine、ROUGE；
- `score_model`：模型按指定范围返回连续分数；
- `label_model`：从标签集合中分类并定义通过标签；
- `python`：执行 Python grader；
- `multi`：按公式组合多个 grader。

平台 API 还提供 grader 的 validate/run 接口，并返回 reward、子分数、执行时间、token usage 和错误状态。对于 Agent 输出，`output_tools` 可以分别检查工具名和参数。

**对本项目的判断：** 这是可复用的官方 grader schema，但不是 Skill 专用格式。官方来源同时覆盖 prompts、模型样本和 tool calls，却没有定义 `SKILL.md`、Skill 激活轨迹或 with/without-skill 目录结构；这些需要由本项目的 runner 自行规定。

来源：

- [OpenAI Platform Graders guide](https://platform.openai.com/docs/guides/graders)，访问日期：2026-10-15。
- [OpenAI Graders API reference](https://platform.openai.com/docs/api-reference/graders)，访问日期：2026-10-15。
- [OpenAI Evals model-graded templates](https://github.com/openai/evals/blob/main/docs/eval-templates.md)，访问日期：2026-10-15。

## 3. promptfoo 与 Inspect AI：适合本项目离线评测的部分

### 3.1 promptfoo

**开源工具惯例：** promptfoo 用 config 管理 prompts、providers、tests；case 可放在 YAML、JSON、CSV 或外部文件。断言支持确定性类型（contains、equals、regex、JSON、JavaScript/Python、latency、cost 等）和模型辅助类型（`llm-rubric`、`factuality`、`select-best` 等），支持权重、阈值、命名指标和 derived metrics。输出可保存为 JSON、YAML、CSV 或 HTML；已有输出也可以单独运行 assertions。

**适合本项目：**

- 用 JavaScript/Python assertion 做保护事实、数字、命令、字段名、标题层级和禁止改写的确定性检查；
- 用 `llm-rubric` 做简明性、结构可用性等开放指标；
- 用 `select-best` 做两个版本或 with/without 的候选比较；
- 用 `cost`、`latency` 和 provider response 记录 token/耗时。

**边界：** promptfoo 的模型 grader、embedding 和 provider 调用本身不是离线；只有“重放已保存输出，再运行确定性 grader”才是真正离线。模型评分应保存 grader 模型、prompt、版本和原始理由，不能把一次模型评分当成不可复核事实。

来源：

- [promptfoo Assertions and metrics](https://promptfoo.dev/docs/configuration/expected-outputs/)，访问日期：2026-10-15。
- [promptfoo Model-graded metrics](https://promptfoo.dev/docs/configuration/expected-outputs/model-graded)，访问日期：2026-10-15。
- [promptfoo Prompts, tests, and outputs](https://promptfoo.dev/docs/configuration/parameters)，访问日期：2026-10-15。

### 3.2 Inspect AI

**开源工具惯例：** Inspect 把一次评测拆成 Dataset、Solver、Scorer。Dataset 的 `Sample` 有 `input`、`target`、稳定 `id`、`metadata`、`files`、`setup`；Solver 可以是 prompt pipeline、self-critique 或完整 Agent；Scorer 可以是精确匹配、包含匹配、模型评分或自定义 scorer。每次运行保存 EvalLog，包含 task/model/solver/scorer、样本输入输出、分数、错误、统计和 token 使用；支持 `epochs`、重复运行、限制、日志查看，以及 `inspect score` 离线重评分。

**适合本项目：**

- 将 `technical-writing-zh` 的输入文档、任务类别、语言问题标签、保护事实和参考版本放进 `metadata`；
- 把“加载 Skill”与“不加载 Skill”实现为两个 Solver 配置，保持同一 Dataset；
- 用自定义 Scorer 对事实、问题标签、结构和偏好分别出分；
- 依靠稳定 sample id、epoch 和 EvalLog 保存重复运行及失败样本，支持后续离线复核；
- 借用其 `input/target/metadata` 和日志思路，但不必引入 sandbox 或 Agent 工具链，因为本 Skill 的首要对象是离线文档改写。

来源：

- [Inspect AI Dataset 文档](https://inspect.aisi.org.uk/datasets.html)，访问日期：2026-10-15。
- [Inspect AI Scorers 文档](https://inspect.aisi.org.uk/scorers.html)，访问日期：2026-10-15。
- [Inspect AI Solvers 文档](https://inspect.aisi.org.uk/solvers.html)，访问日期：2026-10-15。
- [Inspect AI Log Files 文档](https://inspect.aisi.org.uk/eval-logs.html)，访问日期：2026-10-15。
- [Inspect AI 官方仓库](https://github.com/UKGovernmentBEIS/inspect_ai)，访问日期：2026-10-15。

## 4. `technical-writing-zh` 的可复现指标

### 4.1 指标矩阵

| 指标 | 可复现定义 | 推荐判定方式 | 来源归类 |
| --- | --- | --- | --- |
| 触发准确性 | 在应触发 Skill 的正例和不应触发的近邻负例上，报告 `TP/(TP+FP)`；同时报告触发率和漏触发 | runner 记录 Skill 是否加载/调用；不能只根据最终文本猜测 | **本项目建议**；Anthropic 官方 Skill Creator 已明确把 description triggering accuracy 作为优化目标，但未规定统一混淆矩阵 |
| 问题召回 | 原文先由人工标注问题集合 `G`，输出识别的问题集合 `P`；`召回率=|P∩G|/|G|` | 对问题类型、位置、严重度分别评分，并保留证据片段 | **本项目扩展**；借鉴通用 precision/recall，面向技术文档问题建立专属 gold labels |
| 误报 | 输出报告的问题中不属于 `G` 的比例，`FP/(TP+FP)`；也可报告每千字误报数 | 由独立标注者复核，区分“解释不足”和“错误指控” | **本项目扩展** |
| 事实保持 | 对原文保护事实集合 `F` 检查实体、数字、单位、条件、否定、命令、代码标识和引用是否保持；报告 `保持数/应保持数`，另报新增错误事实数 | 先做确定性字段/数字/标识检查，再用独立 grader 判断语义蕴含；缺证据不得算通过 | **社区已有类似做法 + 本项目扩展**。OpenAI `fact`、promptfoo `factuality` 提供通用事实一致性模式，本项目需细化为中文技术契约 |
| 盲选偏好 | 随机交换 A/B，评审者不知道配置和版本，选择 A、B 或 tie；报告胜率、tie 率和分歧 | 人工优先；模型 judge 需用已标注样本校准，并固定 rubric | **社区已有做法**；Anthropic `comparison.json`、OpenAI `battle`、promptfoo `select-best` 均有先例 |
| 跨模型稳定性 | 在固定 case、Skill 版本和 generation config 下运行多个模型；按模型报告均值、标准差、最小值和最大值，不只汇总总均值 | 同时固定或显式记录 seed、temperature、epochs、模型版本和 grader 版本 | **组合建议**；Anthropic benchmark 和 Inspect epochs 已提供方差/重复运行基础，本项目把稳定性提升为 Skill 验收维度 |
| token / 耗时 | 每个 case 记录输入 token、输出 token、总 token、wall-clock time、重试和失败；报告 p50/p95 与 with/without delta | 使用 provider 原始 usage；若 provider 不提供 token，标为 unknown，不用字符数冒充 | **社区已有做法**；Anthropic `timing.json`、promptfoo cost/latency、Inspect EvalLog stats 均支持 |

### 4.2 建议的最小 case 与结果结构

**本项目建议：** 每个 case 至少包含：

```json
{
  "id": "fact-preservation-001",
  "prompt": "审阅并改写输入技术文档",
  "files": ["inputs/contract.md"],
  "expected_output": "保留所有接口字段、数字、条件和失败语义",
  "expectations": [
    "保留字段名和枚举字面",
    "指出原文中的事实冲突",
    "不把未知项改写成确定事实"
  ],
  "metadata": {
    "category": "contract-review",
    "should_trigger": true,
    "gold_issues": ["ambiguous-owner", "missing-failure-path"],
    "protected_facts": ["..."]
  }
}
```

执行时固定同一输入，至少生成 `with_skill` 与 `without_skill` 两组结果；结果保留原始输出、Skill 版本、模型、生成参数、seed、时间/token、逐项 grader evidence 和人工复核状态。事实与触发类分数应作为硬约束单独报告，不能被主观风格偏好平均掉。

建议沿用 Anthropic 的目录和字段命名：`evals/evals.json`、`grading.json`、`timing.json`、`benchmark.json`、`comparison.json`。如改用 promptfoo 或 Inspect，只复用其 runner/grader 能力，不同时维护第二套 case 真源。

## 来源边界

截至访问日期，未发现一个由 Anthropic、OpenAI、promptfoo 或 Inspect AI 共同认可的“Agent Skill 评测标准”，也未发现专门针对中文技术写作 Skill 的官方公共数据集。社区成熟部分是：固定 case、对照运行、确定性与模型辅助 grader 并用、盲选比较、重复运行、成本/延迟记录和可回放日志；`technical-writing-zh` 的问题召回、误报、保护事实集合、触发混淆矩阵及跨模型稳定性门禁属于本项目需要自行定义和维护的扩展。
