# Behavior as Source：背景与技术方案

本文是 `behavior-as-source` 技能的唯一背景与技术方案正文，面向产品、研发、测试和行为 Owner。它说明为什么采用行为事实源、如何执行，以及何时停止试点。技能操作入口仍为 [SKILL.md](../SKILL.md)。

**方案状态：待验证的工程假设。** 当前目录提供技能说明、字段定义、模板和试点指标，不代表已经实现 Registry 服务、自动生成器、执行平台或发布系统。本文描述目标流程，不宣称已有端到端运行结果。

## 1. 目标、范围与结论

Behavior as Source 主张：对能够形成可观察结果、可验证约束或明确状态迁移的产品事实，优先维护一套可执行、可版本化的行为模型。代码、测试、产品说明和版本说明引用同一行为版本，减少独立维护同一规则的成本。

本方案的目标是减少事实重复、规则冲突和人工同步，并让真实失败形成可回归的资产。AI 的主要投入应前移到行为发现、澄清、补全和演化，而不只用于代码生成。

范围包括行为提取、语义确认、实现追踪、执行验证、版本演化和文档派生。以下事项不在范围内：

- 用行为模型代替市场选择、优先级和机会成本判断；
- 从测试结果自动推出全部架构决策；
- 先建设通用平台，再寻找使用场景；
- 因为 AI 可以生成更多场景，就扩大模型和流程。

现有代码结构、测试框架、发布机制和组织责任保持不变，除非试点证明必须调整。无法执行化但有独立用途的判断，可以保留在简短决策记录中，记录 Owner、理由和重审条件。

成立标准不是“产出更多行为文件”，而是同步成本下降、行为遗漏没有增加、历史可追踪、派生说明可用，且维护成本可持续。

## 2. 背景：同一规则存在多个独立副本

传统研发通常经过以下过程：

```text
想法 / 业务目标 → PRD → 技术方案 → 开发任务 → 代码
→ 测试用例 → 验收报告 → 用户文档 → 版本说明
```

这些产物有不同用途，却反复描述同一组事实：谁在什么条件下使用系统、触发什么动作、系统应该返回什么结果、禁止哪些副作用，以及规则从哪个版本开始有效。

每个副本按自己的节奏变化，就会出现 PRD 已修改但任务未更新、代码已改变但测试仍验证旧行为、用户手册描述理想状态、版本说明只能列提交记录等问题。AI 可以加快文档生成，但不能自动消除同步成本，也不能确认生成内容正确。

本方案因此关注一个问题：能否让同一规则只拥有一个语义来源，同时保留不同读者需要的视图？

## 3. 核心概念与事实边界

Behavior-Driven Development（BDD，行为驱动开发）可以作为入口，但几份 `.feature` 文件和 Given / When / Then 语法不足以承担产品事实源。

| 概念 | 本文含义 |
| --- | --- |
| Behavior | 有稳定标识、Owner、版本、可观察结果和验证方式的行为条目 |
| Behavior Registry | 保存行为条目及其历史的集合；试点可直接使用版本库文件 |
| Example | 一个具体前置条件、动作和预期结果的实例 |
| Invariant / Property | 对一类输入持续成立的约束或性质 |
| Quality Bar | 性能、安全、兼容、成本等可验证要求 |
| Driver | 准备输入并触发行为的执行方式 |
| Oracle | 根据确认的行为语义判断结果的方式 |
| Evidence | 实际运行结果及其可追溯证据 |
| Owner | 有权确认行为语义的人或角色，不得由 AI 自行指定 |
| 派生视图 | 从已确定行为版本生成的产品、测试或用户说明 |

行为模型需要同时做到：人能读、机器能执行、版本可比较、实现与证据可追踪，并能生成不同视图。

Registry 表达的是**已确认的预期行为**。运行证据表达的是**某次运行实际观察到的行为**。两者不能混为一谈：`active` 不代表所有线上环境都已部署或持续正确；失败 Trace 也不自动成为业务规则。

原文把当前 `active` 集合称为产品现状。更准确地说，它是当前生效的行为契约；判断某个发布版本的实际状态，还需要对应的实现版本、部署记录和运行证据。

## 4. 正方论证：为什么行为模型可能成为产品事实主干

正方的命题不是“行为测试很重要”，而是：**对可观察的产品规则，行为模型比代码或静态文档更适合作为共同的语义来源；如果 AI 能降低其维护成本，围绕行为版本组织研发可能比维护多套规则更经济。** 这个命题需要下面几步推理共同成立。

### 4.1 行为契约比具体实现更稳定

用户使用系统，是为了在某个条件下完成动作并得到结果。PRD 和代码分别表达意图与实现，但用户最终遇到的是系统行为。因此，对可观察的产品规则，应先明确结果，再选择实现。

例如，“预算不能低于已消耗金额”不是某个校验函数的内部细节。它决定输入是否有效、错误如何展示，以及是否允许发送提交请求。换框架、重写模块或迁移宿主后，这些产品语义仍应成立。

