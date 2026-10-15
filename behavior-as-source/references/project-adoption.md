# 在现有项目中启动最小试点

本指引用于首次接入，或已有行为文件但没有可执行链路的项目。目标是完成一个小范围“来源 → 条目 → 实现与验证映射 → 真实证据”试点，不要求首次接入就晋级为 `active`。

## 1. 读取项目现状

阅读项目指令、相关实现、测试、需求和决策记录。确认模块边界、Owner、测试入口、证据保存位置和当前规则来源。不要为建立完整行为库而扫描无关模块。

## 2. 选择行为和位置

优先选择一个输入输出清楚、有现有测试且依赖较少的行为。先运行 `behavior-list` 和 `behavior-locate` 查重。

在负责该行为的主实现旁创建 `<short-name>.behavior.md`。跨目录实现列入 `implementation`，不要建立集中副本。项目级的接入范围、验证入口和证据目录可以保存在 `docs/behavior/adoption.md`，但不得复制行为断言。

## 3. 建立条目与映射

复制 [behavior.md](../templates/behavior.md)，填入真实来源、实现路径、Driver 和 Oracle。Owner 无法确认时保留 `TODO` 和 `pending_decision`。没有运行环境时记录准确阻塞条件，不模拟成功。

## 4. 运行并保存证据

先运行项目现有测试。证据至少能定位行为版本、实现版本、验证版本、命令、环境、结果和输出。没有 CI Run ID 时，`evidence.run_id` 引用实际保存的本地记录。

运行：

```bash
npx --no-install behavior-lint <project-root>
npx --no-install behavior-impact --id <behavior-id> --root <project-root>
```

## 5. 完成标准

- 条目能追溯到来源和真实实现；
- Driver 和 Oracle 已执行并保存证据，或明确列出未执行原因；
- 状态符合现有证据；
- Registry lint 没有 error；
- 没有第二套 Registry、额外 Runner 或无消费者的派生文档。

在此停止首次接入。只有用户继续要求扩大试点时，才读取 [pilot-metrics.md](pilot-metrics.md)。
