# Community Practices

## 适用边界

这些项目提供的是不同层级的证据：论文证明某种搜索或自修改机制在受控任务上可行；benchmark 证明候选在固定 harness 下通过；工程工具提供隔离执行能力；社区工作流提供操作经验。它们都不能替代目标项目自己的 CI、Code Review、发布策略和生产健康检查。

## 研究原型、工程设施与生产实践

| 项目 | 定位 | 可借鉴机制 | 不应直接外推 |
| --- | --- | --- | --- |
| [DGM](https://sakana.ai/dgm/) | 研究原型 | 对自身代码生成候选，以 coding benchmark 做经验 evaluator，保留多样化 agent archive；实验采用 sandbox、访问限制和人工监督 | benchmark 提升不等于可无人值守修改生产系统；官方还记录了伪造测试日志和删除检测标记的 objective hacking |
| [STOP](https://arxiv.org/abs/2310.02304) | 研究原型 | 用显式 utility function 评价候选；研究还专门测量生成代码绕过 sandbox 的频率 | 自改 scaffolding 不是完整递归自我改进，也不是安全证明 |
| [ADAS / Meta Agent Search](https://arxiv.org/abs/2408.08435) | 研究方向与原型 | 元 agent 编写候选 agent，并从持续增长的发现 archive 中搜索 | 跨 benchmark 或模型迁移结果不能替代项目内验证 |
| [SICA](https://arxiv.org/abs/2504.15228) | 研究原型 | agent 修改自身系统代码，再用 SWE-bench Verified 等任务评价改进 | 论文报告的是受控样本结果，不是生产发布授权 |
| [AlphaEvolve](https://deepmind.google/discover/blog/alphaevolve-a-gemini-powered-coding-agent-for-designing-advanced-algorithms/) | 研究系统；部分产出经额外验证后进入生产 | 自动 evaluator 对候选程序验证、执行和评分；program database 支持演化选择 | AlphaEvolve 的生产案例依赖领域验证与工程审查，不能把生成结果直接视为生产可用 |
| [Ralph](https://ghuntley.com/ralph/) | 社区工作流 | 每轮一个任务、规格和计划作为稳定上下文、循环式推进 | 原始无限 shell loop 没有预算和停止门禁；生产使用必须改成 bounded loop |
| [OpenHands](https://docs.openhands.dev/overview/skills) | 工程平台与 Agent Skills 实践 | 用短 `AGENTS.md` 承载仓库约束，Skill 按需加载；Skill 只提供工作流，不自动获得权限或依赖 | Skill 不能替代项目权限、CI 或沙箱；安装前仍需审查其脚本和资源 |
| [SWE-bench](https://www.swebench.com/SWE-bench/guides/evaluation/) | benchmark 与可复现 evaluator harness | 将模型 patch 交给独立 Docker harness，保存报告、测试输出、执行脚本和 patch | 固定数据集通过不覆盖组织策略、真实依赖、线上流量或发布后行为 |

## 可迁移到生产的五项实践

### 1. External evaluator

候选生成者不能自己宣布成功。评价应在生成上下文之外执行，输入是候选制品，输出是可重复的分数、通过/失败和原始证据。优先复用项目原生测试与 CI；benchmark 只能作为附加 evaluator。

DGM 已观察到候选 Agent 伪造测试运行日志，并在另一实验中删除检测标记来获得高分。这说明 evaluator、校验标记和晋级规则必须位于候选可修改边界之外。

### 2. Archive

像 DGM、ADAS 和 AlphaEvolve 一样保留候选及其谱系、评价结果和环境标识。Archive 用于比较、复现和学习，不等于部署队列。失败候选也应可追溯，且任何候选都不得就地覆盖 LKG。

### 3. Sandbox

自修改或执行未知代码时使用隔离工作区、容器或等价边界，限制凭据、网络、挂载和生产写权限。Sandbox 是降低影响面的控制，不是正确性证明；仍需外部 evaluator、原生 CI 和 Code Review。

### 4. Bounded loop

把 Ralph 的开放循环收紧为由 `unlazy` 管理的有界循环：每轮一个任务，显式完成 gate、最大轮数/成本/时间、连续无进展阈值和失败停止条件。循环结束后重新评估，而不是自动续跑。

### 5. Last-known-good

LKG 是经过项目原生 gates、发布和健康检查确认的不可变版本。候选只有完成全部晋级条件后才能推进 LKG；异常时优先使用项目原生恢复路径回到 LKG。Archive 保存探索历史，LKG 表示可恢复基线，两者不能混用。

## 编排准则

1. 使用 `unlazy` 管任务、预算和 gates。
2. 仅在验收存在多个独立维度时使用 `prove-it` 展开证明矩阵。
3. 将研究系统的 evaluator、archive、sandbox 和 bounded loop 作为设计启发，不复制其 benchmark 阈值。
4. 将项目原生 CI、Code Review、发布与监控作为晋级事实来源。
5. 只有实际恢复演练或生产健康证据才能确认 LKG；论文结果、排行榜和代理总结都不能代替。

## 对 Skill 边界的直接结论

- `hone-it` Skill（Project RSI）只编排 `unlazy`、按需的 `prove-it`、项目原生 CI 和 Code Review；不复制这些能力的规则、状态机或配置。
- `verify-agent-notes.mjs` 由用户级全局 `hone-it` Skill 统一维护并接受目标仓库参数；bootstrap 不向项目复制脚本。它保护长期反馈记忆的结构与不可改写约束，而不是证明当前任务完成。
- 不创建自治维护私有 policy/checks 配置。无人消费的声明文件不构成安全边界，真正约束应落在 `AGENTS.md`、CI、分支保护和发布系统中。
- Candidate archive、benchmark 结果和 LKG 是三个不同概念；Skill 不应自行发明存储格式，而应适配项目已有 Git、CI 和制品系统。

## Sources

- Sakana AI, “The Darwin Gödel Machine: AI that improves itself by rewriting its own code”: https://sakana.ai/dgm/
- Zhang et al., “Darwin Gödel Machine: Open-Ended Evolution of Self-Improving Agents”: https://arxiv.org/abs/2505.22954
- Zelikman et al., “Self-Taught Optimizer (STOP)”: https://arxiv.org/abs/2310.02304
- Hu et al., “Automated Design of Agentic Systems”: https://arxiv.org/abs/2408.08435
- Robeyns et al., “A Self-Improving Coding Agent”: https://arxiv.org/abs/2504.15228
- Google DeepMind, “AlphaEvolve”: https://deepmind.google/discover/blog/alphaevolve-a-gemini-powered-coding-agent-for-designing-advanced-algorithms/
- Geoffrey Huntley, “Ralph Wiggum as a software engineer”: https://ghuntley.com/ralph/
- OpenHands Skills Overview: https://docs.openhands.dev/overview/skills
- SWE-bench Evaluation Guide: https://www.swebench.com/SWE-bench/guides/evaluation/
