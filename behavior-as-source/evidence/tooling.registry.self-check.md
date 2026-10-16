# tooling.registry.self-check 运行证据

## 本地自检

- 日期：2026-10-16
- 环境：macOS，Node.js 18+
- 命令：`npm run self-check`
- 结果：通过
- 说明：先执行 `behavior-lint`，再执行独立 `node:test`。两步均返回 0。

## 独立包复验

- 日期：2026-10-16
- 命令：`npm pack`
- 结果：通过
- 验证项：
  - `behavior-lint`：1 个文件，0 error，0 warning
  - `behavior-list`：返回 1 条记录
  - `behavior-locate`：返回唯一匹配文件
  - `behavior-impact`：返回 active 详情

## Hidden packaged CLI

- 场景：安装后的 `behavior-lint` 能校验独立消费 Registry，而不是只依赖源码仓自身数据。
- 结果：通过
- 证据：独立包中的 `behavior-lint` 对 `consumer-fixture` 返回 0 error、0 warning。
