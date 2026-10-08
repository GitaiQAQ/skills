#!/usr/bin/env node

import { constants } from "node:fs";
import { access, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = path.resolve(SCRIPT_DIR, "..");
const TEMPLATE_DIR = path.join(SKILL_DIR, "templates");

export const STATIC_TEMPLATE_FILES = Object.freeze([
  ".agents/notes/README.md",
]);

const ADOPTION_NOTE_TEMPLATE =
  ".agents/notes/implemented/process/yyyy-mm-dd-project-rsi-adoption.md";
const ADOPTION_NOTE_PATTERN =
  /^\d{4}-\d{2}-\d{2}-(?:autonomous-maintainer|ai-native-rsi|project-rsi)-adoption\.md$/;

export function formatLocalDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function templateFilesFor(date = new Date()) {
  return [
    ...STATIC_TEMPLATE_FILES,
    `.agents/notes/implemented/process/${formatLocalDate(date)}-project-rsi-adoption.md`,
  ];
}

async function findAdoptionNote(target) {
  const notesRoot = path.join(target, ".agents", "notes");
  async function walk(directory) {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      if (error?.code === "ENOENT") return null;
      throw error;
    }
    for (const entry of entries) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        const found = await walk(absolute);
        if (found) return found;
      } else if (
        entry.isFile()
        && ADOPTION_NOTE_PATTERN.test(entry.name)
      ) {
        return path.relative(target, absolute).split(path.sep).join("/");
      }
    }
    return null;
  }
  return walk(notesRoot);
}

async function assertGitRepositoryRoot(target) {
  let targetStat;
  try {
    targetStat = await stat(target);
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new Error(`目标目录不存在：${target}`);
    }
    throw error;
  }

  if (!targetStat.isDirectory()) {
    throw new Error(`目标不是目录：${target}`);
  }

  try {
    await access(path.join(target, ".git"));
  } catch {
    throw new Error(`目标不是 Git 仓库根目录：${target}`);
  }
}

async function assertCompatibleNotesConvention(target, date) {
  const destination = path.join(target, ".agents", "notes", "README.md");
  let current;
  try {
    current = await readFile(destination, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return;
    throw error;
  }

  const template = await readFile(
    path.join(TEMPLATE_DIR, ".agents", "notes", "README.md"),
    "utf8",
  );
  const expected = template.replaceAll("YYYY-MM-DD", formatLocalDate(date));
  const normalizeAdoptionDate = (content) => content
    .replace(
      /\d{4}-\d{2}-\d{2}-(?:autonomous-maintainer|ai-native-rsi|project-rsi)-adoption\.md/g,
      "YYYY-MM-DD-project-rsi-adoption.md",
    );
  if (normalizeAdoptionDate(current) !== normalizeAdoptionDate(expected)) {
    throw new Error(
      "目标已有自定义 Agent Notes 规范；机械 bootstrap 已停止，请先按该规范适配采用 Note 并确认全局 verifier 兼容",
    );
  }
}

export async function bootstrap(targetDirectory = process.cwd(), options = {}) {
  const target = path.resolve(targetDirectory);
  const result = { target, created: [], skipped: [] };
  const date = options.date ?? new Date();
  const files = [
    ...STATIC_TEMPLATE_FILES.map((relativePath) => ({
      source: relativePath,
      destination: relativePath,
    })),
    {
      source: ADOPTION_NOTE_TEMPLATE,
      destination: `.agents/notes/implemented/process/${formatLocalDate(date)}-project-rsi-adoption.md`,
      adoption: true,
    },
  ];

  await assertGitRepositoryRoot(target);
  await assertCompatibleNotesConvention(target, date);

  for (const file of files) {
    if (file.adoption) {
      const existing = await findAdoptionNote(target);
      if (existing) {
        result.skipped.push(existing);
        continue;
      }
    }
    const source = path.join(TEMPLATE_DIR, file.source);
    const destination = path.join(target, file.destination);
    const content = await readFile(source, "utf8");
    const rendered = content.replaceAll("YYYY-MM-DD", formatLocalDate(date));

    await mkdir(path.dirname(destination), { recursive: true });
    try {
      await writeFile(destination, rendered, {
        flag: "wx",
        mode: constants.S_IRUSR | constants.S_IWUSR | constants.S_IRGRP | constants.S_IROTH,
      });
      result.created.push(file.destination);
    } catch (error) {
      if (error?.code === "EEXIST") {
        result.skipped.push(file.destination);
        continue;
      }
      throw error;
    }
  }

  return result;
}

function printHelp() {
  console.log("用法: node scripts/bootstrap.mjs [目标仓库]");
  console.log("目标必须是已存在的 Git 仓库根目录；仅创建缺失的 Notes README 与当日采用 Note，不复制项目脚本，不覆盖已有文件。");
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    return;
  }
  if (args.length > 1) {
    throw new Error("只接受一个目标仓库路径");
  }

  const result = await bootstrap(args[0] ?? process.cwd());
  for (const file of result.created) console.log(`created ${file}`);
  for (const file of result.skipped) console.log(`skipped ${file}`);
  console.log(`完成：创建 ${result.created.length}，保留 ${result.skipped.length}`);
}

const isMain = process.argv[1]
  && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isMain) {
  main().catch((error) => {
    console.error(`初始化失败：${error.message}`);
    process.exitCode = 1;
  });
}
