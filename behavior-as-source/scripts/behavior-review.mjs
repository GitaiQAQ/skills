#!/usr/bin/env node
import { failUsage, parseCliArgs, runCli } from "../src/cli.mjs";
import { renderReviewStatus, renderReviewYaml } from "../src/review.mjs";
import { loadRegistry } from "../src/registry.mjs";

const usage = "behavior-review status [root] [--links|--yaml]";

await runCli(() => {
  const { values, positionals } = parseCliArgs({
    args: process.argv.slice(2),
    allowPositionals: true,
    options: {
      links: { type: "boolean", default: process.stdout.isTTY },
      yaml: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });
  if (values.help) return process.stdout.write(`${usage}\n`);
  if (values.yaml && values.links) failUsage(`--yaml 和 --links 不能同时使用。用法：${usage}`);
  if (positionals[0] !== "status" || positionals.length > 2) failUsage(`用法：${usage}`);
  const { root, files } = loadRegistry(positionals[1]);
  if (values.yaml) process.stdout.write(renderReviewYaml(files, root));
  else process.stdout.write(renderReviewStatus(files, root, { links: values.links }));
});
