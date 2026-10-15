#!/usr/bin/env node
import path from "node:path";

import { failUsage, parseCliArgs, printJson, runCli } from "../src/cli.mjs";
import { diffBehaviorRefs, renderBehaviorDiffMarkdown } from "../src/diff.mjs";

const usage = "behavior-diff <refA> <refB> [--root <path>] [--format markdown|json] [--json]";

await runCli(() => {
  const { values, positionals } = parseCliArgs({
    args: process.argv.slice(2), allowPositionals: true,
    options: {
      root: { type: "string", default: process.cwd() }, format: { type: "string", default: "markdown" },
      json: { type: "boolean", default: false }, help: { type: "boolean", short: "h", default: false },
    },
  });
  if (values.help) return process.stdout.write(`${usage}\n`);
  if (positionals.length !== 2) failUsage(`用法：${usage}`);
  if (!["markdown", "json"].includes(values.format)) failUsage(`未知 format：${values.format}`);
  const result = diffBehaviorRefs(positionals[0], positionals[1], path.resolve(values.root));
  if (values.json || values.format === "json") printJson(result);
  else process.stdout.write(renderBehaviorDiffMarkdown(result));
  if (result.errors.length) process.exitCode = 1;
});
