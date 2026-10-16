# tooling.registry.progress-report-methodology 运行证据

## Owner 确认

- 日期：2026-10-16
- Owner：3o
- 决定：approved
- 范围：项目进度报告的三层信号、状态映射保护和通用 Registry 报告边界。

## 本地验证

- 命令：`node --test tests/report-methodology.test.mjs`
- 结果：通过。
- 验证内容：项目报告分列规格成熟度、交付进展和测试证据；项目模板声明分母版本、单位和完整状态映射；未映射状态输出 `unknown` 且不生成百分比；通用 Registry 模板只报告规格成熟度。

## Hidden scenarios

- 消费项目没有 progress-report 模板时，只生成通用 Registry 成熟度报告，不推断项目进展。
- 状态词未映射时，不把它猜测为完成、部分完成或阻塞。
