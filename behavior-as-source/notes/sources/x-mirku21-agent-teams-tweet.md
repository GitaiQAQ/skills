# mirku 推文: Claude Code Agent Teams 分层配置（hype 核查样本）

- 作者: mirku (@mirku21)
- 发布: 2026-10-30 上午5:00
- 原文: https://x.com/mirku21/status/2115911644501147972
- 备份方式: 2026-11-06 通过 ego-browser 提取推文 DOM innerText（X 自动翻译为中文 + 标题中的英文原文）；内容完整
- 备份时数据: 3.3万 阅读 / 24 回复 / 37 转帖 / 260 喜欢 / 463 书签
- ⚠️ 核查结论（对照 code.claude.com/docs/en/agent-teams 官方文档，备份于同目录 claude-code-agent-teams.md）:
  - ✅ Agent Teams 功能、点对点消息、共享任务列表、按 teammate 配模型、devil's advocate 角色（用户构造）属实
  - ❌ 「代币大幅减少」与官方口径矛盾（官方: significantly more tokens than a single session）
  - ❌ 「340 tok/s」「JEV 毫秒级路由」在官方文档中无任何出处；JEV 为社区概念，与 Claude Code 无集成
  - ⚠️ 「Anthropic just revealed」实为默认关闭的实验性功能文档页
  - 此推文适合作为「二手信息需核查」的教学样本保留

---

## 推文英文原文（取自页面标题）

THIS IS AN ABSOLUTE F*CKING GOLD Anthropic just revealed one of the sharpest setups for Claude Code The idea: run autonomous agent teams across Opus 5.5, Sonnet 5.5, and Haiku 5.5, while keeping Fable 5.1 on call as adversary Zero coordinator bottlenecks and way fewer tokens

## 推文全文（X 自动中文翻译）

这就是绝对他妈的金矿

Anthropic 刚刚公布了 Claude Code 最犀利的配置之一

核心思路：跨 Opus 5.5、Sonnet 5.5 和 Haiku 5.5 运行自主代理团队，同时让 Fable 5.1 随时待命作为对手

零协调瓶颈，代币消耗大幅减少：团队成员通过点对点邮箱直接沟通，自己认领任务

你只需这样启动 Claude Code：

CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 claude --model opus

它会这样拆分：

→ Opus 5.5 担任团队领导：将史诗级任务拆分成共享任务列表，仲裁冲突，并批准拉取请求
→ Sonnet 5.5 驱动构建者团队成员：并行敲定前端和后端模块，通过点对点消息传递，避免协调拖沓
→ Haiku 5.5 集群轻量级侦察兵：映射 AST 调用点，审计依赖项，以 340 tok/s 的速度验证 API 规范
→ Fable 5.1 监控点对点总线待命：审计跨会话消息，并在代码合并前捕捉微妙边缘情况
→ 你不再在常规实现循环上烧掉 Opus 上下文，保持领导会话精简

Fable 5.1 只在三个时刻介入：

→ 在合约锁定前：前端负载是否匹配后端模式？
→ 当测试两次失败时：我们是在修复根本原因，还是只在打补丁？
→ 在宣布完成前：大家忽略了哪个安全漏洞或不变量？

Opus 领导 · Sonnet 构建 · Haiku 侦察 · Fable 挑战

JEV 工程就是再下一层的相同招数：无需思考的分支（哪个文件、哪个工具、重试还是停止）以毫秒级速度交给 JEV，大模型只看到那些会分歧的

完整树状结构
> Opus 5.5 协调团队并在 ~/.claude/tasks/ 管理共享任务列表
> Sonnet 5.5 在 ~/.claude/teams/ 运行构建者团队成员，使用直接点对点邮箱
> Haiku 5.5 以 340 tok/s 的速度运行快速侦察团队成员，无协调延迟
> Fable 5.1 作为对手待命，挑战合约并审计差异
> 任务依赖项在团队成员标记工作完成时自动解锁
> JEV 以毫秒级速度路由微型分支

将树状结构和这个提示粘贴到 Claude Code ↓

"围绕这个树状结构重建我的 Claude Code 配置：
1. 通过在 settings.json 中设置 CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 启用自主代理团队
2. 在 Opus 5.5 上运行主领导会话，管理架构和共享任务列表
3. 为功能构建生成 Sonnet 5.5 团队成员，为 340 tok/s 的仓库扫描生成 Haiku 5.5
4. 让 Fable 5.1 作为对手待命，审计点对点消息和测试失败
5. 在 CLAUDE.md 中添加一条规则：团队成员必须在锁定 API 合约前、两次测试失败后以及最终 PR 批准前咨询 Fable
6. 通过 JEV 路由快速确定性分支，先将所有更改显示为差异。未经我许可不得编辑"

↳ code.claude.com/docs/en/agent-teams

保存它，你每天都会用到

[附引用推文: mirku @mirku21, 2026-09-13, 文章《Harness Engineering: How to Build AI Workflows That Never Fall Apart》—— "Most people respond to a broken AI output by rewriting the prompt. Then they switch models. Then they upgrade to a larger context window. The model still forgets instructions. It still recommends the..."]
