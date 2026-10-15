# Behavior as Source：把 BDD 从测试方法升级成产品事实源

> 本文讨论一个可证伪的判断：在 AI Native 开发中，能否把一套可执行、可版本化的行为模型作为产品事实主干，让代码、测试、产品说明和版本说明成为派生物，而不是长期维护多套相互翻译的真相。

## 摘要

我的核心判断是：AI Native 开发的主要收益，不应继续押在“让 AI 多写一些代码”上，而应前移到行为的发现、澄清、补全和演化。

BDD 不应只是一种测试写法。它可以被扩展成产品的版本化行为账本：

- 产品现状，是当前处于 `active` 状态的行为集合；
- 产品历史，是行为的新增、修改、废弃及其原因；
- 产品演化，是行为从假设、待决策到生效、退出的状态迁移；
- 代码，是某个行为版本的实现；
- 测试，是行为的可执行验证；
- 版本说明，是两个行为版本之间的差异视图。

PRD、测试说明、用户手册和 Release Notes 仍然可以存在，但它们不再各自拥有一份产品真相，而是同一行为账本面向不同读者生成的视图。本文把这套思路称为 **Behavior as Source**。

现有实践和研究已为多个局部环节提供证据：BDD 可同时承担规格、文档和测试；自动验收测试可以连接需求与代码；商业工具已能从规格生成代码、测试和 Living Documentation；AI 研究也在探索从自然语言意图生成断言、BDD、测试和 Agent 配置。

但目前没有充分证据证明，一套 Behavior Registry 可以在大型、多团队、长期演化的产品中完整替代 PRD、测试库、产品历史和版本说明。这仍然是待验证的工程假设，不是行业共识。

## 问题从哪里来：我们维护了太多同一件事的副本

传统产品研发通常沿着以下链路展开：

```text
想法 / 业务目标
→ PRD
→ 技术方案
→ 开发任务
→ 代码
→ 测试用例
→ 验收报告
→ 用户文档
→ 版本说明
```

这些产物并非完全重复，但它们反复描述了同一组核心事实：谁在什么条件下使用系统、发生什么动作、系统应该给出什么结果、哪些行为不允许发生、什么证据可以证明这一版产品正确。

每增加一个独立事实载体，团队就多承担一次翻译和同步。PRD 改了，开发任务没更新；代码已经改变，测试仍验证旧行为；用户手册描述的是理想状态，不是线上真实状态；Release Notes 最后只剩“体验优化、问题修复”。

AI 如果只是帮助团队更快地产生这些载体，可能会把问题放大。过去文档过期，是因为人没时间写；以后文档仍会过期，只是生成速度更快、数量更多、外观更完整。

真正值得问的是：能否减少独立事实源，只维护一套能够直接约束实现、直接运行验证、同时保留历史的产品行为模型？

## 命题定义：这里说的 BDD 是什么

如果 BDD 仅指几份 `.feature` 文件和 Given / When / Then 语法，它不足以承担完整产品事实源。

本文所说的 BDD，是一套版本化的、可执行的产品行为模型。每条行为至少包含：

- 稳定的 Behavior ID；
- Actor、目标、前置状态、触发动作和可观察结果；
- 错误、外部调用和副作用；
- 需要对一类输入持续成立的 Invariant / Property；
- 性能、安全、兼容、成本等可验证 Quality Bar；
- Owner、决策状态和版本信息；
- 引入或修改原因；
- 实现、Driver、Oracle 和最近运行证据。

它的名字可以继续叫 BDD，也可以叫 Behavior Registry、Executable Product Model。名字不是关键。关键是它同时具备：人能读、机器能执行、版本可比较、与代码和证据可追踪，并能生成不同读者需要的视图。

## 钢人一：为什么 Behavior as Source 可能是正确主干

### 软件价值最终只存在于可观察行为

用户不消费 PRD，也不消费 `design.md`。用户消费的是系统在具体场景里的行为。代码可以重写，框架可以迁移，宿主可以变化；只要产品语义没有变化，同一行为契约就应继续成立。

例如，“预算不得低于已消耗金额”只有落到可观察结果上，才能同时约束实现和验收：

```gherkin
Given Edit 模式下 currentSpend 为 100
When 用户将预算修改为 80 并提交
Then 返回稳定错误码
And 标记预算字段
And 不发送提交请求
```

### 一套行为可以同时承担需求、验收和回归

传统流程分别维护需求和测试，随后再做 Traceability。Behavior as Source 则把追踪关系建在同一个对象上：

```text
Behavior ID
↔ 业务语义
↔ 代码实现
↔ Driver / Oracle
↔ Run Result
↔ Release Version
```

