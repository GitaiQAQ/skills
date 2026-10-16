import fs from "node:fs";
import path from "node:path";

import { AstBuilder, GherkinClassicTokenMatcher, Parser } from "@cucumber/gherkin";
import { IdGenerator } from "@cucumber/messages";
import fg from "fast-glob";
import matter from "gray-matter";

const GHERKIN_BLOCK = /^```gherkin[ \t]*\r?\n([\s\S]*?)^```[ \t]*$/gim;

function firstFrontmatterKey(raw) {
  for (const line of (raw ?? "").split(/\r?\n/)) {
    if (!line.trim() || /^\s*#/.test(line) || /^\s/.test(line)) continue;
    const match = /^([^:#][^:]*):/.exec(line);
    if (match) return match[1].trim();
  }
  return undefined;
}

function parseGherkin(source, id) {
  const parser = new Parser(new AstBuilder(IdGenerator.incrementing()), new GherkinClassicTokenMatcher());
  return parser.parse(`Feature: ${id || "unknown"}\n${source}`);
}

function scenarioNodes(document) {
  return document?.feature?.children?.flatMap((child) => (child.scenario ? [child.scenario] : [])) ?? [];
}

function stepsFrom(document) {
  return scenarioNodes(document).flatMap((scenario) =>
    (scenario.steps ?? []).map((step) => ({
      keyword: step.keyword.trim(),
      text: step.text,
    })),
  );
}

function tableRows(table) {
  return table?.rows?.map((row) => row.cells.map((cell) => cell.value)) ?? [];
}

function gherkinSemanticsFrom(document) {
  const scenario = scenarioNodes(document)[0];
  if (!scenario) return undefined;
  const steps = scenario.steps ?? [];
  return {
    scenario_keyword: scenario.keyword,
    scenario_name: scenario.name,
    scenario_description: scenario.description,
    scenario_tags: (scenario.tags ?? []).map((tag) => tag.name),
    examples: (scenario.examples ?? []).map((example) => ({
      keyword: example.keyword,
      name: example.name,
      description: example.description,
      tags: (example.tags ?? []).map((tag) => tag.name),
      header: tableRows(example.tableHeader ? { rows: [example.tableHeader] } : undefined)[0] ?? [],
      body: tableRows({ rows: example.tableBody ?? [] }),
    })),
    data_tables: steps.flatMap((step, index) =>
      step.dataTable ? [{ step: index, rows: tableRows(step.dataTable) }] : [],
    ),
    doc_strings: steps.flatMap((step, index) =>
      step.docString
        ? [{
            step: index,
            media_type: step.docString.mediaType ?? null,
            delimiter: step.docString.delimiter,
            content: step.docString.content,
          }]
        : [],
    ),
  };
}

export function parseBehaviorSource(filePath, source, root = process.cwd()) {
  const rawFrontmatter = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(source)?.[1] ?? "";
  let parsed = { data: {}, content: source, matter: "" };
  let frontmatterError;
  try {
    parsed = matter(source);
  } catch (error) {
    frontmatterError = error instanceof Error ? error.message : String(error);
  }

  const blocks = [...parsed.content.matchAll(GHERKIN_BLOCK)];
  let gherkin;
  let gherkinError;
  if (blocks.length === 1) {
    try {
      gherkin = parseGherkin(blocks[0][1], parsed.data.id);
    } catch (error) {
      gherkinError = error instanceof Error ? error.message : String(error);
    }
  }
  const title = /^#\s+(.+)$/m.exec(parsed.content)?.[1]?.trim() ?? "";
  return {
    path: path.resolve(filePath),
    root: path.resolve(root),
    meta: parsed.data,
    title,
    gherkin,
    gherkinSemantics: gherkinSemanticsFrom(gherkin),
    steps: stepsFrom(gherkin),
    scenarioCount: scenarioNodes(gherkin).length,
    gherkinCount: blocks.length,
    gherkinSource: blocks[0]?.[1],
    rawBody: parsed.content,
    rawFrontmatter,
    firstFrontmatterKey: firstFrontmatterKey(rawFrontmatter),
    frontmatterError,
    gherkinError,
  };
}

export function parseBehaviorFile(filePath, root = process.cwd()) {
  return parseBehaviorSource(filePath, fs.readFileSync(filePath, "utf8"), root);
}

export function discoverBehaviorPaths(root = process.cwd()) {
  const absoluteRoot = path.resolve(root);
  const includeFixtures = path.basename(absoluteRoot) === "fixtures";
  return fg.sync("**/*.behavior.md", {
    cwd: absoluteRoot,
    absolute: true,
    onlyFiles: true,
    unique: true,
    ignore: [
      "**/.git/**",
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      ...(includeFixtures ? [] : ["**/tests/fixtures/**"]),
    ],
  }).sort();
}

export function parseBehaviorDir(root = process.cwd()) {
  const absoluteRoot = path.resolve(root);
  return discoverBehaviorPaths(absoluteRoot).map((filePath) => parseBehaviorFile(filePath, absoluteRoot));
}
