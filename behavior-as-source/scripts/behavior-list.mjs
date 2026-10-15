#!/usr/bin/env node
import { failUsage, parseCliArgs, printJson, renderTable, runCli } from "../src/cli.mjs";
import { loadRegistry, sortedRegistryRows } from "../src/registry.mjs";

const statuses = ["hypothesis", "pending_decision", "active", "deprecated", "conflict"];
const usage = "behavior-list [root] [--status <s>] [--owner <o>] [--format table|json] [--json]";

await runCli(() => {
  const { values, positionals } = parseCliArgs({
    args: process.argv.slice(2), allowPositionals: true,
    options: {
      status: { type: "string" }, owner: { type: "string" }, format: { type: "string", default: "table" },
      json: { type: "boolean", default: false }, help: { type: "boolean", short: "h", default: false },
    },
  });
  if (values.help) return process.stdout.write(`${usage}\n`);
  if (positionals.length > 1) failUsage(`参数过多。用法：${usage}`);
  if (values.status && !statuses.includes(values.status)) failUsage(`未知 status：${values.status}`);
  if (!["table", "json"].includes(values.format)) failUsage(`未知 format：${values.format}`);
  const rows = sortedRegistryRows(loadRegistry(positionals[0]).files)
    .filter((item) => !values.status || item.status === values.status)
    .filter((item) => !values.owner || item.owner === values.owner);
  if (values.json || values.format === "json") printJson(rows);
  else process.stdout.write(`${renderTable(["id", "status", "owner", "path", "title"], rows.map((item) => [item.id, item.status, item.owner, item.path, item.title]))}\n`);
});