推理链是：产品规则约束可观察结果；多个实现可以满足同一个结果；实现变化不一定意味着规则变化。因此，把行为契约从具体实现中分离，能够保留迁移和重构时必须遵守的产品语义。

这不意味着所有行为永远稳定。产品规则也会变，但应显式形成行为版本，不能随实现修改而悄然改义。

### 4.2 同一个行为对象可以减少需求到测试的重复翻译

传统流程先写需求，再由研发解释为代码、由测试解释为断言、由文档作者解释为说明。每次解释都可能丢失条件，或者引入不同理解。

如果同一条行为同时记录前置条件、动作、结果、错误和副作用，Owner 就可以在实现前确认它；研发围绕它实现，验证者围绕它建立 Oracle。各角色仍做不同工作，但不再分别维护业务规则。

```text
Behavior ID ↔ 行为版本与业务语义 ↔ 实现版本
            ↔ Driver / Oracle ↔ 运行证据 ↔ 发布版本
```

追踪关系因此不只是交付后补上的对照表，而是从同一个稳定标识向外建立。线上失败被 Owner 确认后，可以补充该行为的反例或不变量，并进入后续回归。

这一步成立的前提是：条目足够明确，Owner 能审查，Driver 和 Oracle 确实验证条目，而不是另写一套隐藏的业务解释。否则重复只是从文档迁到了测试代码。

### 4.3 版本化可以统一表达契约现状、历史和演化

一条孤立 Scenario 只能说明一个例子。加上稳定 ID、状态、版本、原因和证据后，它才能说明一条规则何时生效、为什么改变、谁确认，以及哪些实现满足它。

因此，当前生效的行为版本可以表达契约现状；版本历史可以表达规则演化；两个确定版本的差异可以成为版本说明的事实基础。行为退出也必须保留记录，否则版本说明会漏掉被删除的能力。

这里统一的是契约历史。线上实际状态仍需关联实现版本、部署记录和运行证据。只有这层区分成立，团队才不会把“文档中已生效”误当成“所有环境已正确运行”。

### 4.4 多个读者视图不必拥有多份业务真值

产品需要目标和用户路径，研发需要影响面和实现位置，测试需要执行与判断方式，用户需要操作说明。这些表达不同，不等于底层规则必须分别维护。

例如，“预算过低时阻止提交”可以在产品视图中解释为限制，在用户说明中解释为错误处理，在测试视图中表示为错误码和请求次数。只要它们来自同一行为版本，改规则时就有一个明确入口。

所以，正方追求的是减少独立维护的业务事实，而不是减少所有文件。架构取舍、市场判断和发布操作若具有独立用途，仍可单独记录。派生视图也需要检查可理解性，不能把机器字段直接当成用户说明。

### 4.5 AI 可能改变行为维护的成本结构

行为先行并非没有成本。人工需要发现遗漏、识别重复、确认冲突、维护追踪和更新说明。若这些工作全由人工承担，Registry 可能比原流程更贵。

AI 的潜在作用，是承担可重复的提取、检索、影响分析、反例整理和视图生成，让人集中判断“应该怎样”和“冲突时选哪一个”。代码生成只是其中一步。

因此，正方真正依赖的是一个经济性假设：**减少的重复翻译、同步和返工成本，大于新增的条目维护、Owner 审查和验证成本。** AI 能生成更多内容不能证明这个假设，必须测量总成本。

若假设成立，开发可以更多地围绕确定行为实现，测试可以更多地投入 Oracle 和风险覆盖。若不成立，职责只是换了名字，团队仍承担同样甚至更高的维护负担。

### 4.6 局部实践不能直接证明整体命题

原文引用了可执行规格、Living Documentation、Contract-first 工具，以及需求追踪、自然语言断言、BDD 生成和 Agent 行为规格研究。这些材料分别涉及行为表达、执行、追踪或生成。

即使每个局部环节可行，也不能直接推出组合后的系统能在大型、多团队、长期演化的产品中持续工作。组合后仍可能出现维护成本、责任冲突和错误传播问题。

因此，外部资料用于提出和检查假设，不能代替本项目的试点证据。文末保留原文资料入口；本次未重新核验外部结论，不把原文中的定量研究结果作为验收依据。

## 5. 反方论证、真正分歧与有条件的结论

最强反方不是“BDD 太麻烦”，而是：**行为模型可能表达不了关键知识；即使表达得了，统一维护和确认真值的成本，也可能高于多视角协作带来的收益。** 必须分别检查这些问题，不能用“增加字段或测试”统一回答。

### 5.1 行为集合不等于完整产品意图

Scenario 可以描述系统如何响应，却不能自动回答为什么选择某类用户、为什么优先解决某个问题，或何时停止投入。这些判断决定哪些行为值得实现，本身未必有可执行的正确答案。

