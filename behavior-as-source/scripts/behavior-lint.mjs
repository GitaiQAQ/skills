#!/usr/bin/env node
import { failUsage, parseCliArgs, printIssues, printJson, runCli } from "../src/cli.mjs";
import { lintBehaviorRegistry } from "../src/lint.mjs";
import { loadRegistry } from "../src/registry.mjs";

const usage = "behavior-lint [root] [--json] [--no-warnings]";

await runCli(() => {
  const { values, positionals } = parseCliArgs({
    args: process.argv.slice(2),
    allowPositionals: true,
    options: {
      json: { type: "boolean", default: false },
      "no-warnings": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });
  if (values.help) return process.stdout.write(`${usage}\n`);
  if (positionals.length > 1) failUsage(`参数过多。用法：${usage}`);
  const { root, files } = loadRegistry(positionals[0]);
  if (!files.length) {
    if (values.json) printJson({ root, files: 0, errors: 1, warnings: 0, issues: [{ rule: "registry-empty", severity: "error", message: "no behavior files found" }] });
    else process.stderr.write(`未找到 Behavior 文件：${root}\n`);
    process.exitCode = 1;
    return;
  }
  let issues = lintBehaviorRegistry(files);
  if (values["no-warnings"]) issues = issues.filter((item) => item.severity === "error");
  const errors = issues.filter((item) => item.severity === "error").length;
  const warnings = issues.filter((item) => item.severity === "warning").length;
  const output = { root, files: files.length, errors, warnings, issues };
  if (values.json) printJson(output);
  else {
    printIssues(issues);
    process.stdout.write(`Checked ${files.length} behavior files: ${errors} errors, ${warnings} warnings\n`);
  }
  if (errors) process.exitCode = 1;
});
