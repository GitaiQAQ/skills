#!/usr/bin/env node

import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
} from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  console.log("用法: node verify-agent-notes.mjs [repo]");
  console.log("repo 默认为当前目录，且必须是 Git 仓库根目录。");
  process.exit(0);
}
if (args.length > 1) {
  console.error("Agent Notes 校验失败：只接受一个仓库路径");
  process.exit(1);
}

const repoRoot = resolve(args[0] ?? process.cwd());
const notesRoot = resolve(repoRoot, ".agents/notes");
const readmePath = resolve(notesRoot, "README.md");
const rejectedIndexPath = resolve(notesRoot, "rejected/INDEX.md");

const lifecycles = new Set(["proposed", "implemented", "rejected", "archived"]);
const classes = new Set([
  "architecture",
  "feature",
  "bug-fix",
  "simplification",
  "process",
  "testing",
  "integration",
]);
const requiredSections = {
  proposed: ["Problem", "Proposal", "Alternatives considered", "Acceptance criteria", "Risks"],
  implemented: ["Problem", "Decision", "Alternatives considered", "Consequences"],
  rejected: ["Problem", "Proposal", "Alternatives considered", "Reintroduction conditions"],
  archived: ["Problem", "Decision", "Alternatives considered", "Consequences"],
};

const errors = [];
const fail = (filePath, message) => {
  const displayPath = relative(repoRoot, filePath) || ".";
  errors.push(`${displayPath}: ${message}`);
};
const normalizeEol = (text) => text.replace(/\r\n/g, "\n");
const readText = (filePath) => normalizeEol(readFileSync(filePath, "utf8"));
const toPosix = (filePath) => filePath.split(sep).join("/");

function git(commandArgs) {
  return spawnSync("git", commandArgs, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function assertRepositoryRoot() {
  try {
    if (!statSync(repoRoot).isDirectory()) throw new Error("不是目录");
  } catch (error) {
    console.error(`Agent Notes 校验失败：仓库目录不可用 ${repoRoot}: ${error.message}`);
    process.exit(1);
  }

  const result = git(["rev-parse", "--show-toplevel"]);
  const actualRoot = result.status === 0 ? realpathSync(resolve(result.stdout.trim())) : "";
  if (result.status !== 0 || actualRoot !== realpathSync(repoRoot)) {
    console.error(`Agent Notes 校验失败：repo 必须是 Git 仓库根目录: ${repoRoot}`);
    process.exit(1);
  }
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const child = resolve(directory, entry.name);
    if (entry.isDirectory()) return walk(child);
    return [child];
  });
}

function isRealDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function sectionEntries(text) {
  const entries = [];
  const pattern = /^## ([^\n]+)\n/gm;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    entries.push({ name: match[1].trim(), start: match.index, bodyStart: pattern.lastIndex });
  }
  return entries.map((entry, index) => ({
    ...entry,
    body: text.slice(entry.bodyStart, entries[index + 1]?.start ?? text.length).trim(),
  }));
}