如果全部塞进 Metadata，Schema 会越来越复杂；如果全部放进自由文本，所谓可执行事实源又无法约束这些关键决定。因此，“所有产品知识都由行为统一表达”是过强主张。

方案只能将可观察规则作为行为事实源。价值判断保留 Owner、理由和重审条件。接受这个边界意味着 Registry 是产品事实主干，而不是全部产品知识的唯一容器。

### 5.2 已想到的 Example 不能证明行为空间完整

有限例子通过，只能说明这些输入满足断言。实现仍可能忽略组合状态、权限条件或并发影响，也可能针对公开测试硬编码。

Property、独立隐藏验证和线上反馈能提供额外证据，但也需要设计和维护。它们不能保证穷尽全部风险，更不能因追求完整性而无限扩展场景。

因此，正方必须证明在相当风险范围内，行为遗漏没有增加。若公开结果改善而隐藏场景或线上故障退化，就不能宣称方案提高了正确性。

### 5.3 单一事实源可能成为单一错误源

多份文档会不一致，但不同角色也可能从不同角度发现错误。若所有代码、测试和说明都从同一条错误行为生成，它们可能一致地错。

例如，AI 从历史实现提取了一个 Bug，Owner 未仔细确认，Oracle 又按该 Bug 编写。实现通过测试，用户文档也描述相同行为。此时一致性提高了，正确性反而下降。

所以，单一语义来源不能取消独立审查。Owner 确认、来源追溯、隐藏验证和历史回退用于控制错误传播，但它们增加了成本。试点必须将这些成本计入，而不能只计算自动生成节省的时间。

### 5.4 行为相同，不代表架构选择等价

两个实现可能通过同一组行为测试，但模块耦合、状态隔离、迁移难度和回滚成本不同。当前输入输出无法完全表达未来变化和组织边界。

部分架构约束可以执行化，但“为什么选择这条边界”和“哪些条件变化后重审”仍需要决策记录。把这些判断全部写成测试，会丢失理由；全部挤进 Behavior，又可能扩大模型。

因此，行为约束实现的产品结果，必要架构记录解释结构取舍。只有当某条架构规则有明确用途和可判定结果时，才将其执行化。

### 5.5 Registry 可能成为代码完成后的另一份文档

有了行为文件，不代表行为驱动了开发。如果团队先写代码，再由 AI 根据代码补条目，条目可能只是实现的复述。此时它无法识别实现偏离意图，还会增加维护对象。

同样，若 Owner 无法持续确认，待决策条目会积压；若派生说明不可用，团队会重新手写 PRD 和测试。Registry 就成为新增副本。

这不是靠强制流程就能解决的问题。试点需要检查真实使用顺序和维护成本；长期落后于代码、外部重复维护恢复，都是停止扩张的信号。

### 5.6 AI 降低生成成本，不等于降低确认成本

大量候选可以快速生成，但人仍要识别错误断言、重复规则和缺失前提。生成越容易，筛查负担也可能越重。

最危险的情况是团队因为“AI 已补全”而降低审查，得到外观完整的假绿结果。实现者不得通过修改 Oracle、Fixture、隐藏场景或晋级条件来掩盖失败。确需改变预期时，先由 Owner 确认语义变化，再更新版本。

因此，衡量收益时必须同时计算生成、筛查、确认、验证和后续修订时间。场景数量、测试通过数和文档篇幅都不能单独证明收益。

### 5.7 双方真正的分歧

双方都可以接受行为重要、规则应可追踪、失败应形成回归资产。分歧在于三个尚未验证的前提：

| 分歧 | 正方预期 | 反方担忧 | 需要的证据 |
| --- | --- | --- | --- |
| 表达范围 | 大部分长期产品规则能表达为行为和约束 | 关键知识留在模型之外，或迫使 Schema 膨胀 | 实际变更中哪些规则可表达，哪些必须独立记录 |
| 总体成本 | AI 减少翻译、同步和返工 | 筛查、确认和治理抵消收益 | 相同范围内的人工时间、返工和维护成本 |
| 可靠性 | 同一版本和证据减少漂移 | 错误行为向所有下游传播 | 遗漏、隐藏退化、错误 Oracle 与恢复记录 |

因此，解决分歧需要对照试点，而不是继续扩大概念定义。

### 5.8 综合判断与可推翻条件

本文有条件地支持 Behavior as Source：对可观察、可验证的产品规则，将行为版本作为优先语义来源，值得试点；对有独立生命周期的价值判断和架构理由，保留简短决策记录。

这个结论由三步推出：行为契约能够跨实现保留产品语义；共用行为版本可能减少重复翻译；AI 可能降低维护成本。但前两步只说明结构上可行，第三步仍需实际成本和质量证据。

因此，技术方案采用 Registry、必要决策记录和派生视图，不先建设通用平台。它需要的不只是 Gherkin，而是必要的 Examples、不变量、质量要求、版本、追踪、证据和责任边界。这些组成按用途加入，不能成为扩展框架的理由。

