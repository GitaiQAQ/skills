#!/usr/bin/env node
import { failUsage, parseCliArgs, printJson, runCli } from "../src/cli.mjs";
import { findById, loadRegistry } from "../src/registry.mjs";

const usage = "behavior-locate <behavior-id> [root] [--json]";

await runCli(() => {
  const { values, positionals } = parseCliArgs({
    args: process.argv.slice(2), allowPositionals: true,
    options: { json: { type: "boolean", default: false }, help: { type: "boolean", short: "h", default: false } },
  });
  if (values.help) return process.stdout.write(`${usage}\n`);
  if (positionals.length < 1 || positionals.length > 2) failUsage(`用法：${usage}`);
  const [id, root] = positionals;
  const matches = findById(loadRegistry(root).files, id);
  if (matches.length !== 1) {
    process.stderr.write(matches.length ? `Behavior ID 重复：${id}\n` : `未找到 Behavior：${id}\n`);
    process.exitCode = 1;
    return;
  }
  const output = { id, path: matches[0].path };
  if (values.json) printJson(output);
  else process.stdout.write(`${output.path}\n`);
});
