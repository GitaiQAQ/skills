#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixturesRoot = path.join(skillRoot, "evals", "fixtures");
const generatedRoot = path.join(fixturesRoot, "generated");
const sourcesPath = path.join(fixturesRoot, "sources.json");

function gitShow(repository, ref, filePath) {
  return execFileSync("git", ["show", `${ref}:${filePath}`], {
    cwd: repository,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
}

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function selectLines(content, startLine, endLine) {
  const lines = content.split("\n");
  return `${lines.slice(startLine - 1, endLine).join("\n")}\n`;
}

async function main() {
  const sources = JSON.parse(await readFile(sourcesPath, "utf8"));
  const repository = process.env.E2E_REPO ?? sources.repository;
  const manifest = {
    schema_version: "technical-writing-zh-fixture-manifest/v1",
    repository,
    generated_at: new Date().toISOString(),
    files: [],
  };

  await mkdir(generatedRoot, { recursive: true });

  for (const source of sources.sources) {
    const content = gitShow(repository, source.ref, source.path);
    await writeFile(path.join(generatedRoot, source.output), content);
    manifest.files.push({
      output: source.output,
      ref: source.ref,
      path: source.path,
      role: source.role,
      sha256: sha256(content),
      lines: content.split("\n").length - 1,
    });
  }

  for (const source of sources.derived_sources) {
    const original = gitShow(repository, source.ref, source.path);
    const content = selectLines(original, source.start_line, source.end_line);
    await writeFile(path.join(generatedRoot, source.output), content);
    manifest.files.push({
      output: source.output,
      ref: source.ref,
      path: source.path,
      role: source.role,
      line_range: [source.start_line, source.end_line],
      sha256: sha256(content),
      lines: content.split("\n").length - 1,
    });
  }

  await writeFile(
    path.join(generatedRoot, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  process.stdout.write(`Prepared ${manifest.files.length} fixtures in ${generatedRoot}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.stack ?? error}\n`);
  process.exitCode = 1;
});