如果同步和返工下降，严重遗漏未增加，Owner 能持续确认，派生视图可用，且历史可恢复，试点才支持扩大。若只在某类模块成立，就保留局部使用；若维护成本更高、假绿风险增加，或团队恢复外部重复维护，就应否定或收缩方案。

这些判断将直接约束下一节的技术方案，并由第 7 节的试点检验。

## 6. 最小技术方案

### 6.1 组成与责任

先使用当前版本库、条目模板、现有测试工具和运行结果存储，不要求新增服务、数据库或框架。

| 组成 | 生产者 | 输入和输出 | 消费者 |
| --- | --- | --- | --- |
| 行为条目 | AI 提取，Owner 确认 | 来源材料 → 带版本的行为契约 | 实现者、验证者、视图生成者 |
| 实现映射 | 实现者 | 行为版本 → 代码、配置或 Adapter 路径 | 评审者、执行者 |
| Driver / Oracle | 实现者与验证者，按责任审查 | 行为契约 → 可执行动作与判断 | 现有测试执行工具 |
| 运行证据 | 执行工具 | 固定输入、实现和验证版本 → 结果与失败证据 | Owner、评审者、回归执行者 |
| 派生视图 | AI 或现有生成工具 | 确定的行为版本及差异 → 面向读者的说明 | 产品、用户、发布方 |
| 决策记录 | 对应决策 Owner | 无法执行化的取舍 → 理由与重审条件 | 维护者、后续评审者 |

实现者不能自行确认业务真值。隐藏评测的维护者与实现者需要隔离；条目只保存引用，不把隐藏断言暴露给实现者。

### 6.2 数据契约与唯一维护位置

[JSON Schema](../schemas/behavior.schema.json) 是字段和枚举的机器契约，[字段说明](behavior-schema.md) 解释使用边界，[行为模板](../templates/behavior.md) 是创建条目的起点。本文解释用途，不另建一套 Schema。

frontmatter 字段分为四组：

- 身份与生命周期：`id`、`owner`、`status`、引入、修改和废弃版本；
- 行为内容：`actor`、`intent`，以及正文中的 Gherkin Scenario；
- 追踪：实现位置、Driver、Oracle、Evidence 和引入理由；
- 审计：隐藏评测引用、Owner 审查记录和冲突条目引用。

行为语义一经生效，不得就地改义；修改必须保留历史版本，废弃必须记录退出原因。一次运行证据需要能关联行为版本、实现版本、验证版本和输入条件。具体保存方式沿用试点项目现有工具，不在此预设新协议。

当前模板不包含业务默认值。`TODO` 表示尚未完成，不能作为执行成功或 Owner 已确认的证据。字段定义区分必填与按需字段；质量阈值必须来自项目要求，不能从示例复制。

### 6.3 状态与可执行性

当前技能只允许以下五个 `status` 值：

| 状态 | 含义与处理 |
| --- | --- |
| `hypothesis` | 候选假设，尚未确认语义 |
| `pending_decision` | 等待 Owner 决策或尚未满足晋级条件 |
| `conflict` | 与其他行为断言冲突，记录双方来源并由 Owner 裁决 |
| `active` | Owner 已确认，验证和独立性条件满足，且无现有生效行为冲突 |
| `deprecated` | 不再生效，保留历史与退出原因 |

正常路径为 `hypothesis → pending_decision → active → deprecated`。任何候选发现冲突时先进入 `conflict`；裁决后再按晋级条件处理。发现生效行为错误时，按技能要求退回 `pending_decision`，锁定相关派生物并进入纠正流程。

原文中的 `executable` 表示执行准备情况，不是当前合法状态；`unknown` 表示信息未知，也不是合法状态。未知项保留 `TODO` 和待决策说明，不新增枚举。

### 6.4 一次变更的完整流程

1. **提取候选。** 从 PRD、评审、代码 Diff、事故、Trace 或用户反馈提取 Actor、Given / When / Then 和 Rationale。保留原始来源；历史代码只证明发生过什么，不证明应该怎样。
2. **查找已有行为。** 按稳定 ID 和语义检索 Registry，确定新增、修改、废弃或对齐。冲突记录双方断言和证据，不由 AI 自动裁决。
3. **确认语义。** Owner 确认预期结果、错误、副作用、必要不变量和质量要求。信息不全时保留待决策状态，不用默认值补齐。
4. **准备实现与验证。** 使用现有模板和测试工具建立实现映射、Driver 和 Oracle。只覆盖确认的行为；根据实际风险准备独立隐藏验证，不追求场景数量。
5. **固定输入并执行。** 固定本次行为版本、实现版本、验证版本和必要依赖。Driver 触发行为，Oracle 检查结果，执行工具保存实际运行结果与最小失败证据。
6. **检查晋级条件。** Owner 显式确认、Driver / Oracle 可独立跑通、隐藏场景与公开场景不同源，且不冲突，才可以进入 `active`。任一条件未满足时，不宣称行为已生效。
7. **生成并核对视图。** 由同一确定版本按需生成实现说明、QA 视图、用户帮助或版本说明。行为变更需执行相关验证，并将真实 CI 运行或已保存的本地运行记录写入 `evidence`；仅生成视图不要求重复运行无关检查。不得以生成成功代替验证成功。
8. **处理后续失败。** 区分实现错误、Oracle 错误和行为语义错误。Owner 确认需要新增、修订或废弃的行为，保留反例并运行相关回归。

