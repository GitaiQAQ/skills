#!/usr/bin/env node
import path from "node:path";

import { behaviorDetails, behaviorsForImplementation, parseRegistryForImpact } from "../src/impact.mjs";
import { failUsage, parseCliArgs, printJson, renderTable, runCli } from "../src/cli.mjs";
import { findById } from "../src/registry.mjs";

const usage = "behavior-impact (--path <src-file> | --id <behavior-id>) [--root <path>] [--json]";

await runCli(() => {
  const { values } = parseCliArgs({
    args: process.argv.slice(2),
    options: {
      path: { type: "string" }, id: { type: "string" }, root: { type: "string", default: process.cwd() },
      json: { type: "boolean", default: false }, help: { type: "boolean", short: "h", default: false },
    },
  });
  if (values.help) return process.stdout.write(`${usage}\n`);
  if (Boolean(values.path) === Boolean(values.id)) failUsage(`必须且只能提供 --path 或 --id。用法：${usage}`);
  const root = path.resolve(values.root);
  const files = parseRegistryForImpact(root, values.path);
  if (values.path) {
    const rows = behaviorsForImplementation(files, values.path, root).map((file) => ({ id: file.meta.id, path: file.path }));
    if (values.json) printJson(rows);
    else process.stdout.write(`${renderTable(["id", "path"], rows.map((item) => [item.id, item.path]))}\n`);
    return;
  }
  const matches = findById(files, values.id);
  if (matches.length !== 1) {
    process.stderr.write(matches.length ? `Behavior ID 重复：${values.id}\n` : `未找到 Behavior：${values.id}\n`);
    process.exitCode = 1;
    return;
  }
  const output = behaviorDetails(matches[0]);
  printJson(output);
});
