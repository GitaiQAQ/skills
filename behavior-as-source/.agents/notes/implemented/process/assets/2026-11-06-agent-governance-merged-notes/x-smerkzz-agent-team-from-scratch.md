# Grok Bot Engineering: Build Your First Agent Team From Scratch

- 作者: smerkzz (@0xsmerkzz)
- 发布: 约 2026-10-30（X 长文/article，备份时「18小时前」）
- 原文: https://x.com/0xsmerkzz/status/2118073227826147530 （专注模式: https://x.com/0xsmerkzz/article/2118073227826147530）
- 备份方式: 2026-11-06 通过 ego-browser 提取 article 页面 DOM innerText；排版为近似还原，内容完整（含文中引用的推文）
- 备份时数据: 11万 阅读 / 8 回复 / 8 转帖 / 63 喜欢

---

Most people use Grok Bot like a chatbot. They type a question, read the answer and close the app. That is maybe ten percent of what it can do. The people getting serious results are not running one clever bot. They are running a small org chart: one bot that coordinates, a few specialists that each own a single job, and a set of rules that decides what runs on its own and what waits for their yes.

This is the whole build, in the order you should do it: what you are working with, the first bot, the specialists, how they pass work to each other, how a good task becomes a skill and then a routine, and how the team gets better every day. Read it once, then follow it with the app open.

## What you are working with

The official launch post sums it up in one line: "Grok Bot is your team of always-on agents. They have their own computer, work inside tools and apps like you do, and keep working 24/7."

That computer is the part that matters. Every bot works on a persistent cloud machine with a browser, a filesystem and a terminal. It signs into your apps and finishes the job in the real tool instead of handing you a draft in a chat. Close your laptop and the work keeps going. There is no workflow builder either: you set a bot up by messaging it, and standing one up takes ten or fifteen minutes.

A bot is also not a chat window that forgets you. It is a teammate with a name, a job and context that keeps building: its memory, files, sessions and your preferences carry over from one task to the next.

There are three ways to put a bot to work. You message it like a colleague. You give it a routine, so it runs on a schedule or wakes up when something happens in another app. Or another bot messages it and hands it a piece of work. The whole playbook below is about moving from the first way to the third.

One detail most people miss: all your bots share that one computer. Same files, same sessions, same logins, with a separate screen for each bot so they can work in parallel. That is why handoffs between bots just work, and it is also why you will need rules.

[文中嵌入推文: matt palmer (@mattyp), 2026-08-26 —— 官方 DevRel 团队 30 分钟 Grok Bot 入门视频，章节: 01:00 什么是 @Bot / 05:26 机器人剖析 / 08:49 3 种运行方式 / 12:04 多机器人链 / 16:06 工作流 1：X 粉丝到 @Notion / 20:29 工作流 2：个人软件 / 23:08 工作流 3：使用 @cursor_ai 进行编码 / 26:44 工作流 4：搜索 / 28:27 回顾。数据: 139万观看]

## Why one bot is the wrong shape

The first instinct is to build one super-agent that does everything. It gets harder to manage, harder to evaluate and less reliable, because one agent carrying your outreach, content, research and code drowns in its own context, and you can never say whether it did a good job when its job was everything.

The docs put it plainly: a bot called "General Helper" gives the model nothing to work with. An engineer on the Grok Bot team runs five engineer bots, each owning one area of the product, and found they perform best when they stay inside a single domain. Before Grok Bot he could manage about 15 cloud agents by hand. Now his bots manage more than 200 at once.

A narrow job gives the bot clean context and gives you a way to judge it. Every bot should have a target, a safety limit, a quality bar and a simple check that tells you whether its work actually helped. And measure outcomes, not activity: a bot that produces more posts is not a bot that brings in more leads.

The opposite extreme fails too. Fourteen bots that all report to you is just fourteen chats to babysit. The answer is not fewer bots or more bots, it is structure.

## The team you are building