### 6.5 失败传播与恢复

| 情况 | 结果与下一步 |
| --- | --- |
| 缺 Owner、语义或关键字段 | 保留待决策状态；不能晋级 |
| 行为冲突 | 标为 `conflict`；记录来源，等待 Owner 裁决 |
| Driver 未执行或执行失败 | 保存可取得的失败信息；不得伪造成功 Run ID |
| Oracle 不满足 | 保存最小反例；先定位原因，不修改预期来迎合实现 |
| 运行证据无法保存或追溯 | 验证证据不完整；不能按成功晋级 |
| 派生视图与行为不一致 | 修正生成或编辑结果；不得反向悄改行为语义 |
| 生效行为被确认错误 | 退回待决策、锁定相关派生物，记录 Owner 决策并纠正 |

行为版本回退和代码部署回滚是两件事。前者恢复契约历史，后者恢复运行版本；是否需要部署回滚，由项目现有发布流程决定。恢复后仍需取得对应版本的验证证据。

### 6.6 最小实例

以下预算规则是设计示例，不是通用模板或已执行结果：

```gherkin
Given Edit 模式下 currentSpend 为 100
When 用户将预算修改为 80 并提交
Then error.code 为 BUDGET_BELOW_CURRENT_SPEND
And error.field 为 budget
And submitRequest.count 为 0
```

行为 ID 为 `budget.edit.current-spend-floor`。Driver 准备编辑状态并触发提交；Oracle 检查错误和请求次数。一般约束是预算不得低于已消耗金额；拒绝无效输入不代表系统曾接受了低预算状态。

Owner 未确认，或 Driver、Oracle、Evidence 仍为 `TODO` 时，该条目保持 `pending_decision`。验证通过只证明对应运行满足断言，不能据此推断未测试输入、其他宿主或所有线上环境正确。

### 6.7 文档派生与版本差异

| 读者 | 派生内容 | 来源 |
| --- | --- | --- |
| 研发 | 行为影响、接口和实现位置 | When / Then、实现映射 |
| QA | 执行动作、判断规则和结果 | Given / When / Then、不变量、Evidence |
| 产品与发布方 | 新增、修改和退出的行为 | 两个确定行为版本的差异 |
| 用户 | 操作步骤和可观察结果 | Intent、前置条件、结果与错误 |

版本说明应识别新增、修改和废弃，并引用对应版本。不得把待决策条目写成已发布功能，也不得只筛选当前 `active` 条目而漏掉已废弃行为。面向用户的视图需要核对可理解性，并去除不应公开的内部实现信息。

## 7. 可证伪试点与验收

选择一个边界清晰但有真实复杂度的模块。先记录现有流程的基线，再比较以下两种方式：

| 现有流程 | Behavior as Source |
| --- | --- |
| PRD → 技术分析 → 开发 → QA → 验收 → 版本说明 | 行为条目 → AI 补全与冲突识别 → Owner 确认 → 实现与验证 → 失败回流 → 行为差异生成说明 |

试点开始前，Owner 应确定比较范围、观察窗口、数据来源和“明显下降”“少量编辑”“快速恢复”的判定方式。原文没有给出统一数值阈值，本文不补造。

[试点指标与晋级门槛](pilot-metrics.md) 维护具体指标。主要检查四个维度：

- **同步成本：** 独立事实源数量、规则重复、不一致数量、人工同步时间；
- **行为质量：** P0 / P1 遗漏、隐藏场景退化、错误 Oracle、重复行为、待决策停留时间；
- **交付效率：** 首个可执行场景耗时、确认到通过耗时、人工开发与测试时间、返工、Token、工具调用和墙钟时间；
- **演化能力：** 版本说明可用性、历史查询与回放、第二个模块复用协议的成本。

只有同步成本明显下降、严重遗漏没有上升、人工没有转化为新的行为文件维护成本、派生说明可用、历史可恢复，且维护成本可持续时，才考虑扩大。第二个模块验证复用后，才能据此支持跨模块推广。

试点允许三种结果：

1. **完整成立：** 行为事实源和派生链路稳定运行，人工主要投入语义决策；仍需后续长期验证。
2. **局部成立：** 行为与验收适用，架构或机会判断仍需独立记录；采用 Registry、简短决策记录和派生视图。
3. **不成立：** 场景膨胀、Owner 无法持续确认、低质量候选筛查成本过高，或团队重新在外部维护同一套 PRD 和测试；停止扩张。

