import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  bootstrap,
  STATIC_TEMPLATE_FILES,
  templateFilesFor,
} from "../scripts/bootstrap.mjs";

const TEST_DIRS = [];
const HERE = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = path.resolve(HERE, "../templates");
const VERIFIER = path.resolve(HERE, "../scripts/verify-agent-notes.mjs");
const TEST_DATE = new Date(2026, 8, 30);
const ADOPTION_NOTE =
  ".agents/notes/implemented/process/2026-09-30-project-rsi-adoption.md";

async function temporaryDirectory() {
  const directory = await mkdtemp(path.join(os.tmpdir(), "autonomous-maintainer-"));
  await mkdir(path.join(directory, ".git"));
  TEST_DIRS.push(directory);
  return directory;
}

function git(target, args) {
  const result = spawnSync("git", args, { cwd: target, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
}

async function gitTemporaryDirectory() {
  const directory = await mkdtemp(path.join(os.tmpdir(), "autonomous-maintainer-git-"));
  TEST_DIRS.push(directory);
  git(directory, ["init", "--quiet"]);
  git(directory, ["config", "user.name", "Autonomous Maintainer Test"]);
  git(directory, ["config", "user.email", "autonomous-maintainer-test@example.invalid"]);
  return directory;
}

afterEach(async () => {
  await Promise.all(TEST_DIRS.splice(0).map((directory) =>
    rm(directory, { recursive: true, force: true })));
});

test("模板集合不包含旧治理文件或私有维护配置输出", async () => {
  assert.deepEqual(STATIC_TEMPLATE_FILES, [
    ".agents/notes/README.md",
  ]);
  assert.ok(templateFilesFor(TEST_DATE).every((file) => !file.startsWith(".rsi/")));
  await assert.rejects(stat(path.join(TEMPLATE_DIR, "AI-MAINTENANCE.md")), { code: "ENOENT" });
  await assert.rejects(stat(path.join(TEMPLATE_DIR, ".rsi")), { code: "ENOENT" });
  await assert.rejects(
    stat(path.join(TEMPLATE_DIR, "scripts/verify-agent-notes.mjs")),
    { code: "ENOENT" },
  );
});

test("首次初始化仅创建 Notes README 与采用 Note 且内容一致", async () => {
  const target = await temporaryDirectory();
  const result = await bootstrap(target, { date: TEST_DATE });
  const expectedFiles = templateFilesFor(TEST_DATE);

  assert.deepEqual(result.created, expectedFiles);
  assert.deepEqual(result.skipped, []);

  for (const relativePath of STATIC_TEMPLATE_FILES) {
    const [actual, expected] = await Promise.all([
      readFile(path.join(target, relativePath), "utf8"),
      readFile(path.join(TEMPLATE_DIR, relativePath), "utf8"),
    ]);
    assert.equal(actual, expected.replaceAll("YYYY-MM-DD", "2026-09-30"), relativePath);
  }

  const actualAdoption = await readFile(path.join(target, ADOPTION_NOTE), "utf8");
  const adoptionTemplate = await readFile(
    path.join(
      TEMPLATE_DIR,
      ".agents/notes/implemented/process/yyyy-mm-dd-project-rsi-adoption.md",
    ),
    "utf8",
  );
  assert.equal(actualAdoption, adoptionTemplate.replaceAll("YYYY-MM-DD", "2026-09-30"));
  await assert.rejects(readFile(path.join(target, "AI-MAINTENANCE.md")));
  await assert.rejects(readFile(path.join(target, "scripts/verify-agent-notes.mjs")));
  await assert.rejects(readFile(path.join(target, ".rsi/policy.yaml")));
  await assert.rejects(readFile(path.join(target, ".rsi/checks.yaml")));
  await assert.rejects(stat(path.join(target, ".rsi")), { code: "ENOENT" });
});

test("重复初始化幂等且不覆盖已有文件", async () => {
  const target = await temporaryDirectory();
  const expectedFiles = templateFilesFor(TEST_DATE);
  await bootstrap(target, { date: TEST_DATE });

  const protectedFile = path.join(target, ADOPTION_NOTE);
  const customContent = "用户已有内容\n";
  await writeFile(protectedFile, customContent);

  const result = await bootstrap(target, { date: TEST_DATE });
  assert.deepEqual(result.created, []);
  assert.deepEqual(result.skipped, expectedFiles);
  assert.equal(await readFile(protectedFile, "utf8"), customContent);
});

test("跨日重复初始化不会创建第二份采用 Note", async () => {
  const target = await temporaryDirectory();
  await bootstrap(target, { date: TEST_DATE });

  const nextDay = new Date(2026, 9, 1);
  const result = await bootstrap(target, { date: nextDay });

  assert.deepEqual(result.created, []);
  assert.deepEqual(result.skipped, [
    ...STATIC_TEMPLATE_FILES,
    ADOPTION_NOTE,
  ]);
  await assert.rejects(readFile(path.join(
    target,
    ".agents/notes/implemented/process/2026-10-01-project-rsi-adoption.md",
  )));
});

test("旧 ai-native-rsi 采用 Note 存在时不会重复创建", async () => {
  const target = await temporaryDirectory();
  const notesReadme = path.join(target, ".agents/notes/README.md");
  const legacyAdoption = path.join(
    target,
    ".agents/notes/implemented/process/2026-09-29-ai-native-rsi-adoption.md",
  );
  await mkdir(path.dirname(legacyAdoption), { recursive: true });
  const readmeTemplate = await readFile(path.join(TEMPLATE_DIR, ".agents/notes/README.md"), "utf8");
  await writeFile(notesReadme, readmeTemplate.replaceAll("YYYY-MM-DD", "2026-09-29"));
  await writeFile(legacyAdoption, "legacy adoption\n");

  const result = await bootstrap(target, { date: TEST_DATE });

  assert.deepEqual(result.created, []);
  assert.deepEqual(result.skipped, [
    ".agents/notes/README.md",
    ".agents/notes/implemented/process/2026-09-29-ai-native-rsi-adoption.md",
  ]);
  await assert.rejects(readFile(path.join(target, ADOPTION_NOTE)));
});

test("部分初始化只补齐缺失文件", async () => {
  const target = await temporaryDirectory();
  const existingRelative = ".agents/notes/README.md";
  const existing = path.join(target, existingRelative);
  await mkdir(path.dirname(existing), { recursive: true });
  const template = await readFile(path.join(TEMPLATE_DIR, existingRelative), "utf8");
  await writeFile(existing, template.replaceAll("YYYY-MM-DD", "2026-09-30"));

  const result = await bootstrap(target, { date: TEST_DATE });
  assert.equal(await readFile(existing, "utf8"), template.replaceAll("YYYY-MM-DD", "2026-09-30"));
  assert.deepEqual(result.skipped, [existingRelative]);
  assert.deepEqual(
    result.created,
    templateFilesFor(TEST_DATE).filter((file) => file !== existingRelative),
  );
});

test("已有自定义 Notes 规范时失败且不写入任何自治维护文件", async () => {
  const target = await temporaryDirectory();
  const notesReadme = path.join(target, ".agents/notes/README.md");
  await mkdir(path.dirname(notesReadme), { recursive: true });
  await writeFile(notesReadme, "# 项目自定义 Notes\n");

  await assert.rejects(
    bootstrap(target, { date: TEST_DATE }),
    /已有自定义 Agent Notes 规范/,
  );
  assert.equal(await readFile(notesReadme, "utf8"), "# 项目自定义 Notes\n");
  await assert.rejects(stat(path.join(target, "scripts")), { code: "ENOENT" });
  await assert.rejects(
    stat(path.join(target, ".agents/notes/implemented")),
    { code: "ENOENT" },
  );
});

test("Notes 验证器接受初始化 Note", async () => {
  const target = await gitTemporaryDirectory();
  await bootstrap(target, { date: TEST_DATE });

  const result = spawnSync(process.execPath, [VERIFIER], {
    cwd: target,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Agent Notes 校验通过：1 篇 Note/);
  await assert.rejects(stat(path.join(target, ".agents/notes/proposed")), { code: "ENOENT" });
  await assert.rejects(stat(path.join(target, ".agents/notes/rejected/INDEX.md")), { code: "ENOENT" });
});

test("Notes 验证器仅在存在 rejected Note 时要求 rejected 索引", async () => {
  const target = await gitTemporaryDirectory();
  await bootstrap(target, { date: TEST_DATE });
  const rejected = path.join(
    target,
    ".agents/notes/rejected/process/2026-09-30-rejected-control.md",
  );
  await mkdir(path.dirname(rejected), { recursive: true });
  await writeFile(
    rejected,
    "# Agent Note: 拒绝平行控制面\nStatus: rejected — 与项目原生治理重复\n\n## Problem\n\n项目需要避免重复事实来源。\n\n## Proposal\n\n在项目内建立独立控制面。\n\n## Alternatives considered\n\n**复用项目原生治理。** 能避免规则漂移。\n\n## Reintroduction conditions\n\n项目原生治理无法表达必要约束时重新评估。\n",
  );

  const missingIndex = spawnSync(process.execPath, [VERIFIER, target], { encoding: "utf8" });
  assert.equal(missingIndex.status, 1);
  assert.match(missingIndex.stderr, /Rejected 索引不存在/);

  const index = path.join(target, ".agents/notes/rejected/INDEX.md");
  await mkdir(path.dirname(index), { recursive: true });
  await writeFile(
    index,
    "# Rejected index\n\n- [拒绝平行控制面](process/2026-09-30-rejected-control.md)\n",
  );
  const valid = spawnSync(process.execPath, [VERIFIER, target], { encoding: "utf8" });
  assert.equal(valid.status, 0, valid.stderr);
  assert.match(valid.stdout, /Agent Notes 校验通过：2 篇 Note/);
});

test("Notes 验证器拒绝缺少 Proposal 的 proposed Note", async () => {
  const target = await gitTemporaryDirectory();
  await bootstrap(target, { date: TEST_DATE });
  const invalid = path.join(
    target,
    ".agents/notes/proposed/feature/2026-09-30-missing-proposal.md",
  );
  await mkdir(path.dirname(invalid), { recursive: true });
  await writeFile(
    invalid,
    "# Agent Note: 缺少提案\nStatus: proposed\n\n## Problem\n\n问题固定。\n\n## Alternatives considered\n\n**维持现状。** 无法解决问题。\n\n## Acceptance criteria\n\n必须可验证。\n\n## Risks\n\n存在风险。\n",
  );

  const result = spawnSync(process.execPath, [VERIFIER, target], {
    cwd: target,
    encoding: "utf8",
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Proposal/);
});

test("Notes 验证器拒绝改写 Git 历史中的 Problem", async () => {
  const target = await gitTemporaryDirectory();
  await bootstrap(target, { date: TEST_DATE });
  git(target, ["add", "."]);
  git(target, ["commit", "--quiet", "-m", "bootstrap project rsi"]);

  const adoption = path.join(target, ADOPTION_NOTE);
  const original = await readFile(adoption, "utf8");
  await writeFile(adoption, original.replace(
    "项目需要持续处理依赖、缺陷、重构和运行维护",
    "项目只需要处理依赖",
  ));

  const result = spawnSync(process.execPath, [VERIFIER, target], {
    cwd: target,
    encoding: "utf8",
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Problem 相对 HEAD 被改写/);
});

test("拒绝初始化非 Git 目录", async () => {
  const target = await mkdtemp(path.join(os.tmpdir(), "autonomous-maintainer-non-git-"));
  TEST_DIRS.push(target);

  await assert.rejects(
    bootstrap(target),
    /目标不是 Git 仓库根目录/,
  );
});

test("拒绝创建不存在的目标目录", async () => {
  const parent = await temporaryDirectory();
  const missing = path.join(parent, "missing");

  await assert.rejects(
    bootstrap(missing),
    /目标目录不存在/,
  );
});

console.log("TESTS_OK");
