# Bootstrap

## 目标

在不破坏仓库现状的前提下，建立最小 Agent Notes 决策面。Bootstrap 不创建私有维护策略、检查清单或配置目录。

## 步骤

1. 确认目标是已存在的 Git 仓库根目录，并检查版本控制状态；路径错误时停止，不创建替代目录。
2. 先检查目标是否已有 `.agents/notes/README.md`：
   - 不存在时，运行 `node scripts/bootstrap.mjs <目标仓库>` 创建标准 Notes 契约。
   - 已存在且与模板一致时，可幂等运行初始化器。
   - 已存在但采用自定义契约时，不运行机械初始化；读取现有规范，先确认全局 verifier 是否兼容，再由 Agent 按其标题、状态、分类和索引规则适配采用 Note。
3. 将脚本结果分为 `created` 与 `skipped`；`skipped` 表示已有文件被完整保留。
4. 检查两个产物：
   - `.agents/notes/README.md`
   - `.agents/notes/implemented/process/YYYY-MM-DD-project-rsi-adoption.md`
5. 运行本 Skill 附带的 `scripts/verify-agent-notes.mjs <目标仓库>`；脚本路径由运行环境按 Skill 名解析，不要把 verifier 复制到目标仓库，也不记录其物理安装路径。
6. 调用 `unlazy` 建立后续任务及 gates；gates 只引用项目原生 CI 和 Code Review。
7. 只有需要证明多个独立验收维度时才调用 `prove-it`。

## 幂等要求

- 已存在的文件无论内容是否为空都不得覆盖。
- 缺失目录可以创建。
- 重复运行时，文件内容与元数据不应变化。
- 部分初始化状态下，只补齐缺失文件。
- 任意日期的采用 Note 已存在时必须保留且不得重复创建；首次初始化以当日日期创建。
- 已有自定义 Notes 规范时必须在写入任何文件前失败，不能混入不兼容的 adoption Note。
- 不创建项目内 `scripts/verify-agent-notes.mjs`，也不要求预建空的 lifecycle/class 目录。
- 不创建私有维护配置目录，也不创建 `AI-MAINTENANCE.md`、策略 YAML 或检查 YAML。
- 遇到目录占用目标文件路径、权限错误或无效目标时应失败并返回非零状态。

## 完成条件

- 两个产物存在且全局 Notes verifier 校验通过。
- 重复执行无新增文件、无内容变化。
- 目标仓库原有文件未被覆盖，且未创建私有维护配置。