## 8. 待验证问题

- Behavior 应多粗或多细，才能兼顾可执行性与维护成本？
- Example、Property、架构规则和 Policy 是否确有共用模型的需求？
- 如何区分历史正确行为、历史 Bug 和偶然实现？代码与行为冲突时，谁依据什么证据裁决？
- 如何保持隐藏验证独立，并避免 AI 根据公开行为过拟合？
- 如何处理“易用、自然、可信”等主观体验，并让非技术 Owner 审查？
- 行为增长后，谁负责检索、去重、审核和历史治理？
- 新 Agent 或模型能否复用上下文，派生视图能否避免泄漏内部信息？

这些问题由试点回答。没有实际消费者和证据前，不为它们预建平台或扩展字段。

## 9. 当前技能材料的分工

- [SKILL.md](../SKILL.md)：操作入口、执行顺序和不可改变的约束。
- 本文：唯一背景、论证、技术流程和适用边界。
- [JSON Schema](../schemas/behavior.schema.json)：字段、类型与状态枚举的机器契约。
- [字段说明](behavior-schema.md)：字段用途与使用边界。
- [行为模板](../templates/behavior.md)：创建条目的起点。
- [项目接入指引](project-adoption.md)：在其他项目中完成首次最小试点。
- [试点指标](pilot-metrics.md)：指标与扩大试点条件。
- [CLI 文档](../README.md)：安装方式、命令、参数和输出示例。

旧 YAML 模板和合并前的导航文档只保留在 Git 历史中，不作为当前事实源。

## 10. v2 实现与后续 rollout

### 10.1 目标和范围

v2 已在当前 `ai-skills` monorepo 内实现。`behavior-as-source/` 同时是 Skill 源码目录和 npm workspace package，不在业务仓库内另建工具 package。

当前 package 已交付以下内容：

- 将 Behavior 文件从 YAML 改为 `*.behavior.md`；
- 用 YAML frontmatter 保存元数据，用一个 Gherkin block 保存行为；
- 提供 `behavior-lint`、`behavior-diff`、`behavior-impact`、`behavior-list` 和 `behavior-locate`；
- 更新当前 Skill、字段说明和模板；
- 用当前仓库的测试方式验证 Schema、解析和 CLI。

本阶段不修改 `ad_vertical_frontends` 或其他消费仓库，不迁移其中的 19 条 Behavior，也不接入其 CI。消费仓库迁移是独立 rollout，需要单独确认范围。它用于验证 v2 能否落地，不是当前 package 的实现位置。

以下事项继续排除：Cucumber Runner、step definition、共享 defaults、Living Doc HTML、embedding 漂移检测、跨语言绑定、常驻服务和 Skill 自更新 CLI。

### 10.2 当前仓库事实和实现选择

当前 checkout 已确认以下事实：

| 项目事实 | v2 选择 |
| --- | --- |
| 根目录使用 npm workspaces | 将 `behavior-as-source` 加入根 `workspaces` |
| workspace scope 为 `@flome` | package 名为 `@flome/behavior-as-source` |
| `prove-it` 和 `hone-it` 直接发布 ESM `.mjs` | CLI 和共享模块使用 ESM `.mjs` |
| 现有测试使用 `node`、`node:assert` 和临时目录 | 使用 `node:test` 或同等的 Node 内置测试，不引入测试框架 |
| 当前 package 没有编译步骤 | bin 直接指向 `scripts/*.mjs`，不增加 TypeScript 构建链 |
| 当前仓库没有 CI 配置 | 先提供稳定的 `npm test` 和 CLI 命令，不凭空新增 CI 平台配置 |

交接稿中的 `packages/behavior-as-source/`、`pnpm`、Rstest 和业务仓库 CI 命令不适用于当前仓库。它们只在消费仓库 rollout 时按该仓库事实重新确定。

运行时依赖固定为 `gray-matter`、`@cucumber/gherkin`、`@cucumber/messages`、`ajv`、`ajv-formats` 和 `fast-glob`。依赖通过当前 workspace 的 npm 命令安装，不手改 lockfile。

### 10.3 目标目录

```text
behavior-as-source/
  package.json
  README.md
  SKILL.md
  schemas/
    behavior.schema.json
  src/
    parse.mjs
    schema.mjs
    lint.mjs
    diff.mjs
    impact.mjs
    registry.mjs
    types.mjs
  scripts/
    behavior-lint.mjs
    behavior-diff.mjs
    behavior-impact.mjs
    behavior-list.mjs
    behavior-locate.mjs
  tests/
    fixtures/
    parse-lint.test.mjs
    diff.test.mjs
  references/
    background-and-design.md
    behavior-schema.md
    project-adoption.md
    pilot-metrics.md
    tooling.md
  templates/
    behavior.md
```

