# 评测说明

两类评测，分开跑。

## 触发评测

`trigger-evals.json`：10 条 query，`should_trigger` 标注该不该加载本 skill。兼容 Anthropic Skill Creator 的 description 评测循环。只用目标 agent 环境实际用的模型跑，换模型测的就是另一套触发策略。

## 改写质量评测

`cases/` 下 4 个 case，每个 case 一个目录：

- `degraded.md`：输入，一份"AI 味"重、冗长的退化稿。
- `gold.md`：真人写的参照稿。
- `facts.json`：这个 case 的 `category`、`prompt` 和 `protected_facts`（改写里不能丢、不能改的事实）。

四个 case 覆盖四类文体：决策材料、架构方案、运维规范、操作指南。所有素材脱敏，不含真实路径、commit、内部产品名或项目正文。

手动跑一个 case：

1. 在干净上下文里，用 `facts.json` 的 `prompt` + 该 case 的 `degraded.md`，分别跑 `with_skill`（加载本 skill）和 `without_skill`（不加载）。
2. 按 [rubric.md](./rubric.md) 判：先过事实硬门禁，再比哪份更接近 `gold.md`。
3. 记一句结论。四个 case 都更接近或持平、且没有事实回归，才保留这次 skill 改动。

## 验证

```bash
npm test
```
