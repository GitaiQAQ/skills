# @flome/behavior-as-source

`behavior-as-source` 把一条产品规则保存在一个 `*.behavior.md` 文件中。文件记录触发者、前置条件、动作、可见结果、Owner、实现路径、测试命令和证据路径。配套 CLI 用于查重、校验、查询源码对应的规则，以及比较两个 Git 版本中的行为变化。

## 安装

### 从当前 checkout 安装

在目标项目安装 CLI：

```bash
npm install --save-dev /path/to/ai-skills/behavior-as-source
```

在用户级 Skill 目录建立链接：

```bash
mkdir -p ~/.agents/skills
ln -s /path/to/ai-skills/behavior-as-source ~/.agents/skills/behavior-as-source
```

六个命令会注册到目标项目的 `node_modules/.bin`。通过 npm script 或 `npx behavior-lint` 等方式执行。

### 从已发布来源安装

package 发布后，CLI 可以改用：

```bash
npm install --save-dev @flome/behavior-as-source
```

从 GitHub 仓库安装 Agent Skill：

```bash
npx skills add GitaiQAQ/skills --skill behavior-as-source -g -y
```

Skill 安装后，CLI 仍需通过 npm 安装。

## 退出码

- `0`：成功；lint warning 不改变退出码。
- `1`：发现条目问题、目标不存在、ID 重复、非法删除或 Git ref 读取失败。
- `2`：参数缺失、互斥参数或枚举值错误。

`behavior-lint`、`behavior-diff`、`behavior-impact`、`behavior-list` 和 `behavior-locate` 支持 `--json`。`behavior-review status` 使用 `--yaml`。

## behavior-lint

```text
behavior-lint [root] [--json] [--no-warnings]
```

扫描 `**/*.behavior.md`，验证 Schema、Gherkin、ID、实现路径、证据和 `active` 门禁。

```text
Checked 19 behavior files: 0 errors, 1 warnings
```

## behavior-diff

```text
behavior-diff <refA> <refB> [--root <path>] [--format markdown|json]
```

从两个 Git ref 读取 Behavior，按稳定 ID 输出新增、修改、废弃和非法删除。修改包括完整 Gherkin 语义、标题、理由，以及会影响审查的 frontmatter。命令不切换工作树。

```markdown
## 新增

- **creation.budget.initialize** Create 模式初始化预算：预算使用账户比例初始化
```

## behavior-impact

```text
behavior-impact --path <src-file> [--root <path>] [--json]
behavior-impact --id <behavior-id> [--root <path>] [--json]
```

`--path` 返回声明该实现路径的 Behavior；`--id` 返回生命周期、Owner review、实现、Driver、Oracle、证据、证据适用性和 `active` 缺失条件。

```json
{
  "id": "creation.budget.initialize",
  "status": "pending_decision",
  "owner": "Creation Team",
  "implementation": ["src/budget/initialize.ts"],
  "driver": "npm test -- budget",
  "evidence": {
    "result": "passed",
    "run_id": "docs/behavior/evidence/budget.md",
    "minimal_failure": null
  },
  "evidence_applicability": "unknown",
  "missing_for_active": ["hidden_scenarios"]
}
```

## behavior-list

```text
behavior-list [root] [--status <s>] [--owner <o>] [--format table|json]
```

按 ID 排序输出：

```text
id                          | status           | owner | path | title
creation.budget.initialize  | pending_decision | TODO  | ...  | Create 模式初始化预算
```

## behavior-locate

```text
behavior-locate <behavior-id> [root] [--json]
```

输出唯一匹配条目的绝对路径，供编辑器和脚本跳转。

```text
/workspace/app/src/budget/initialize.behavior.md
```

## behavior-review

```text
behavior-review status [root] [--links|--yaml]
```

列出需要人工处理的 Behavior、原因和文件路径。支持 OSC 8 hyperlink 的终端可直接点击路径；`--links` 可强制输出链接。`--yaml` 输出给 LLM 消费的结构化摘要。命令只读，不修改 Registry。

## Registry 成熟度报告

[`templates/registry-report.md`](templates/registry-report.md) 的 HTML 注释规定数据来源和计算规则，标题与表格规定最终报告格式。Agent 读取注释后直接填写 Markdown，不建立中间 JSON。

模板分别统计 `status`、证据结果和隐藏场景引用。报告为主要缺口列出 Behavior ID、文件路径、缺失字段和下一步动作。它只解释 Registry 的规格成熟度，不把它解释为产品完成度、场景通过率、剩余工时或发布就绪度。

消费项目如提供 `.agents/templates/progress-report.md`，其模板必须自行声明阶段来源、分母版本、单位和完整状态映射。项目报告分列规格成熟度、交付进展和测试证据。状态未映射或口径缺失时，交付进展为 `unknown`，不输出完成百分比。