`README.md` 只记录 package 安装方式、五个命令、参数、退出码和代表性输出。Skill 工作流只写在 `SKILL.md`。`references/tooling.md` 只链接 `README.md`，不复制命令说明。

### 10.4 事实源

| 内容 | 唯一维护位置 |
| --- | --- |
| frontmatter 字段、类型、枚举和必填性 | `schemas/behavior.schema.json` |
| Agent 的操作顺序和晋级规则 | `SKILL.md` |
| 空白条目结构 | `templates/behavior.md` |
| CLI 参数和输出 | `README.md` |
| 产品背景、反方论证和本实施计划 | `references/background-and-design.md` |
| 消费项目的产品理由、证据和 Behavior | 消费项目自己的版本库 |

`references/behavior-schema.md` 只解释字段用途并链接 JSON Schema。它不得复制完整字段表。当前背景文档是本产品的设计记录；消费项目 checked-in Skill 不复制本文，项目自己的采用理由放在项目文档中。

### 10.5 第一阶段：冻结文件契约

唯一合法文件以 `.behavior.md` 结尾，并包含：

1. YAML frontmatter，`id` 是第一个 key；
2. 一个一级标题；
3. 恰好一个标记为 `gherkin` 的 fenced block；
4. block 内恰好一个 `Scenario` 或 `Scenario Outline`；
5. 可选的 `## Rationale` 和 `## Notes`。

Schema 负责字段类型、必填字段、枚举和 `additionalProperties`。lint 负责顺序、文件存在、Gherkin 语法、跨文件唯一性和状态门禁。两者不得重复实现同一规则。

必填字段为 `id`、`status`、`owner`、`introduced_in`、`actor`、`intent`、`implementation`、`driver`、`oracle`、`evidence`、`hidden_scenarios_ref` 和 `review_log`。按需字段只有 `changed_in`、`deprecated_in`、`conflicts_with` 和 `rationale`。

`status` 只允许 `hypothesis`、`pending_decision`、`active`、`deprecated` 和 `conflict`。`evidence` 固定包含 `result`、`run_id` 和 `minimal_failure`；`result` 只允许 `not_run`、`passed`、`failed` 和 `blocked`。

编码前冻结以下细节：

- `implementation` 是路径数组。`pending_decision` 可以使用空数组；`active` 至少有一个真实路径；
- `oracle` 是非空字符串数组；
- `changed_in` 和 `deprecated_in` 是字符串；
- `conflicts_with` 是 Behavior ID 数组；
- frontmatter 中的 `rationale` 是字符串；复杂说明写入 `## Rationale`；
- `review_log` 必须是数组，空数组合法。v2 首版不虚构尚无真实样本的审查记录字段；
- `evidence.run_id` 是仓库相对证据文件路径。`passed` 时该文件必须存在。

Schema 完成前先用一个合法样本和一个非法样本核对这些决定。字段仍有分歧时停止编码，只确认会改变 Schema 的问题。

### 10.6 第二阶段：实现解析和 lint

解析只保留一个内核：

1. `parseBehaviorSource(path, source, root)` 解析字符串；
2. `parseBehaviorFile(path, root)` 读取文件后调用内核；
3. `parseBehaviorDir(root)` 用 `fast-glob` 查找 `**/*.behavior.md`。

`gray-matter` 解析 frontmatter。解析器从 Markdown 中提取 Gherkin block，前置 `Feature: <id>` 后交给 `@cucumber/gherkin`。解析结果保留 frontmatter、正文、一级标题、Gherkin AST 和 step 列表，供所有 CLI 复用。

package 导出 `parseBehaviorSource`、`parseBehaviorFile`、`parseBehaviorDir`、`lintBehavior` 和 `lintBehaviorRegistry`。ESM 源码使用 JSDoc 固定 `BehaviorMeta`、`BehaviorFile` 和 `LintIssue` 的对象形状，不为类型声明增加编译步骤。

`behavior-lint` 先实现以下 error：

- `schema`；
- `gherkin-parse`、`gherkin-count` 和 `scenario-count`；
- `id-position` 和 `id-unique`；
- `implementation-exists`；
- `active-gate`；
- `evidence-consistency`。

第一版 warning 只有 `vague-filename` 和 `missing-rationale`。warning 默认输出但不改变退出码；`--no-warnings` 只隐藏 warning，不引入配置文件。

`active-gate` 要求 owner 非 `TODO`、`implementation` 非空、`evidence.result` 为 `passed`、`evidence.run_id` 指向现存文件，并且 `hidden_scenarios_ref` 非 `TODO`。`evidence-consistency` 要求任何 `passed` 结果都能定位证据文件。`vague-filename` 的黑名单固定为 `test`、`a`、`new`、`tmp`、`xxx` 和 `foo`。

### 10.7 第三阶段：实现五个 CLI

五个命令共用参数解析、Registry 扫描、JSON 输出和错误处理。退出码固定为：成功 `0`，发现条目或目标问题 `1`，使用错误 `2`。