一条线上失败被业务确认后，不应只进入 Bug 系统。它还应成为新的行为场景或不变量。一次人工纠正，也不应只修当前代码；它应沉淀成以后不再依赖同一人工判断的回归资产。

### 产品现状、历史和演化可以由同一个模型表达

当前所有 `active` 行为的集合就是产品现状；行为的历史版本就是产品历史；`hypothesis → pending_decision → executable → active → deprecated` 就是产品演化路径；两个版本之间的行为差异，就是版本说明的事实基础。

### 其他文档可以保留，但降级为派生视图

“如非必要勿增实体”不意味着最终用户只能读 Gherkin。产品、研发、QA、用户和发布方仍然需要不同界面。区别在于，这些界面不再分别维护真相，而是从 Behavior Registry 生成。报表可以很多，事实表尽量只有一个。

### AI 的最佳投入点应从 Coding 前移到行为工程

代码生成越来越便宜，真正昂贵的是：有没有漏关键行为，多条规则是否冲突，哪些历史行为必须兼容，谁能确认最终语义，新行为会破坏什么，线上失败如何沉淀成永久资产。

因此 AI 更有价值的工作是从代码、文档、事故和反馈中提取行为候选，识别冲突和未知项，生成边界与组合场景，分析新增想法的行为影响，从失败 Trace 生成最小反例，并根据 Behavior Diff 生成代码、测试、文档和版本说明。

### 实践和研究为关键环节提供了局部证据

Cucumber 官方把 Example 同时定义为 specification、documentation 和 test，整个 Example 集合就是 executable specification。CucumberStudio 则从 CI/CD 测试运行生成 Living Documentation。

