# Behavior as Source：把 BDD 从测试方法升级成产品事实源

> 本文讨论一个可证伪的判断：在 AI Native 开发中，产品团队能否把一套可执行、可版本化的行为模型作为事实主干，让 PRD、技术方案、测试用例、产品说明和版本说明按需派生，而不是长期维护多套相互翻译的事实源？

## 摘要

我的核心判断是：**AI Native 开发的主要收益，不应继续押在“让 AI 多写一些代码”上，而应前移到行为的发现、澄清、补全和演化。**

更具体地说，BDD 不应只是一种测试写法。它可以被扩展成产品的版本化行为账本：

- 产品现状，是当前处于 `active` 状态的行为集合；
- 产品历史，是行为的新增、修改、废弃及其原因；
- 产品演化，是行为从假设、待决策到生效、退出的状态迁移；
- 代码，是某个行为版本的实现；
- 测试，是行为的可执行验证；
- 产品版本说明，是两个行为版本之间的差异视图；
- PRD、测试说明、用户手册和 Release Notes 仍然可以存在，但它们不再各自拥有一份产品真相，而是同一行为账本面向不同读者生成的视图。

这套思路可以概括为 **Behavior as Source**。

它与当前社区的若干成熟路线有直接关系：BDD 的可执行规格、Specification by Example、Living Documentation、需求到代码的 Traceability、Contract-first 开发、Spec-to-code、AI 测试生成和 Agent Behavior Specs。社区已经分别证明了其中多个局部环节；商业产品也在持续解决“规格、实现、测试和文档不同步”的问题。

但目前没有充分证据证明，一套 Behavior Registry 可以在大型、多团队、长期演化的产品中完整替代 PRD、测试库、产品历史和版本说明。**这是待验证的工程假设，不是行业共识。**

因此，合理的结论不是立刻建设通用平台，而是做一个范围受控、可证伪的试点。

---

## 一、问题从哪里来：我们维护了太多同一件事的副本

传统软件研发里，一个产品意图通常会经过以下链路：

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

这些产物并不完全重复，却反复描述同一组核心事实：

- 谁在什么条件下使用系统；
- 发生什么动作；
- 系统应该给出什么结果；
- 哪些行为不允许发生；
- 哪些规则从哪个版本开始有效；
- 什么结果可以证明这一版产品正确。

每增加一个独立事实载体，团队就多承担一次翻译和同步：

- PRD 修改了，开发任务没更新；
- 代码已经改变，测试仍验证旧行为；
- 测试覆盖了实现细节，却没有覆盖原始业务意图；
- 用户手册描述的是理想状态，不是线上真实状态；
- Release Notes 靠人工翻提交记录，最终只剩“体验优化、问题修复”；
- 新人面对多份材料，不知道哪一份才是当前事实。

这不只是文档管理问题。根因在于：**同一组产品事实被复制到多个载体，而每个载体又按自己的节奏变化。**

AI 如果只是帮助我们更快地生成这些载体，可能会进一步放大问题。过去文档过期，是因为人没时间写；以后文档仍然过期，只是生成速度更快、数量更多、外观更完整。

因此，真正值得回答的问题是：

> 能否减少独立事实源，只维护一套能够直接约束实现、直接运行验证、同时保留历史的产品行为模型？

---

## 二、命题定义：这里说的 BDD 到底是什么

如果 BDD 仅指几份 `.feature` 文件和 Given / When / Then 语法，那么它不足以承担完整产品事实源。

本文所说的 BDD，是一套**版本化的、可执行的产品行为模型**。每条行为至少包含：

- `Behavior ID`：稳定标识；
- `Actor / Goal`：谁要达成什么目标；
- `Given`：前置状态和依赖条件；
- `When`：触发动作；
- `Then`：可观察结果；
- `Error / Side Effect`：错误、外部调用和副作用；
- `Invariant / Property`：需要对一类输入持续成立的规则；
- `Quality Bar`：性能、安全、兼容、成本等可验证阈值；
- `Owner`：谁有权确认语义；
- `Status`：`hypothesis / pending_decision / active / deprecated` 等；
- `Introduced / Changed / Deprecated Version`：行为版本信息；
- `Rationale`：为什么引入或修改；
- `Implementation Links`：对应代码、配置和 Adapter；
- `Driver / Oracle`：如何执行和判断；
- `Evidence`：最近运行结果和最小失败证据。