The structure that scales looks like a company: you at the top, a few leads under you, and workers under them. One creator runs fourteen bots this way and talks to only four of them. You start much smaller, with five roles, four of them on day one.

The Chief of Staff is your primary bot and the only one you talk to. It takes your goal, splits it into tasks, hands each one to the right bot and sends you one update at the end of the day. The Researcher scans your sources every morning and returns findings with a link for every claim. The Writer turns that research into drafts in your voice, and only drafts. The Reviewer checks every draft against the sources and lists only the issues that block it. Ops comes later, with a daily check-in that catches mistakes and updates the rules.

The split works because the bot that writes is never the bot that checks, and every stage has exactly one owner. When something goes wrong, you know whose job it was. Give the team one shared board as well, a simple Notion table where every task is a row with an owner and a status. The bots update it, and you scan one page instead of scrolling through five chats.

[文中嵌入推文: Akshay 🚀 (@akshay_pachaar) —— 38 分钟大师课: 从 1 个到 14 个像公司一样运行的机器人，只需与其中 4 个对话。覆盖计算机使用、连接器、通过屏幕录制教授的技能、例程。另引用其 2026-08-27 文章《Build an Engineering Team With Grok Bot》: "Four specialist Agents, one shared task board, and handoffs where the next Bot never starts cold. Multi-agent coding setups usually degrade in performance at the handoff."]

## Step 1: create your Chief of Staff

Grok Bot has a primary Bot, your main point of contact. It checks in with you on its own and coordinates the work of your other bots. Hit the plus button or Cmd/Ctrl+N, name it, pick a shape and a color, and create it. If you already have bots, you can promote one of them instead.

The first message is where most setups succeed or fail. It needs four things: the job, the sources, the approval limits and an instruction to remember all of it. Then give it a real first task with a clear finish line, not a test question.

```
You're my Chief of Staff.
Your job: take my goals, split them into tasks, hand each one to the right bot,
and send me one update at the end of the day.
Your sources: my Gmail, Notion and Slack.
Your limits: never send, publish, buy or delete anything without my OK.
Remember all of this.
First task: [a real task]. Done when: [the finish line].
```

From here on, this is the only bot you talk to for most of the day. It delegates, chases updates and comes back with one decision instead of a stream of notifications.

Every task you hand it should read like a small contract: the objective, the scope, what not to touch, the expected output and the moment it counts as done. Vague tasks are where bots start duplicating each other's work.

The limits line matters more than it looks, because memory alone is not a safety net. Back it up with approvals and Auto-review, a separate reviewer that checks risky actions against rules you write in plain language and can allow them, block them or bring them to you.

