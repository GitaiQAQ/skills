import path from "node:path";
import { pathToFileURL } from "node:url";

import { repositoryRelative } from "./fs.mjs";

const REVIEW_STATUSES = new Set(["hypothesis", "pending_decision", "conflict"]);
const STATUS_ORDER = { conflict: 0, pending_decision: 1, hypothesis: 2 };

export function reviewReasons(file) {
  const meta = file.meta;
  const reasons = [];
  if (meta.status === "conflict") reasons.push("conflict");
  if (meta.owner === "TODO") reasons.push("owner_todo");
  if (!Array.isArray(meta.implementation) || meta.implementation.length === 0) reasons.push("implementation_missing");
  if (meta.driver === "TODO") reasons.push("driver_todo");
  if (meta.oracle?.includes("TODO")) reasons.push("oracle_todo");
  if (meta.evidence?.result === "not_run") reasons.push("evidence_not_run");
  else if (meta.evidence?.result === "failed") reasons.push("evidence_failed");
  else if (meta.evidence?.result === "blocked") reasons.push("evidence_blocked");
  if (meta.hidden_scenarios_ref === "TODO") reasons.push("hidden_scenarios_todo");
  return reasons;
}

export function reviewQueue(files) {
  return files
    .filter((file) => REVIEW_STATUSES.has(file.meta.status))
    .map((file) => ({ file, reasons: reviewReasons(file) }))
    .sort((left, right) =>
      (STATUS_ORDER[left.file.meta.status] ?? 9) - (STATUS_ORDER[right.file.meta.status] ?? 9) ||
      String(left.file.meta.id).localeCompare(String(right.file.meta.id)),
    );
}


export function reviewYamlSummary(files, root = process.cwd()) {
  const queue = reviewQueue(files);
  return {
    total: queue.length,
    items: queue.map(({ file, reasons }) => ({
      id: file.meta.id ?? path.basename(file.path),
      status: file.meta.status ?? "unknown",
      reasons,
      path: repositoryRelative(root, file.path),
    })),
  };
}

function yamlScalar(value) {
  if (value === null || value === undefined) return "null";
  if (typeof value !== "string") return String(value);
  return /^[A-Za-z0-9_./:@-]+$/.test(value) ? value : JSON.stringify(value);
}

export function renderReviewYaml(files, root = process.cwd()) {
  const summary = reviewYamlSummary(files, root);
  if (!summary.items.length) return "total: 0\nitems: []\n";
  const lines = [`total: ${summary.total}`, "items:"];
  for (const item of summary.items) {
    lines.push(
      `  - id: ${yamlScalar(item.id)}`,
      `    status: ${yamlScalar(item.status)}`,
      "    reasons:",
      ...(item.reasons.length ? item.reasons.map((reason) => `      - ${yamlScalar(reason)}`) : ["      []"]),
      `    path: ${yamlScalar(item.path)}`,
    );
  }
  return `${lines.join("\n")}\n`;
}

export function terminalLink(text, target, enabled = true) {
  if (!enabled) return text;
  const url = target instanceof URL ? target.href : pathToFileURL(path.resolve(target)).href;
  return `\u001b]8;;${url}\u0007${text}\u001b]8;;\u0007`;
}

export function renderReviewStatus(files, root = process.cwd(), { links = false } = {}) {
  const queue = reviewQueue(files);
  if (!queue.length) return "No behaviors need review.\n";
  const lines = ["Behavior review", `Needs review: ${queue.length}`, ""];
  for (const { file, reasons } of queue) {
    const displayPath = repositoryRelative(root, file.path);
    lines.push(
      `- ${file.meta.id ?? path.basename(file.path)} [${file.meta.status ?? "unknown"}]: ${reasons.join(", ") || "manual_decision"}`,
      `  ${terminalLink(displayPath, file.path, links)}`,
    );
  }
  return `${lines.join("\n")}\n`;
}
