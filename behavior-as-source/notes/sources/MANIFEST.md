# SOURCES 溯源清单

`notes/sources/` 下所有一手材料的来源、抓取方式与保真度说明。合并笔记见上级目录 `agent-governance-merged-notes.md`。
抓取日期统一为 **2026-11-06**。给下游 agent 消费前请先读本文件。

## 备份文件一览

| 文件 | 类型 | 完整性 |
|---|---|---|
| `bend-repo-excerpt/GUIDE.md` | Bend 官方语言文档（整份就这一份） | 原文，完整（28.5KB） |
| `bend-repo-excerpt/AGENTS.md` | Bend 仓库自己的 agent 治理规则 | 原文，完整 |
| `bend-repo-excerpt/README.md` | 仓库 README | 原文，完整 |
| `bend-repo-excerpt/EFFECTS.md` / `SHADERS.md` | GUIDE 的姊妹篇（effects、GPU shader） | 原文，完整 |
| `bend-repo-excerpt/gates/repo.ts` | 仓库 CI 门禁（含 per-file token 上限） | 原文，完整 |
| `bend-repo-excerpt/evals/*.bend` | AI 解题评测样例（hard + cake 各一） | 原文，完整 |
| `bend-repo-excerpt/demo-laws-proofs/` | pong 游戏的 LAWS.bend + PROOF.bend（官网演示同款） | 原文，完整 |
| `bend-lang-website.txt` | 官网首页定位文本（含 AGENTS.md 四行模板、wrap-around 演示文案） | 提取文本，正文完整 |
| `claude-code-advisor.md` | Claude Code Advisor 官方文档 | 原生 markdown，完整 |
| `claude-code-agent-teams.md` | Claude Code Agent Teams 官方文档 | 原生 markdown，完整 |
| `x-beamnxw-one-person-company-harness.md` | Grok Bot 单人公司 harness 长文 | DOM innerText 近似还原，内容完整 |
| `x-smerkzz-agent-team-from-scratch.md` | Grok Bot agent 团队长文 | DOM innerText 近似还原，内容完整（含嵌入推文摘要） |
| `x-m4lkxx-6-bots-smaller-bill.md` | Grok Bot 六座位 + 成本经济学长文 | DOM innerText 近似还原，内容完整（原文一处重复已标注） |
| `x-mirku21-agent-teams-tweet.md` | Agent Teams hype 推文（含核查结论） | innerText 近似还原（X 自动翻译版），内容完整 |

## 抓取方式与保真度

- **Bend 仓库**: `git clone --depth 1 https://github.com/HigherOrderCO/Bend`，commit `222de9901d4e3551c2b347da02e02a10098a28b2`（2026-11-05 提交）。GUIDE.md 位于 `guide/` 而非仓库根目录。
- **Claude Code 文档**: Mintlify 站点支持 `.md` 后缀直接返回原生 markdown，逐字可靠。
- **X 长文/推文**: ego-browser 打开 article 专注模式页面后取 `document.body.innerText`。**段落分行是近似还原**（innerText 丢失原始 markdown 的加粗/链接格式），但文字内容完整无删节；每份文件头部保留 URL、作者、发布日期、抓取时互动数据。引用的官方 docs.x.ai 链接在文中保留。
- **Bend 官网**: curl 拉取 HTML 后提取正文文本。

## 未备份（仅二手引用）

以下材料在正文中被引用但未抓取原文，如需深挖按链接自取：

- 《The advisor strategy》博客 — https://claude.com/blog/the-advisor-strategy（Advisor 设计动机原始出处）
- Lingxi Li《Grok Bot for Engineering》— x.com/lingxi（Jenny / 200+ agents / 五工程师 bot 的原始出处）
- mirku《Harness Engineering: How to Build AI Workflows That Never Fall Apart》— x.com/mirku21（2026-09-13）
- Akshay Pachaar 38 分钟大师课视频、mattyp 官方 30 分钟入门视频（视频无法文本备份）
- Grok Bot 官方文档站 — docs.x.ai/grok-bot/*（正文中引用的具体页面：get-started、bots、computer-and-apps、approvals-security-and-privacy、skills-routines-and-automations、settings-and-notifications）

## 已知数据可靠性注意事项

- m4lkxx 文中所有成本数字（$397/月、158.8K→35.7K、$441→$9.40 等）为**论坛用户自报，作者自己也注明 not audited**，方向可信、绝对值仅供参考。
- mirku 推文已在备份文件头部逐条标注核查结论，勿当一手来源引用。
- bend-lang-website.txt 中的性能宣传（"up to a hundred times faster"）为营销口径，实测数字以 GUIDE.md 和仓库 bench 为准。
