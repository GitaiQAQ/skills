# Maintenance Loop

## 编排闭环

`发现 → unlazy 选择有界任务 → 隔离实现 → 外部 evaluator → archive → 项目原生 CI → 项目原生 Code Review → 发布/观察 → LKG`

## 1. 交给 unlazy 管任务 gates

- 调用 `unlazy` 表达任务、完成条件、阻断条件、迭代预算和下一步选择。
- 每轮只处理一个可回滚的候选；预算耗尽、连续无进展或任一 gate 失败时停止。
- 本 Skill 不复制 `unlazy` 的状态机或完成判定。

## 2. 发现项目原生 gates

从仓库已有配置和文档识别测试、lint、类型检查、构建、发布、健康检查、CODEOWNERS、PR/MR 审批和分支保护。只引用这些入口，不创建另一套等价规则。未知入口作为阻断项返回 `unlazy`。

## 3. 隔离产生候选

- 在项目认可的隔离分支、worktree、容器或沙箱中修改。
- evaluator 与候选生成上下文分离；评价输入来自可重复执行的检查，不来自候选代理的自我总结。
- 将候选 diff、版本、命令、退出码和 evaluator 结果追加到项目已有制品或审计系统。

## 4. Archive 与证明

- 先把候选作为可追溯 archive 条目保留，再决定晋级；不得覆盖 LKG。
- 仅在验收是多维矩阵时调用 `prove-it`，覆盖独立维度及其组合；普通单 gate 结果不需要包装成证明矩阵。
- benchmark 或局部测试通过只能证明对应 evaluator，不得推出生产安全。

## 5. 原生 CI 与 Code Review

- 运行项目要求的 CI 入口，并用本 Skill 附带的 `scripts/verify-agent-notes.mjs <目标仓库>` 校验 Notes；脚本路径由运行环境按 Skill 名解析，项目不保存 verifier 副本。
- 通过项目既有 Code Review 流程获取结论；不得由本 Skill 自定义 reviewer 规则或替代审批。
- 任何原生 gate 未通过、证据不新鲜或结果不可追溯时，返回 `unlazy` 的阻断状态。

## 6. 发布、观察与 LKG

是否合并、发布、回滚及需要何种审批，完全服从项目原生策略。只有项目健康检查通过后，才按项目机制推进不可变 LKG；异常时进入恢复流程。

## Notes

只有长期取舍需要跨轮次保留时才写 Note。状态变化时移动同一 Note，保留 `Problem`；运行日志、CI 结果和当前代码事实仍留在其原生系统。