function problemSection(text) {
  const start = text.match(/^## Problem\n/m);
  if (!start || start.index === undefined) return null;
  const afterHeading = start.index + start[0].length;
  const next = text.slice(afterHeading).match(/^## /m);
  const end = next?.index === undefined ? text.length : afterHeading + next.index;
  return text.slice(start.index, end);
}

assertRepositoryRoot();

const hasHead = git(["rev-parse", "--verify", "HEAD"]).status === 0;
const headTreeResult = hasHead
  ? git(["ls-tree", "-r", "--name-only", "HEAD", "--", ".agents/notes"])
  : null;
if (headTreeResult && headTreeResult.status !== 0) {
  fail(notesRoot, `无法读取 HEAD，不能校验 Problem 与 archived 冻结: ${headTreeResult.stderr.trim()}`);
}
const headPaths = headTreeResult?.status === 0
  ? headTreeResult.stdout.split("\n").filter(Boolean)
  : [];
const headNotePaths = headPaths.filter((gitPath) => (
  /^\.agents\/notes\/(proposed|implemented|rejected|archived)\/[^/]+\/[^/]+\.md$/.test(gitPath)
));
const headByBasename = new Map();
for (const gitPath of headNotePaths) {
  const basename = gitPath.slice(gitPath.lastIndexOf("/") + 1);
  const matches = headByBasename.get(basename) ?? [];
  matches.push(gitPath);
  headByBasename.set(basename, matches);
}

function readHead(gitPath) {
  const result = git(["show", `HEAD:${gitPath}`]);
  return result.status === 0 ? normalizeEol(result.stdout) : null;
}

function validateHeader(filePath, lifecycle, text) {
  const lines = text.split("\n");
  if (!/^# Agent Note: \S(?:.*\S)?$/.test(lines[0] ?? "")) {
    fail(filePath, "首行必须严格为“# Agent Note: <title>”");
  }

  if (lifecycle === "rejected") {
    if (!/^Status: rejected — \S(?:.*\S)?$/.test(lines[1] ?? "")) {
      fail(filePath, "rejected 状态必须为“Status: rejected — <一行原因>”");
    }
    if (lines[2] !== "") fail(filePath, "Status 后必须有一个空行");
    if (lines[3] !== "## Problem") fail(filePath, "Header 后正文必须立即以“## Problem”开始");
    return;
  }

  if (lifecycle === "archived") {
    if (lines[1] !== "Status: implemented") {
      fail(filePath, "archived Note 必须保留“Status: implemented”");
    }
    const archived = (lines[2] ?? "").match(/^Archived: (\d{4}-\d{2}-\d{2})$/);
    if (!archived || !isRealDate(archived[1])) {
      fail(filePath, "archived Note 第三行必须为有效的“Archived: YYYY-MM-DD”");
    }
    if (lines[3] !== "") fail(filePath, "Archived 后必须有一个空行");
    if (lines[4] !== "## Problem") fail(filePath, "Header 后正文必须立即以“## Problem”开始");
    return;
  }

  if (lines[1] !== `Status: ${lifecycle}`) {
    fail(filePath, `Status 必须与目录一致并严格为“Status: ${lifecycle}”`);
  }
  if (lines[2] !== "") fail(filePath, "Status 后必须有一个空行");
  if (lines[3] !== "## Problem") fail(filePath, "Header 后正文必须立即以“## Problem”开始");
}

function validateSections(filePath, lifecycle, text) {
  const entries = sectionEntries(text);
  if (entries[0]?.name !== "Problem") {
    fail(filePath, "正文必须以“## Problem”开始");
  }

  const names = entries.map(({ name }) => name);
  for (const section of requiredSections[lifecycle] ?? []) {
    const count = names.filter((name) => name === section).length;
    if (count !== 1) fail(filePath, `必需章节“## ${section}”必须恰好出现一次`);
  }

  const positions = (requiredSections[lifecycle] ?? []).map((section) => names.indexOf(section));
  if (positions.some((position, index) => index > 0 && position < positions[index - 1])) {
    fail(filePath, `必需章节顺序必须为 ${requiredSections[lifecycle].join(" → ")}`);
  }

  for (const entry of entries) {
    if (!entry.body) fail(filePath, `章节“## ${entry.name}”不能为空`);
  }

  const alternatives = entries.find(({ name }) => name === "Alternatives considered")?.body ?? "";
  if (!/(?:^|\n)\*\*\S[\s\S]*?\*\*[^\n]*\S/m.test(alternatives)) {
    fail(filePath, "Alternatives considered 至少需要一个以加粗名称开头的真实备选段落");
  }
  if (/(没有其他方案|无其他方案|no alternatives?|none considered)/i.test(alternatives)) {
    fail(filePath, "“没有其他方案”不是有效的 Alternatives considered 记录");
  }
}

function validateProblemAgainstHead(filePath, text) {
  const basename = filePath.slice(filePath.lastIndexOf(sep) + 1);
  const candidates = headByBasename.get(basename) ?? [];
  if (candidates.length > 1) {
    fail(filePath, `HEAD 中存在多个同名 Note，无法确定原始 Problem: ${candidates.join(", ")}`);
    return;
  }
  if (candidates.length === 0) return;

  const headText = readHead(candidates[0]);
  if (headText === null) {
    fail(filePath, `无法读取 HEAD 中的原 Note: ${candidates[0]}`);
    return;
  }
  if (problemSection(text) !== problemSection(headText)) {
    fail(filePath, `Problem 相对 HEAD 被改写（原路径 ${candidates[0]}）`);
  }
}

function validateArchivedFreeze(filePath, text) {
  const repoPath = toPosix(relative(repoRoot, filePath));
  const basename = filePath.slice(filePath.lastIndexOf(sep) + 1);
  const samePath = headPaths.includes(repoPath) ? readHead(repoPath) : null;
  if (samePath !== null) {
    if (text !== samePath) fail(filePath, "archived Note 已封存，内容不得相对 HEAD 修改");
    return;
  }

  const sourceCandidates = (headByBasename.get(basename) ?? []).filter((candidate) => (
    candidate.startsWith(".agents/notes/implemented/")
  ));
  if (sourceCandidates.length !== 1) {
    fail(filePath, "新 archived Note 必须由 HEAD 中唯一的 implemented Note 迁移而来");
    return;
  }
  const source = readHead(sourceCandidates[0]);
  const archivedLine = text.match(/^Archived: \d{4}-\d{2}-\d{2}$/m)?.[0];
  const expected = source?.replace(
    /^Status: implemented$/m,
    `Status: implemented\n${archivedLine ?? "Archived: INVALID"}`,
  );
  if (expected !== text) {
    fail(filePath, `归档迁移除新增 Archived 行外不得改写原文（原路径 ${sourceCandidates[0]}）`);
  }
}

function markdownLinks(text) {
  const links = [];
  const inline = /!?\[[^\]]*]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
  let match;
  while ((match = inline.exec(text)) !== null) links.push(match[1]);
  const references = /^\s*\[[^\]]+]:\s*(\S+)/gm;
  while ((match = references.exec(text)) !== null) links.push(match[1]);
  return links;
}

