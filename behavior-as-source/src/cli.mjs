import { parseArgs } from "node:util";

export class CliUsageError extends Error {}

export function failUsage(message) {
  throw new CliUsageError(message);
}

export function parseCliArgs(config) {
  try {
    return parseArgs(config);
  } catch (error) {
    throw new CliUsageError(error instanceof Error ? error.message : String(error));
  }
}

export function printJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

export function printIssues(issues) {
  for (const item of issues) {
    const location = item.line ? `:${item.line}` : "";
    process.stdout.write(`${item.severity.toUpperCase()} ${item.rule} ${item.file}${location}\n  ${item.message}\n`);
  }
}

export function renderTable(headers, rows) {
  const widths = headers.map((header, index) => Math.max(header.length, ...rows.map((row) => String(row[index] ?? "").length)));
  const line = (row) => row.map((value, index) => String(value ?? "").padEnd(widths[index])).join(" | ").trimEnd();
  return [line(headers), widths.map((width) => "-".repeat(width)).join("-|-"), ...rows.map(line)].join("\n");
}

export async function runCli(main) {
  try {
    await main();
  } catch (error) {
    const usage = error instanceof CliUsageError;
    process.stderr.write(`${usage ? "使用错误" : "执行失败"}：${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = usage ? 2 : 1;
  }
}