| 命令 | 主要输入和输出 |
| --- | --- |
| `behavior-lint [root] [--json] [--no-warnings]` | 扫描 Registry 并输出结构化问题 |
| `behavior-diff <refA> <refB> [--root <path>] [--format markdown\|json]` | 输出新增、修改、废弃和非法删除 |
| `behavior-impact (--path <src-file> \| --id <behavior-id>) [--root <path>]` | 输出实现路径与 Behavior 的双向关系 |
| `behavior-list [root] [--status <s>] [--owner <o>] [--format table\|json]` | 按 ID 输出状态、Owner、路径和标题 |
| `behavior-locate <behavior-id> [root]` | 输出唯一匹配文件的绝对路径 |

`behavior-diff` 按 ID 区分新增、修改、废弃和非法删除。frontmatter 只比较产品指定的关键字段；Gherkin 使用 AST 中的 keyword 和 text 比较。Markdown 空白和普通 prose 调整不进入行为差异。

`behavior-impact --path` 先检查源文件同目录和父目录，再扫描 Registry 中尚未处理的文件并去重。局部命中不能提前返回。`behavior-locate`、`behavior-impact --id` 和 `behavior-diff` 遇到重复 ID 时返回问题，不任意选择一条。

所有命令支持 `--json`。已有 `--format json` 的命令将它视为同一输出模式，不建立两套 JSON 结构。

### 10.8 第四阶段：更新 Skill

工具契约稳定后再更新 Skill：

- `SKILL.md` 改为提取、编写、lint、证据、晋级、变更和 Release Notes 流程；
- `templates/behavior.md` 替代 `templates/behavior.yaml`；
- `references/behavior-schema.md` 改为人读说明和 Schema 链接；
- `references/project-adoption.md` 改为就近存放 `*.behavior.md`；
- 新增 `references/tooling.md`；
- `brief.md` 和 `full-argument.md` 若只承担旧导航，则删除，由 Git 历史追溯。

`references/background-and-design.md` 保留在当前源码仓库，因为它是本产品的设计和实施计划。运行时 `SKILL.md` 不要求为日常任务读取本文。消费项目只 checked-in 操作所需的 Skill 文件，不复制本产品背景。

### 10.9 第五阶段：最小测试和本仓验收

测试只证明当前产品契约：

- 合法条目；
- 缺字段；
- 多个 Gherkin block；
- 多个 Scenario；
- 重复 ID；
- `active` 门禁；
- 模糊文件名；
- diff 的一条 step 修改和非法删除。

测试使用临时目录，不扫描真实业务仓库。现有测试能证明行为时不增加参数化矩阵、快照或端到端套件。

CLI smoke test 分别验证退出码 `0`、`1` 和 `2`。这是命令契约的一部分，不扩展为端到端测试套件。

本仓完成条件：

- 根 `workspaces` 包含 `behavior-as-source`；
- `npm test --workspace @flome/behavior-as-source` 通过；
- 五个 bin 可从 workspace 执行；
- fixture lint 为 0 error；
- JSON Schema 是唯一机器契约；
- Skill、模板和 CLI 文档都描述 Markdown + Gherkin；
- 最终 diff 不包含其他 Skill、业务仓库或无关配置的修改。

### 10.10 消费仓库 rollout

本仓验收后，才能为一个消费仓库创建独立迁移任务。以 Pangle 的 19 条 YAML 为例，rollout 需要：

1. 读取消费仓库的 package、测试、CI、Skill 安装和目录约定；
2. 确定如何依赖 `@flome/behavior-as-source`，不复制 CLI 源码；
3. 建立旧文件、ID、新文件、实现路径和证据路径清单；
4. 先迁移一条有真实证据的样本，再机械迁移其余条目；
5. 比较迁移前后 ID 集合，确认没有新增或静默删除；
6. 更新消费项目自己的 adoption、evidence、migration index 和 CI；
7. 运行消费项目现有测试和全量 Behavior lint。

rollout 不修改生产代码或现有测试断言。具体 package manager、命令和 CI job 由消费仓库决定。当前文档不再预设 `pnpm`、EMO、Rstest 或目录名称。

### 10.11 预算与停止条件

预计工作量分为两部分：当前 package 和 Skill 约 2.5 至 3 个工程日；首个消费仓库的 19 条迁移和 CI 约 1.5 至 2 个工程日。总量仍约 4.5 个工程日，但两个任务必须分别验收。

出现以下情况时停止并确认：

- 当前 npm workspace 无法满足依赖或 bin 执行；
- Schema 与 Skill 对同一字段给出不同要求；
- CLI 需要修改消费仓库生产代码才能工作；
- rollout 无法证明 19 个 ID 一一对应。

## 11. 参考资料

以下资料继承自原文，供后续核验和阅读。本次仅合并本地文档，未逐项核验链接、标题、研究数据或当前产品能力。它们不构成完整方案已经成立的证据。


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