function validateRelativeLinks(filePath, text) {
  for (const rawLink of markdownLinks(text)) {
    const link = rawLink.replace(/^<|>$/g, "");
    if (/^(?:[a-z][a-z0-9+.-]*:|#)/i.test(link)) continue;
    if (link.startsWith("/")) {
      fail(filePath, `本地链接必须使用相对路径: ${rawLink}`);
      continue;
    }
    let decoded;
    try {
      decoded = decodeURIComponent(link.split(/[?#]/, 1)[0]);
    } catch {
      fail(filePath, `链接包含无效的 URL 编码: ${rawLink}`);
      continue;
    }
    const target = resolve(dirname(filePath), decoded);
    if (target !== repoRoot && !target.startsWith(`${repoRoot}${sep}`)) {
      fail(filePath, `相对链接越出仓库: ${rawLink}`);
    } else if (!existsSync(target)) {
      fail(filePath, `相对链接目标不存在: ${rawLink}`);
    }
  }
}

if (!existsSync(notesRoot) || !lstatSync(notesRoot).isDirectory()) {
  console.error("Agent Notes 校验失败：.agents/notes 不存在");
  process.exit(1);
}

const markdownFiles = walk(notesRoot).filter((filePath) => filePath.endsWith(".md"));
const excluded = new Set([readmePath, resolve(notesRoot, "AGENTS.md"), rejectedIndexPath]);
const noteFiles = markdownFiles.filter((filePath) => !excluded.has(filePath));
const notes = [];
const seenBasenames = new Map();

for (const filePath of noteFiles) {
  const repoRelative = toPosix(relative(notesRoot, filePath));
  const parts = repoRelative.split("/");
  if (parts.length !== 3) {
    fail(filePath, "Note 路径必须严格为 {lifecycle}/{class}/yyyy-mm-dd-topic.md");
    continue;
  }
  const [lifecycle, noteClass, filename] = parts;
  if (!lifecycles.has(lifecycle)) fail(filePath, `未知 lifecycle: ${lifecycle}`);
  if (!classes.has(noteClass)) fail(filePath, `未知 class: ${noteClass}`);
  if (!lifecycles.has(lifecycle) || !classes.has(noteClass)) continue;

  const filenameMatch = filename.match(/^(\d{4}-\d{2}-\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/);
  if (!filenameMatch || !isRealDate(filenameMatch[1])) {
    fail(filePath, "文件名必须为有效日期开头的 yyyy-mm-dd-topic.md，topic 仅使用小写字母、数字和连字符");
  }

  const duplicate = seenBasenames.get(filename);
  if (duplicate) fail(filePath, `文件名与另一 Note 重复: ${relative(repoRoot, duplicate)}`);
  else seenBasenames.set(filename, filePath);

  const text = readText(filePath);
  validateHeader(filePath, lifecycle, text);
  validateSections(filePath, lifecycle, text);
  validateProblemAgainstHead(filePath, text);
  if (lifecycle === "archived") validateArchivedFreeze(filePath, text);
  validateRelativeLinks(filePath, text);
  notes.push({ filePath, lifecycle, repoRelative });
}

function validateIndex(indexPath, indexedNotes, label) {
  if (!existsSync(indexPath)) {
    fail(indexPath, `${label}不存在`);
    return;
  }
  const text = readText(indexPath);
  validateRelativeLinks(indexPath, text);
  const linkedMarkdown = new Set();
  for (const rawLink of markdownLinks(text)) {
    const link = rawLink.split(/[?#]/, 1)[0];
    if (!link.endsWith(".md")) continue;
    try {
      linkedMarkdown.add(toPosix(relative(
        notesRoot,
        resolve(dirname(indexPath), decodeURIComponent(link)),
      )));
    } catch {
      // validateRelativeLinks 已报告无效的 URL 编码。
    }
  }
  const expected = new Set(indexedNotes.map(({ repoRelative }) => repoRelative));
  for (const note of expected) {
    if (!linkedMarkdown.has(note)) fail(indexPath, `${label}缺少 Note: ${note}`);
  }
  for (const link of linkedMarkdown) {
    const isIndexedLifecycle = label === "Rejected 索引"
      ? link.startsWith("rejected/")
      : /^(?:proposed|implemented)\//.test(link);
    if (isIndexedLifecycle && !expected.has(link)) {
      fail(indexPath, `${label}包含非目标或已失效的 Note: ${link}`);
    }
  }
}

validateIndex(
  readmePath,
  notes.filter(({ lifecycle }) => lifecycle === "proposed" || lifecycle === "implemented"),
  "README 索引",
);
const rejectedNotes = notes.filter(({ lifecycle }) => lifecycle === "rejected");
if (rejectedNotes.length > 0 || existsSync(rejectedIndexPath)) {
  validateIndex(rejectedIndexPath, rejectedNotes, "Rejected 索引");
}

if (errors.length > 0) {
  console.error(`Agent Notes 校验失败（${errors.length} 项）：`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Agent Notes 校验通过：${noteFiles.length} 篇 Note。`);