它可以继续叫 BDD，也可以叫 Behavior Registry、Executable Product Model 或 Behavior as Source。名称不是关键，以下五项能力才是：

1. 人能读；
2. 机器能执行；
3. 版本可比较；
4. 与代码和运行证据可追踪；
5. 可以生成不同读者所需的视图。

---

## 三、钢人一：为什么 Behavior as Source 可能是 AI Native 开发的正确主干

### 3.1 软件价值最终体现为可观察行为

用户不消费 PRD，也不消费 `design.md`。用户消费的是系统在具体场景里的行为。

产品说“预算低于已消耗金额时必须阻止提交”，最终真正有意义的是：

```gherkin
Given Edit 模式下 currentSpend 为 100
When 用户将预算修改为 80 并提交
Then 返回稳定错误码
And 标记预算字段
And 不发送提交请求
```

只要行为契约不变，内部实现可以替换；一旦行为错误，再完整的 Plan 也无法弥补产品结果。

从这个角度看，行为是比代码和文档更稳定的一层：

- 代码可以重写；
- 框架可以迁移；
- 宿主可以变化；
- 团队可以更替；
- 但只要产品语义没有改变，同一行为契约就应继续成立。

### 3.2 一套行为可以同时承担需求、验收和回归

传统流程会分别维护需求和测试，随后再做 Traceability。Behavior as Source 则把 Traceability 建在同一个对象上。

```text
Behavior ID
↔ 业务语义
↔ 代码实现
↔ Driver / Oracle
↔ Run Result
↔ Release Version
```

产品、研发和测试不再各自解释“这条需求是什么意思”，而是围绕同一个 Behavior ID 工作。

一条线上失败被业务确认后，不应只进入 Bug 系统。它还应成为新的行为场景或不变量。一次人工纠正，也不应该只修当前代码；它应沉淀成以后不再依赖同一人工判断的回归资产。

### 3.3 产品现状、历史和演化可以由同一个模型表达

如果行为带有状态和版本信息，那么：

- 当前所有 `active` 行为的集合，就是产品现状；
- 行为的历史版本，就是产品历史；
- `hypothesis → pending_decision → executable → active → deprecated`，就是产品演化路径；
- 某两个版本之间的行为差异，就是版本说明的事实基础。

这样，产品历史不再是一堆散落在 PRD、周报、会议纪要和代码提交中的材料。它变成“系统何时开始这样工作、为什么修改、由谁确认、当前是否仍生效”的连续记录。

### 3.4 其他文档可以保留，但降级为派生视图

“如非必要勿增实体”不意味着最终用户只能读 Gherkin。

不同角色仍然需要不同界面：

- 产品负责人需要业务目标、用户路径和待决策项；
- 研发需要行为影响面、接口和实现位置；
- QA 需要 Fixture、Driver、Oracle 和覆盖情况；
- 用户需要功能说明和操作帮助；
- 发布方需要 Release Notes、灰度条件和回滚说明。

区别在于：这些不再分别维护一份真相，而是从 Behavior Registry 生成。

这类似数据库与报表的关系。报表可以很多，但事实表尽量只有一个。

### 3.5 AI 的最佳投入点应从 Coding 前移到行为工程

代码生成能力持续增强以后，“根据明确任务写实现”越来越便宜。真正昂贵的部分变成：

- 有没有漏掉关键行为；
- 多条规则是否冲突；
- 哪个历史行为必须兼容；
- 哪些边界场景还没人想到；
- 谁能确认最终语义；
- 新行为会破坏哪些旧行为；
- 线上失败怎样沉淀为永久资产。

因此，AI 更有价值的工作是：

1. 从代码、文档、工单、事故和用户反馈中提取行为候选；
2. 识别相互矛盾、不可判定或缺 Owner 的行为；
3. 追问隐含的权限、并发、幂等、生命周期和异常决策；
4. 生成边界值、组合场景和 Property 候选；
5. 对新想法做行为影响分析；
6. 从代码 Diff 识别未声明的行为变化；
7. 从失败 Trace 生成最小反例和回归场景；
8. 根据行为版本生成代码、测试、文档和 Release Notes。

