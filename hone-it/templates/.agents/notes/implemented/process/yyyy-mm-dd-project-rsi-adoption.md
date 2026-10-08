# Agent Note: 采用自治项目维护闭环
Status: implemented

## Problem

项目需要持续处理依赖、缺陷、重构和运行维护，同时保证变更可验证、决策可追溯、故障可恢复；逐项等待人工操作会降低维护频率，而缺少门禁的自动化会放大高影响变更风险。

## Decision

自 YYYY-MM-DD 起采用 Project RSI：由全局 `hone-it` Skill 编排有门禁的项目级递归改进循环，由 `unlazy` 管理任务 gates 与有界循环，验收涉及多个独立维度时按需使用 `prove-it`，所有检查、审批、合并和发布继续服从项目原生 CI 与 Code Review。

Agent Notes 作为决策账本和递归改进的跨时间反馈面，记录选择、理由、替代方案与长期后果。候选在隔离环境中接受外部 evaluator，进入 archive 后才按原生 gates 决定是否晋级；运行状态继续由监控和审计证据承载，当前代码事实继续由代码、测试和项目文档承载。Notes 由全局 `hone-it` Skill 附带的 verifier 校验，项目内不复制该脚本。

## Alternatives considered

**在 Skill 内复制项目 gates。** 初始看似完整，但容易与原生 CI 和 Code Review 漂移。

**为自治维护单独创建策略目录。** 便于集中配置，但会形成第二事实来源。

**把 verifier 复制到项目。** 项目内调用方便，但会形成需要逐仓升级的强耦合副本。

**只保留临时运行日志。** 成本低，但无法沉淀跨时间的决策原因与长期后果。

## Consequences

- 常规维护可以通过有界循环推进，同时保留项目已有的 CI、Code Review 和失败即停止门禁。
- 项目需要维护可重复的 evaluator、候选 archive、隔离环境、LKG、恢复演练及 Notes。
- 后续代理可从 Notes 中理解历史取舍，并以实际结果反馈和修正未来决策。
- 项目需要通过 `hone-it` Skill 名解析 verifier 并运行；本编排不向项目复制脚本或创建平行策略文件。
