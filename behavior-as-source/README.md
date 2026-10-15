# @flome/behavior-as-source

`behavior-as-source` 是 Markdown + Gherkin 行为事实源 Skill，并提供 Registry CLI。

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

五个命令会注册到目标项目的 `node_modules/.bin`。通过 npm script 或 `npx behavior-lint` 等方式执行。

### 从已发布来源安装

package 发布后，CLI 可以改用：

```bash
npm install --save-dev @flome/behavior-as-source
```

从 GitHub 安装 Agent Skill：

```bash
python3 ~/.trae/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo GitaiQAQ/skills \
  --path behavior-as-source
```

安装 Skill 后重启 TRAE。CLI 仍需通过 npm 安装；Skill 安装器不会自动安装 Node.js 依赖。

## 退出码

- `0`：成功；lint warning 不改变退出码。
- `1`：发现条目问题、目标不存在、ID 重复、非法删除或 Git ref 读取失败。
- `2`：参数缺失、互斥参数或枚举值错误。

所有命令支持 `--json`。`behavior-diff` 和 `behavior-list` 也支持 `--format json`。

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

从两个 Git ref 读取 Behavior，按稳定 ID 输出新增、修改、废弃和非法删除。命令不切换工作树。

```markdown
## 新增

- **creation.budget.initialize** Create 模式初始化预算：预算使用账户比例初始化
```

## behavior-impact

```text
behavior-impact --path <src-file> [--root <path>] [--json]
behavior-impact --id <behavior-id> [--root <path>] [--json]
```

`--path` 返回声明该实现路径的 Behavior；`--id` 返回条目路径、实现、Driver、Oracle 和证据路径。

```json
{
  "id": "creation.budget.initialize",
  "implementation": ["src/budget/initialize.ts"],
  "driver": "npm test -- budget",
  "evidence_run_id": "docs/behavior/evidence/budget.md"
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