[文中嵌入推文: Prajwal Tomar (@PrajwalTomar_), 2026-08-23 —— "你把你的机器人放到一个群聊里，任命一个管理者，然后停止在自己的工具之间充当路由器。它会分配任务、追踪更新，然后只带回一个问题，而不是十个通知。" 另引用其文章《I Replaced My Whole Team With 8 Grok Bots and It's Kind of Insane》]

## Step 2: connect your tools once

Open Connect apps and add what you actually use: Gmail, Slack, Notion, Linear and the rest. Grok Bot supports the same MCP servers, plugins and skills as Cursor, and a bot can install an app for you if you just ask.

Apps are account-wide, so one connection is available to every bot you will ever create. Connect only the accounts the team actually needs. The tokens stay on the connector side: a bot calls the tools without ever holding your login.

For a service with no app, the bot uses the website on its own computer. Logins go through Vault, a connected password manager or a Secure Form, and the values are filled in without the bot seeing them. Vault now keeps your logins, cards and contact details, so you add them once and every bot can use them. When a site needs a human, like a passkey, a CAPTCHA or a bank card check, the bot hands you the computer. You do only that step and tell it to continue. Never paste a password into the chat.

Your bots can also get their own email address. They use it to sign up for services, contact businesses and schedule time with people, and anything a routine wants to send from it waits as a draft until you press Send.

[文中嵌入推文: @bot 官方, 2026-10-24 —— "Grok Bot 现在可以保存您的登录信息、卡片和联系方式。只需添加一次，Bot 会安全地记住它们以备将来使用。"]
[文中嵌入推文: @bot 官方, 2026-10-10 —— "Grok Bot 现在拥有自己的电子邮件。Bot 可以用它来注册服务，代表你联系商家，或与某人安排时间。"]

## Step 3: add specialists, one job each

The official rule is the best filter you will get: create a new bot only when the work has its own goal, its own tools, its own working style, its own approval boundary or its own schedule. If it shares all of those with an existing bot, it is a task, not a role.

Describe each role like a job description: what it owns, where it pulls from, what it delivers and what it never touches. That last part does the most work. Deciding what a bot will not do matters more than deciding what it will, and a good "never" list names the other bots, so nobody steps on anyone's job.

```
You're the Researcher.
You own: the morning scan of [sources].
You deliver: 5 findings by 9:00, each with a link to the source.
You never: write drafts, contact anyone or post anything.
If a source is down, say so instead of guessing.
Remember all of this.
```

Start with the smallest useful roster and add a bot only when a role is stable or turns into a bottleneck. Your Chief of Staff can suggest new bots or create them for you, so ask it before it builds several at once. When a bot works well, you can share it as a template and let a teammate run their own copy.

## Step 4: let them hand work to each other

One assistant becomes a team the moment bots stop waiting for you to pass work between them. A bot can message another bot directly: the other one wakes up, does the work and replies later, and you can see the handoff in the conversation. A specialist that needs a judgment call can ask the Chief of Staff instead of you.

When a handoff should be visible, use a group chat for two to six bots and mention one bot to give it the task. The official kickoff gives every stage one owner in a single message: the Researcher gathers the sources and links every claim, the Writer turns the findings into a launch draft, the Reviewer lists only blocking issues, and nobody publishes anything. Two bots working the same stage in parallel only means duplicate work and noisy updates.

Make every handoff carry proof. A bot saying "done" is a claim. Done means sources, screenshots, test results or a short action log you can check without redoing the work. And when something fails, a retry has to change something: running the same prompt three times just pays for the same mistake three times.

One thing catches people in their first group chat: approval requests, login requests and email or Slack drafts never appear in the group, so check each bot's own chat. And if something has to stop right now, send "stop now". It ends the work, but it does not undo what is already done.

## Step 5: turn what works into skills

A skill is a reusable set of instructions: the steps, the decision rules, the expected output and what needs approval. Do the task with the bot until the result is good, then ask it to save the process as a skill with a name. Skills are shared across all your bots.

You can also use Teach a task: do the job once while it records the screen, for up to ten minutes, and the bot turns it into a skill. Treat that skill as a draft. It saw one example, so add the decision rules, the failure handling and the approval points yourself, and test it on something safe before you schedule it.

A simple test for what deserves a skill: if you do something more than once a day and it follows the same pattern every time, it is a skill. A morning sweep of your inbox across Gmail, Slack and X, a weekly competitor check, the way you format a report. Teach it once and stop explaining it.

## Step 6: put it on routines

A routine tells one bot when to run a workflow: on a schedule, or when something happens, such as a Slack message, a GitHub or Linear event, an email or a webhook.

The official order is the most important sentence in the docs: start with a one-time task, make it reliable, save it as a skill, and only then automate it. A good routine prompt says which skill to run, when and in which time zone, from which input, what the result looks like, where the approval line is and what to do if a source is missing

```
Every weekday at 8:00 AM, run the "morning scan" skill on [sources].
Post 5 findings with links in this chat. Don't contact anyone.
If a source is down, report it instead of using old data.
```

Once the daily work runs, the night can work too. The Grok Bot engineering team runs nightly audits at 3 a.m.: bots clean up the codebase, look for security issues and slow builds, and leave a fresh set of fixes ready for review in the morning. Their shared task board gets a check every 30 minutes for failing builds, security findings and conflicts.

Always press Test before you trust it, because a test run does real work. Then watch the clock: every run spends usage, and an hourly schedule or a trigger on a busy Slack channel can burn a week of usage in a day. Automate the preparation first and keep the execution behind your approval.

## Step 7: memory and the daily check-in

Every bot keeps its own memory: your preferences, the rules you gave it and a dated log of its work. It decides on its own what is worth saving, so when something matters, tell it to remember. Ask it what it remembers about you to check, and tell it to forget anything that is wrong. Just never treat memory as a source of truth: for big decisions, make the bot reopen the real data.

The best habit comes from the Grok Bot engineering team. One engineer gave his bots an ops bot called Jenny, the only bot on the team that writes no code. Every morning at 5 a.m. she meets each bot one to one, reviews the playbook and surfaces blockers. When a bot makes a mistake, Jenny finds the root cause, updates the playbook and tells the other bots, so the same mistake does not happen twice. When the team grows, she onboards the new bot with the team rules. His conclusion: daily meetings work remarkably well for bots.

[文中嵌入推文: Lingxi Li (@lingxi), 2026-09-01, 文章《Grok Bot for Engineering》—— "I'm a SpaceXAI engineer building Grok Bot with Grok Bot. Think of Grok Bot as a highly capable engineering intern, with its own computers, that can manage coding agents and learn from how you work..." 原始出处: 五个工程师 bot、200+ agent 和 Jenny。数据: 105万阅读]

## Give the shared computer some borders

All your bots share one computer, and that is the part people underestimate. Every bot keeps its own role and conversation, but files and signed-in sessions are common property. Five checks keep the team from colliding.

First, list every account that is already signed in, and never assume another bot cannot reach the same session. Second, keep secrets and customer data off the computer unless every bot with access is allowed to see them. Third, give each role its own folder plus one clearly named shared folder, and remember that this is organization, not a security boundary. Fourth, pass context on purpose, through a direct message, the group chat or a named handoff file, never through leftover tabs. Fifth, before you hide or delete a bot, pause its routines, revoke what it no longer needs, remove its files and check the open sessions. Deleting a bot erases its memory and routines, but whatever it left on the computer stays.

## The mistakes that break most teams

The most common one is a single bot that owns everything and therefore owns nothing well. The second is the opposite: twenty bots on day one. Start with four, add a role only when it turns into a bottleneck, and retire bots that no longer earn their place.

Then come the quieter ones. Talking to every bot yourself turns you back into the router. Automating before the task works once just schedules a mistake. And forgetting the delivery step means a Chief of Staff can run a whole team for your evening report and never send you the result, so always say what gets delivered, where, and that failures get reported instead of silence. If a routine seems to skip a run, open its run history before you rewrite anything.

Giving full freedom on day one is how people get burned. Drafts and analysis can run alone, but sending, publishing, buying and deleting wait for approval until a bot has earned more. Autonomy is earned with results, clear rules and repeated testing. And keep group chats small and triggers narrow, because every bot reply, including bot-to-bot messages, counts toward your usage.

## Your first week

Do not build all of this on Monday. On day one, create the Chief of Staff, send the first message and give it one real task. On day two, connect your tools and correct whatever it got wrong. On day three, add the Researcher with one source list and one deliverable. On day four, add the Writer and the Reviewer, put all four in a group chat and run the kickoff once by hand. On day five, save the result as a skill. On day six, turn the morning scan into a routine and press Test. On day seven, ask every bot what it remembers about you and fix what is wrong.

If you would rather build along with a video, the free workshop below walks through the same path, from the first bot to a team that runs on its own.

## What you end up with

At the end of the week you talk to one bot. Three others work for it, each with one job and one clear stage. The work runs on its own computer while your laptop is closed, routines handle what repeats, memory carries your corrections forward, and nothing irreversible happens without your yes.

The model is the same for everyone. The team you build around it is what makes yours win.

If this helped, save it and send it to the one friend who still uses Grok Bot like a search box.