这才可能带来真正的职责变化：

```text
人：决定什么行为值得进入产品，以及冲突时如何取舍
AI：推动行为发现、补全、实现、验证和文档派生
开发：从主要生产活动退到受行为约束的实现后端
测试：从事后翻译需求退到 Oracle、覆盖和证据治理
```

### 3.6 商业产品正在解决“多实体不同步”

Cucumber 将 Example 同时视为 specification、documentation 和 test，整个 Example 集合就是系统的 executable specification。CucumberStudio 的 Living Documentation 则从 CI/CD 测试运行生成并同步功能文档，让文档反映最新 Feature 和 Scenario 状态。

来源：

- [Cucumber Introduction](https://cucumber.netlify.app/docs/guides/overview/)
- [Cucumber Gherkin Reference](https://cucumber.netlify.app/docs/gherkin/reference/)
- [CucumberStudio Living Documentation](https://support.smartbear.com/cucumberstudio/docs/bdd/living-doc.html)

Specmatic Genie 已经把自然语言业务需求连接到 API 规格、生产代码和 Contract Tests；Kiro 也明确把 OpenAPI/Swagger 当作测试生成的 Source of Truth。

来源：

- [Specmatic Genie](https://specmatic.io/genie/)
- [Kiro: From OpenAPI/Swagger specifications to test suite](https://kiro.dev/blog/from-openapi-swagger-to-test-suite-in-seconds-with-kiro/)

这些产品尚未实现完整的 Behavior as Source，也不能单独证明本文的整体命题。它们只能说明：规格、实现、测试和文档不同步，已经成为商业工具持续解决的问题。

### 3.7 研究分别验证了若干关键环节

直接相关的研究包括：

- **Behavior-Driven Requirements Traceability via Automated Acceptance Tests**：利用 BDD 自动验收测试建立 User Story 与源代码之间的普遍追踪，目标是降低传统 Traceability 的维护成本。  
  <https://ieeexplore.ieee.org/document/8054891>

- **Unifying Agile Requirements Specification Quality Control and Implementation Conformance Assurance**：Concordia 同时支持利益相关者验证需求规格，并生成测试用例和自动测试脚本。  
  <https://www.maxwell.vrac.puc-rio.br/35867/35867.PDF>

- **Can Large Language Models Transform Natural Language Intent into Formal Method Postconditions?**：LLM 将自然语言意图转成可执行断言，生成的 Postconditions 捕获了 Defects4J 中 64 个真实历史 Bug。  
  <https://arxiv.org/pdf/2310.01831>

- **Comprehensive Evaluation and Insights Into the Use of Large Language Models in the Automation of BDD Acceptance Test Formulation**：评估多种 LLM 自动生成 BDD 验收测试的能力，Few-shot 示例能改善生成质量。  
  <https://arxiv.org/pdf/2403.14965>

- **Test-Driven AI Agent Definition (TDAD)**：把行为规格视为源输入，把 Agent Prompt 和 Tool Configuration 视为编译产物，通过可执行测试持续修正 Agent。  
  <https://arxiv.org/pdf/2603.08806>

- **E2EDev**：以用户需求、BDD 场景和自动执行流水线评测端到端软件开发 Agent。  
  <https://arxiv.org/html/2510.14509>

这些工作没有直接证明“BDD 可以成为完整产品账本”。它们提供的是局部证据：行为可以被表达、执行和追踪，也可以用于生成测试、约束代码与 Agent。能否把这些能力组合成长期可靠的产品事实源，仍需工程验证。

---

## 四、钢人二：为什么 Behavior as Source 可能失败，甚至制造新的单点幻觉

要认真论证这个方向，不能只反驳“BDD 太麻烦”这种弱观点。最强反方会从模型表达能力、完整性、激励机制和组织现实四个层面攻击。

### 4.1 行为集合永远不等于完整产品意图

BDD 擅长表达“系统在已知场景里应该怎么做”。它不自动回答：

- 为什么选择这个市场；
- 哪类用户最值得服务；
- 哪个问题应该优先解决；
- 哪个体验目标值得牺牲性能或成本；
- 团队什么时候应该停止投入；
- 一个看似合理的行为是否会破坏整体产品定位。

这些不是缺几条 Scenario，而是价值判断和机会选择。

可以把它们作为 Behavior Metadata 或 notes，但一旦大量关键信息长期存在于 notes，所谓“唯一事实源”就被削弱了。

### 4.2 Example 只能证明已想到的例子，不能证明行为空间完整

公开场景全部通过，不代表系统正确。Agent 可能：

- 对可见用例硬编码；
- 只覆盖典型路径；
- 忽略组合状态；
- 通过修改 Fixture 或 Oracle 制造绿色；
- 在未覆盖输入上违反隐含意图。

SpecBench 等研究已经把“可见测试通过、组合隐藏测试失败”作为 Coding Agent Reward Hacking 的衡量方式。

来源：

- [SpecBench: Measuring Reward Hacking in Long-Horizon Coding Agents](https://arxiv.org/html/2605.21384v1)

这意味着 Behavior Registry 不能只维护手写 Example。它至少需要：

- Property / Invariant；
- 组合场景生成；
- 隐藏评测；
- 对抗测试；
- 权限隔离；
- 人工抽样审查；
- 线上 Trace 回流。

当这些能力全部加入后，它已经不再是传统意义上的 BDD 框架，而是一套完整的 Eval 和治理系统。

### 4.3 “单一事实源”可能变成“单一错误源”

多实体同步确实昂贵，但多视角有时不是纯粹重复。

PRD、技术设计、测试、用户文档分别面向不同问题：

- PRD 关注用户和价值；
- 技术设计关注结构、依赖和演进成本；
- 测试关注可判定性和风险覆盖；
- 用户文档关注可理解性和操作任务。

如果强行压进一个 Behavior Schema，可能出现两种结果：

1. Schema 越来越复杂，最后比原来的多文档系统更难维护；
2. 为了保持简洁，大量重要语义被挤到自由文本字段，重新失去可执行性。

所以问题可能不是“实体数量越少越好”，而是：

> 哪些信息真的共用同一生命周期，哪些信息只是可以从同一事实派生？

### 4.4 架构决策无法全部由行为推出

两个实现可以通过相同的行为测试，但长期成本完全不同。

例如：

- 共享模块是否直接依赖宿主 Context；
- 状态是否正确隔离；
- 迁移是否保留回滚路径；
- 服务边界是否导致后续团队耦合；
- 数据协议是否允许未来扩展。

可以增加 Architecture Tests，但架构判断不只是“是否违反某条规则”。它还涉及尚未发生的变化、组织边界和不可量化的维护成本。

高质量的 Decision Record 可能仍然必要。若把所有决策都压缩成 tests，会丢掉“为什么当时这么选”和“什么条件变化后应该重审”。

### 4.5 BDD 在现实中经常退化成代码完成后的测试

针对 50,000 个开源项目的实证研究发现，BDD 框架虽然有一定普及，但很多团队只是把它当测试工具。Scenario、Fixture 与生产代码的共同演化并不稳定，开发者常在编码过程中或之后补测试，而不是让行为先行。研究者指出，真正实施 BDD 成本较高，安装框架不等于采用 BDD 方法。

来源：

- [Demystifying the adoption of behavior-driven development in open source projects](https://mdipenta.github.io/journals/2020-01-01-Demystifying-the-adoption-of-behavior-driven-development-in-open-source-projects)

这是本文命题最重要的现实反证：

> 如果维护 Behavior Registry 的成本没有显著下降，它最终仍会落后于代码，沦为另一套过期文档。

### 4.6 AI 可以生成更多场景，也可以更快制造错误确定性

LLM 生成 BDD 和测试已经可行，但远非可靠到无需人工。

Text-to-Testcase 研究在五个开源项目上生成约 7,000 个测试，报告了 78.5% 的语法正确率、67.09% 的需求对齐率和 61.7% 的代码覆盖率。这说明方向可行，也说明自动生成的结果仍需要筛选和校准。

来源：

- [Enhancing Large Language Models for Text-to-Testcase Generation](https://arxiv.org/pdf/2402.11910)

TestEval 对 17 个模型的评估也显示，针对特定分支和路径生成有效测试仍然困难。

来源：

- [TESTEVAL: Benchmarking Large Language Models for Test Case Generation](https://preview.aclanthology.org/fix-old-resolve/2025.findings-naacl.197.pdf)

如果团队因为“AI 已经补全过”而降低审查，行为账本可能看起来覆盖完整，实际充满错误断言、重复场景和被遗漏的关键风险。

### 4.7 最危险的失败不是红灯，而是假绿

Behavior as Source 会把大量决策集中到一个系统里。它的最大风险不是跑不起来，而是：

- 行为被错误确认；
- Oracle 判断了错误目标；
- 隐藏场景仍与公开场景同源；
- 历史实现中的 Bug 被提取为“业务真值”；
- 用户文档由错误行为自动生成；
- 下游所有派生物保持一致，但一致地错了。

多实体系统的问题是“不一致”；单一行为源的问题是“错误传播半径极大”。

所以单一事实源必须配套：

- 明确 Owner；
- `unknown / pending_decision / conflict` 状态；
- 来源和证据等级；
- 人工晋级；
- 可回滚版本；
- 独立的隐藏验证；
- 对行为本身的审计。

---

## 五、正反双方真正分歧在哪里

正反双方并不争论“行为是否重要”。真正的分歧是：

### 正方判断

产品的大部分长期事实最终都可以表达为行为、属性、状态和可执行门禁。其他文档只是不同读者的投影视图。AI 会大幅降低行为抽取、补全、生成和维护成本，因此过去难以成立的单一行为源，在 AI Native 阶段开始具备经济性。

### 反方判断

产品意图、架构判断和组织协作包含大量无法压缩成行为的知识。多视角并非全是重复；强行统一会制造过度复杂的 Behavior Schema，或让一个错误源控制所有下游。AI 能降低生成成本，但不等于降低真值确认成本。

### 可以共同接受的底线

无论采用哪种组织方式，以下原则都成立：

1. 不能让 PRD、代码、测试和文档长期拥有互相冲突的业务真值；
2. 能执行的约束，应优先执行化；
3. 不能执行的判断，要有 Owner、理由和重审条件；
4. AI 生成的行为和测试必须有独立验证；
5. 失败和人工纠正应沉淀为可复用资产；
6. 新增的实体或流程层必须证明自己降低了总体成本。

---

## 六、综合判断：方向值得验证，但需要重新划定边界

我倾向支持 Behavior as Source，但需要做两个修正。

### 修正一：不要把它局限为传统 BDD

传统 BDD 容易被理解成 Gherkin + Cucumber + Acceptance Tests。你的主张实际上更大：

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

因此，BDD 可以是入口和核心语法，但系统本质是一套 Versioned Executable Product Model。

### 修正二：不要一开始宣称覆盖“所有产品迭代场景”

更可防守的说法是：

> 对可以形成可观察结果、可验证约束或明确状态迁移的产品事实，Behavior Registry 应成为优先事实源；其他材料只有在拥有独立生命周期和不可替代用途时才成为单独实体。

这仍然遵守“如非必要勿增实体”，同时避免把市场判断、组织责任和架构取舍硬塞进 Given / When / Then。

### 最终命题

> 在 AI Native 阶段，产品研发的默认中心应从代码和静态 PRD 前移到可执行、可版本化的行为模型。产品现状、历史、测试、代码追踪和版本说明，应尽可能由同一 Behavior Registry 驱动。AI 的主要价值是推动行为发现、冲突澄清、场景补全、反例生成和持续演化；开发与测试逐步退成行为模型的实现与验证后端。独立的 PRD、技术方案和测试资产只有在能够证明其独立生命周期与增量价值时才保留。

---

## 七、如何把命题变成可证伪的试点

不要先建平台。先在一个边界清晰但足够复杂的模块上比较两种方式。

### 7.1 对照方案

#### Control：现有流程

```text
PRD
→ 技术分析 / 迁移文档
→ 开发实现
→ QA 用例
→ 手工验收
→ 版本说明
```

#### Treatment：Behavior as Source

```text
Behavior Registry
→ AI 补全场景与冲突
→ 业务 / 架构 Owner 确认真值
→ AI 生成或修改实现与 Driver / Oracle
→ 自动执行
→ 失败与人工纠正回流
→ 行为 Diff 生成版本说明
```

### 7.2 最小数据结构

每个 Behavior 至少具备：

```yaml
id: budget.edit.current-spend-floor
status: active
owner: product-owner
introduced_in: v1
changed_in: v2
actor: advertiser
intent: edit campaign budget safely
given:
  - mode == edit
  - currentSpend == 100
when:
  - set budget to 80
  - submit
then:
  - error.code == BUDGET_BELOW_CURRENT_SPEND
  - error.field == budget
  - submitRequest.count == 0
invariants:
  - budget >= currentSpend
implementation:
  - shared-domain-rule
  - pangle-driver
  - ole-driver
evidence:
  - latest-run-id
rationale:
  - historical behavior confirmed by owner
```

这不是建议最终一定使用 YAML，只是为了说明：行为模型必须包含生命周期、Owner、实现映射和证据，不能只有自然语言 Scenario。

### 7.3 AI 的职责

AI 可以：

- 从既有实现和文档提取候选行为；
- 把同义或重复行为合并；
- 识别 `unknown / conflict / pending_decision`；
- 生成边界和组合场景候选；
- 建议 Property 和隐藏评测；
- 建立 Behavior 与代码的追踪；
- 从失败 Trace 提取最小反例；
- 根据 Behavior Diff 生成产品说明、QA 视图和 Release Notes。

AI 不应：

- 独自确认产品真值；
- 把旧代码行为自动视为正确需求；
- 修改隐藏场景和晋级门槛；
- 通过修改 Oracle 让实现变绿；
- 自动晋级高风险行为；
- 把未知项补成看似完整的答案。

### 7.4 衡量指标

#### 实体与同步成本

- 长期维护的独立事实源数量；
- 同一业务规则在不同文档重复出现次数；
- PRD、代码、测试和用户文档不一致数量；
- 文档维护和人工同步时间。

#### 行为质量

- 真实问题转成回归行为的比例；
- P0 / P1 行为遗漏数；
- 隐藏场景退化数；
- `pending_decision` 平均停留时间；
- 错误 Oracle 和重复行为数量。

#### 交付效率

- 从想法到第一个可执行场景的时间；
- 从行为确认到代码通过的时间；
- 人工开发分钟数；
- 人工测试分钟数；
- 返工轮次；
- Token、工具调用和墙钟时间。

#### 演化能力

- Behavior Diff 是否能生成可用 Release Notes；
- 第二个模块能否复用相同 Registry / Driver / Oracle 协议；
- 新 Agent 或新模型接入时，是否无需重建业务上下文；
- 历史行为能否被准确查询和回放。

### 7.5 晋级标准

只有同时满足以下条件，才认为方向值得扩大：

1. 独立事实源和同步成本明显下降；
2. P0 / P1 行为遗漏没有上升；
3. 开发和测试人力确实前移到行为决策，而不是转化成维护 Gherkin 的新成本；
4. 自动生成的产品说明和版本说明可直接使用，或只需少量编辑；
5. 第二个模块仍能复用，不是为第一个案例定制；
6. Behavior Registry 的维护成本没有随场景数失控；
7. 出现错误行为时可以快速定位、回滚和审计。

---

## 八、可能出现的三种试点结果

### 结果 A：完整成立

Behavior Registry 成为事实源，代码、测试和产品文档都能稳定派生，人工主要投入真值判断。这将支持“Behavior as Source 是 AI Native 产品工程主干”的强结论。

### 结果 B：局部成立

BDD 很适合产品行为和验收，但架构、机会判断和协作计划仍需要独立载体。此时应采用：

```text
Behavior Registry
+ 极薄 Decision Notes / ADR
+ Generated Views
```

这仍然比完整 SDD 多实体链路更轻。

### 结果 C：不成立

场景数量迅速膨胀，Owner 无法持续确认，AI 生成大量低质量用例，团队最终在 BDD 之外重新维护 PRD 和测试。此时说明 Behavior Registry 只是新增实体，应停止扩张。

一个好试点必须允许得到结果 C。否则不是实验，只是建设项目。

---

## 九、开放问题

以下问题仍没有现成答案：

1. Behavior 的最佳粒度是什么？太粗无法执行，太细会爆炸。
2. 业务 Example、Property、Architecture Rule 和 Policy 是否应共用一个模型？
3. 如何区分历史正确行为、历史 Bug 和偶然实现？
4. 如何防止 AI 根据公开行为过拟合？
5. 如何设计真正独立的隐藏场景？
6. 如何在行为数量增长后保持可检索和可理解？
7. 如何处理强主观体验，如“易用”“自然”“可信”？
8. 如何让非技术 Owner 审查行为，而不要求他们理解测试代码？
9. 如何根据 Behavior Diff 生成不同读者可用的说明，同时不泄漏内部实现？
10. Behavior Registry 本身由谁维护、审核和治理？
11. 如何防止行为账本成为新的文档债务？
12. 当代码和行为冲突时，什么证据可以决定谁错了？

这些不是反对方向的理由，而是试点必须回答的问题。

---

## 十、一句话版本

> 在 AI Native 阶段，真正值得维护的产品源代码，可能不是代码，也不是 PRD，而是一套可执行、可版本化、能持续吸收真实反馈的业务行为。其他产物如果能从它生成，就不应再各自拥有一份真相。

---

## 十一、参考资料

### BDD、可执行规格与 Living Documentation

- Cucumber, Introduction: <https://cucumber.netlify.app/docs/guides/overview/>
- Cucumber, Gherkin Reference: <https://cucumber.netlify.app/docs/gherkin/reference/>
- SmartBear CucumberStudio, Living Documentation: <https://support.smartbear.com/cucumberstudio/docs/bdd/living-doc.html>

### 商业产品与工程实践

- Specmatic Genie: <https://specmatic.io/genie/>
- Kiro, OpenAPI/Swagger to Test Suite: <https://kiro.dev/blog/from-openapi-swagger-to-test-suite-in-seconds-with-kiro/>
- Braintrust, Behavior Specs: <https://www.braintrust.dev/blog/behavior-specs>

### 需求、代码和测试追踪

- Behavior-Driven Requirements Traceability via Automated Acceptance Tests: <https://ieeexplore.ieee.org/document/8054891>
- Unifying Agile Requirements Specification Quality Control and Implementation Conformance Assurance: <https://www.maxwell.vrac.puc-rio.br/35867/35867.PDF>
- Integrating Traceability within the IDE to Prevent Requirements Documentation Debt: <https://research.rug.nl/files/84473807/Chapter_7.pdf>

### AI 生成规格、测试与代码

- Can LLMs Transform Natural Language Intent into Formal Method Postconditions?: <https://arxiv.org/pdf/2310.01831>
- Comprehensive Evaluation of LLMs for BDD Acceptance Test Formulation: <https://arxiv.org/pdf/2403.14965>
- Enhancing LLMs for Text-to-Testcase Generation: <https://arxiv.org/pdf/2402.11910>
- DiffSpec: Differential Testing with LLMs using Natural Language Specifications and Code Artifacts: <https://arxiv.org/pdf/2410.04249>
- CLEVEREST: Can LLM Generate Regression Tests for Software Commits?: <https://arxiv.org/pdf/2501.11086>
- TDAD: Compiling Tool-Using Agents from Behavioral Specifications: <https://arxiv.org/pdf/2603.08806>
- E2EDev: Benchmarking LLMs in End-to-End Software Development: <https://arxiv.org/html/2510.14509>
- SpecBench: Measuring Reward Hacking in Long-Horizon Coding Agents: <https://arxiv.org/html/2605.21384v1>
- TESTEVAL: Benchmarking LLMs for Test Case Generation: <https://preview.aclanthology.org/fix-old-resolve/2025.findings-naacl.197.pdf>

### 现实采用与反证

- Demystifying the adoption of behavior-driven development in open source projects: <https://mdipenta.github.io/journals/2020-01-01-Demystifying-the-adoption-of-behavior-driven-development-in-open-source-projects>
