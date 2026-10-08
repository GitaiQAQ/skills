# Audit Routing

本文件不定义风险等级或审批规则。审计只核验自治维护编排是否服从项目原生治理，并把结果反馈给 `unlazy` gates。

## 事实来源

- 任务状态、预算和停止条件：`unlazy`。
- 测试、lint、构建、发布与健康检查：项目原生 CI 配置。
- 审批、reviewer 和保护规则：项目原生 Code Review 与仓库设置。
- Notes 结构：目标仓库的 `.agents/notes/README.md` 与全局 `hone-it` Skill 附带的 `scripts/verify-agent-notes.mjs`。
- 恢复目标：项目原生、不可变且可解析的 LKG。

若来源缺失，不在本 Skill 内补造默认值；将缺失项标为阻断。

## Audit 检查

1. `unlazy` 是否记录明确任务、完成 gate、停止条件和预算。
2. 候选是否在隔离环境产生，并由外部 evaluator 判定。
3. archive 是否保留候选、结果和来源，且未覆盖 LKG。
4. 实际执行证据是否对应项目原生 CI，而非代理自述或平行规则。
5. Code Review 是否经过项目原生入口。
6. `hone-it` Skill 附带的 `scripts/verify-agent-notes.mjs <目标仓库>` 是否通过。
7. LKG 是否不可变、可获取，并能被项目原生恢复流程消费。

## 何时调用 prove-it

当验收存在多个独立维度，例如“运行环境 × 平台 × 数据迁移阶段 × 回滚路径”，调用 `prove-it` 建立完整 checkpoint 表面。下列情况不需要：

- 单一脚本的存在性检查。
- 只有一个明确 CI gate 的改动。
- 可以由项目原生测试结果直接回答的布尔条件。

`prove-it` 只组织证明覆盖面，不替代 evaluator、CI 或 Code Review。

## 结论

输出 `pass`、`warn` 或 `fail` 及证据位置。`fail` 返回 `unlazy` 的阻断 gate；是否允许例外及其审批方式由项目原生策略决定。
