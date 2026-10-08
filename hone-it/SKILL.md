---
name: "hone-it"
description: "用 LLM 对项目执行有门禁的递归改进。结合 Agent Notes、项目规范和其他 Skills 形成跨轮反馈，编排 bootstrap、maintain、audit、recover，并通过 external evaluator、原生 gates、archive 和 LKG 控制候选晋级与恢复。用于持续改进项目代码、知识和维护能力。"
---

# Project RSI

本 Skill 只负责编排，不复制任务管理、CI、Code Review 或项目治理规则。项目已有约定始终是事实来源。

## 何时调用

- 新项目需要建立 Agent Notes 决策账本并接入全局校验器。
- 依赖升级、缺陷修复、重构或文档维护需要可停止、可验证的循环。
- 需要审计跨多个独立维度的证据，或从 last-known-good（LKG）恢复。

## 编排依赖

1. **任务与 gates**：调用 `unlazy` 管理任务拆分、完成条件、阻断条件和循环预算；本 Skill 不重述其规则。
2. **多维证明**：只有验收涉及多个独立维度、组合矩阵或容易用局部结果冒充整体通过时，调用 `prove-it`；简单改动不强制引入。
3. **项目原生 CI**：发现并运行仓库已有的测试、lint、类型检查、构建、发布及健康检查。不得生成平行检查清单来替代项目配置。
4. **项目原生 Code Review**：沿用仓库已有 reviewer、PR/MR、CODEOWNERS、分支保护和审批流程。不得在本 Skill 内复制或放宽这些规则。
5. **Agent Notes**：使用 `.agents/notes/` 保存长期决策与反馈；使用本 Skill 附带的 `scripts/verify-agent-notes.mjs [repo]` 校验目标仓库，不向项目复制脚本。

## 模式路由

| 模式 | 编排目标 | 参考 |
| --- | --- | --- |
| `bootstrap` | 仅补齐 Notes README 和采用 Note | [bootstrap.md](references/bootstrap.md) |
| `maintain` | 让 `unlazy` 驱动有界任务循环并接入原生 gates | [maintenance-loop.md](references/maintenance-loop.md) |
| `audit` | 只读核验任务、证据、隔离、archive 与 LKG；按需调用 `prove-it` | [risk-policy.md](references/risk-policy.md) |
| `recover` | 停止循环，使用项目原生恢复机制回到 LKG | [recovery.md](references/recovery.md) |

意图不明确时选择 `audit`，保持只读。

## Bootstrap

```bash
node scripts/bootstrap.mjs <目标仓库>
```

脚本只创建缺失的 `.agents/notes/README.md` 与当日采用 Note，不创建私有维护配置、不复制项目脚本、不覆盖已有文件。目标已有自定义 Notes 规范时必须停止机械初始化，由 Agent 先判断全局 verifier 是否兼容现有契约。新建标准 Notes 后，运行本 Skill 附带的 `scripts/verify-agent-notes.mjs <目标仓库>`：脚本路径由运行环境按 `hone-it` Skill 名解析，不由消费仓库记录物理路径。

## 共同边界

- 每轮只执行 `unlazy` 选出的有界任务，达到预算、阻断条件或 gate 失败即停止。
- 变更在隔离工作区运行；候选结果先进入 archive，再由外部 evaluator 和项目原生 gates 决定是否晋级。
- LKG 必须是项目能够解析和恢复的不可变版本；本 Skill 不规定存储格式。
- Notes 不保存瞬时运行状态，也不替代 CI、Code Review、审计日志或发布记录。
- 研究原型与生产实践的映射见 [community-practices.md](references/community-practices.md)，不得把 benchmark 提升直接等同于生产安全。

## 输出

报告所选模式、`unlazy` gate 状态、实际运行的项目原生检查、`prove-it` 证明（如使用）、Code Review 状态、archive 候选和当前 LKG。不得声称未执行的动作已经完成。