[Cucumber Introduction](https://cucumber.netlify.app/docs/guides/overview/)

[Cucumber Gherkin Reference](https://cucumber.netlify.app/docs/gherkin/reference/)

[CucumberStudio Living Documentation](https://support.smartbear.com/cucumberstudio/docs/bdd/living-doc.html)

Specmatic Genie 已把自然语言需求连接到 API 规格、生产代码和 Contract Tests；Kiro 也把 OpenAPI / Swagger 作为测试生成的事实源。

[Specmatic Genie](https://specmatic.io/genie/)

[Kiro: OpenAPI / Swagger to Test Suite](https://kiro.dev/blog/from-openapi-swagger-to-test-suite-in-seconds-with-kiro/)

研究层面已有工作支持行为追踪、需求到测试、自然语言意图到机器断言、BDD 自动生成以及从行为规格编译 Agent。

- [Behavior-Driven Requirements Traceability via Automated Acceptance Tests](https://ieeexplore.ieee.org/document/8054891)

- [Unifying Agile Requirements Specification and Implementation Conformance](https://www.maxwell.vrac.puc-rio.br/35867/35867.PDF)

- [Natural Language Intent to Formal Postconditions](https://arxiv.org/pdf/2310.01831)

- [LLMs for BDD Acceptance Test Formulation](https://arxiv.org/pdf/2403.14965)

- [Test-Driven AI Agent Definition](https://arxiv.org/pdf/2603.08806)

- [E2EDev](https://arxiv.org/html/2510.14509)

这些工作没有直接证明完整的 Behavior as Source。它们提供的是局部证据：行为可以被表达、执行和追踪，也可以用于生成测试、约束代码与 Agent。能否把这些能力组合成长期可靠的产品事实源，仍需工程验证。

## 钢人二：为什么 Behavior as Source 可能失败

### 行为集合不等于完整产品意图

BDD 擅长表达系统在已知场景里应该怎么做，却不能自动回答市场选择、机会成本、优先级和停止条件。可以把这些放进 Metadata 或 notes，但如果大量关键信息长期留在外部，所谓唯一事实源就会被削弱。

### Example 只能覆盖已经想到的例子

公开场景全部通过，不代表系统正确。Agent 可能针对可见用例硬编码，忽略组合状态，甚至修改 Fixture 或 Oracle 制造绿色。Behavior Registry 必须配套 Property、组合场景、隐藏评测、对抗测试、权限隔离和线上 Trace 回流。

[SpecBench: Measuring Reward Hacking in Long-Horizon Coding Agents](https://arxiv.org/html/2605.21384v1)

### 单一事实源可能变成单一错误源

多实体系统的问题是不一致；单一行为源的问题是错误传播半径极大。一旦行为或 Oracle 错了，代码、测试、用户文档和版本说明会一致地错。

因此必须保留明确 Owner、`unknown / pending_decision / conflict` 状态、来源和证据等级、人工晋级、版本回滚以及独立隐藏验证。

### 架构决策无法全部由行为推出

两个实现可以通过相同的业务行为测试，但长期维护成本完全不同。模块边界、组织耦合、回滚路径和未来演进条件，不能全靠当前 Example 推导。Architecture Test 可以覆盖一部分规则，但“为什么这么选、什么条件变化后重审”仍可能需要极薄的 Decision Notes 或 ADR。

### BDD 在现实中经常退化成代码完成后的测试

针对大量开源项目的实证研究发现，许多团队只是把 BDD 框架当测试工具；Scenario、Fixture 和生产代码的共同演化并不稳定，开发者往往在编码过程中或之后补测试。真正采用 BDD 成本较高，安装框架不等于采用方法。

[Demystifying the adoption of BDD in open source projects](https://mdipenta.github.io/journals/2020-01-01-Demystifying-the-adoption-of-behavior-driven-development-in-open-source-projects)

这项研究指出了关键约束：AI 必须真正降低维护 Behavior Registry 的成本，否则它只会成为另一套过期文档。

### AI 能生成更多场景，也能制造错误确定性

Text-to-Testcase 研究说明 AI 自动生成测试可行，但需求对齐和代码覆盖仍远非完美；TestEval 也显示，针对特定分支和路径生成有效测试仍然困难。

[Enhancing LLMs for Text-to-Testcase Generation](https://arxiv.org/pdf/2402.11910)

[TESTEVAL](https://preview.aclanthology.org/fix-old-resolve/2025.findings-naacl.197.pdf)

最危险的失败不是红灯，而是假绿：历史 Bug 被提取为业务真值，错误 Oracle 被所有派生物共同使用，团队因为“AI 已经补全”而降低审查。

## 综合判断

我倾向支持 Behavior as Source，但需要两个修正。

### 不要把它局限为传统 BDD

```text
Behavior as Source
= Examples
+ Properties / Invariants
+ Quality Gates
+ Versioning
+ Traceability
+ Evidence
+ Lifecycle
+ Governance
```

BDD 可以是入口和核心语法，但系统本质是一套 Versioned Executable Product Model。

### 不要一开始宣称覆盖所有产品迭代场景

更可防守的说法是：对可以形成可观察结果、可验证约束或明确状态迁移的产品事实，Behavior Registry 应成为优先事实源；其他材料只有在拥有独立生命周期和不可替代用途时才成为单独实体。

**最终命题：**

在 AI Native 阶段，产品研发的默认中心应从代码和静态 PRD 前移到可执行、可版本化的行为模型。产品现状、历史、测试、代码追踪和版本说明，应尽可能由同一 Behavior Registry 驱动。AI 的主要价值是推动行为发现、冲突澄清、场景补全、反例生成和持续演化；开发与测试逐步退成行为模型的实现与验证后端。独立 PRD、技术方案和测试资产只有在能够证明其独立生命周期与增量价值时才保留。

## 可证伪试点

不要先建平台。先在一个边界清晰但足够复杂的模块上比较现有流程和 Behavior as Source。

|Control：现有流程|Treatment：Behavior as Source|
|---|---|
|PRD → 技术分析 → 开发 → QA 用例 → 验收 → 版本说明|Behavior Registry → AI 补全 → Owner 确认 → AI 生成实现与验证 → 失败回流 → Behavior Diff 生成说明|

### 重点指标

- 长期维护的独立事实源数量；

- 同一规则在不同材料中的重复与不一致；

- 从想法到第一个可执行场景的时间；

- P0 / P1 行为遗漏和隐藏场景退化；

- 人工开发、人工测试和文档同步时间；

- 返工轮次、Token、工具调用和墙钟时间；

- Behavior Diff 生成的版本说明是否可用；

- 第二个模块能否复用同一协议；

- Behavior Registry 的维护成本是否随场景数失控。

### 允许失败

一个好试点必须允许得出“不成立”的结论。如果场景迅速膨胀、Owner 无法持续确认、AI 生成大量低质量用例，团队最终仍在外部维护 PRD 和测试，那么 Behavior Registry 只是新增实体，应停止扩张。

## 开放问题

1. Behavior 的最佳粒度是什么？

2. Example、Property、Architecture Rule 和 Policy 是否应共用一个模型？

3. 如何区分历史正确行为、历史 Bug 和偶然实现？

4. 如何设计真正独立的隐藏场景？

5. 如何处理“易用、自然、可信”等强主观体验？

6. 如何让非技术 Owner 审查行为，而不要求理解测试代码？

7. 如何防止 Behavior Registry 本身成为新的文档债务？

8. 当代码和行为冲突时，什么证据可以决定谁错了？

## 一句话版本

> 在 AI Native 阶段，真正值得维护的产品源代码，可能不是代码，也不是 PRD，而是一套可执行、可版本化、能持续吸收真实反馈的业务行为。其他产物如果能从它生成，就不应再各自拥有一份真相。
