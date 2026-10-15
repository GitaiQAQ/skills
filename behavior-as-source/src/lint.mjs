import path from "node:path";

import { pathExists, repositoryRelative } from "./fs.mjs";
import { validateBehaviorMeta } from "./schema.mjs";

const VAGUE_FILENAMES = new Set(["test", "a", "new", "tmp", "xxx", "foo"]);

function issue(file, rule, severity, message, line) {
  return {
    file: repositoryRelative(file.root, file.path),
    rule,
    severity,
    message,
    ...(line ? { line } : {}),
  };
}

function activeGateFailures(file) {
  const { meta } = file;
  if (meta.status !== "active") return [];
  const failures = [];
  if (meta.owner === "TODO") failures.push("owner must not be TODO");
  if (!Array.isArray(meta.implementation) || meta.implementation.length === 0) {
    failures.push("implementation must contain at least one path");
  }
  if (meta.evidence?.result !== "passed") failures.push("evidence.result must be passed");
  if (!pathExists(file.root, meta.evidence?.run_id)) failures.push("evidence.run_id must point to an existing file");
  if (!meta.hidden_scenarios_ref || meta.hidden_scenarios_ref === "TODO") {
    failures.push("hidden_scenarios_ref must not be TODO");
  }
  if (Array.isArray(meta.conflicts_with) && meta.conflicts_with.length > 0) {
    failures.push("active behavior must not declare conflicts_with");
  }
  return failures;
}

export function lintBehavior(file) {
  const issues = [];
  if (file.frontmatterError) {
    issues.push(issue(file, "schema", "error", `frontmatter parse failed: ${file.frontmatterError}`));
  } else {
    const schema = validateBehaviorMeta(file.meta);
    for (const error of schema.errors) {
      issues.push(issue(file, "schema", "error", `${error.path} ${error.message}`));
    }
  }

  if (file.gherkinCount !== 1) {
    issues.push(issue(file, "gherkin-count", "error", `expected exactly 1 gherkin block, found ${file.gherkinCount}`));
  }
  if (file.gherkinError) {
    issues.push(issue(file, "gherkin-parse", "error", file.gherkinError));
  }
  if (file.gherkin && file.scenarioCount !== 1) {
    issues.push(issue(file, "scenario-count", "error", `expected exactly 1 Scenario or Scenario Outline, found ${file.scenarioCount}`));
  }
  if (file.firstFrontmatterKey !== "id") {
    issues.push(issue(file, "id-position", "error", "id must be the first frontmatter key"));
  }

  for (const implementation of Array.isArray(file.meta.implementation) ? file.meta.implementation : []) {
    if (!pathExists(file.root, implementation)) {
      issues.push(issue(file, "implementation-exists", "error", `implementation path does not exist: ${implementation}`));
    }
  }

  const gateFailures = activeGateFailures(file);
  if (gateFailures.length) {
    issues.push(issue(file, "active-gate", "error", gateFailures.join("; ")));
  }

  if (file.meta.evidence?.result === "passed" && !pathExists(file.root, file.meta.evidence.run_id)) {
    issues.push(issue(file, "evidence-consistency", "error", "passed evidence must reference an existing repository file"));
  }

  const slug = path.basename(file.path, ".behavior.md").toLowerCase();
  if (VAGUE_FILENAMES.has(slug)) {
    issues.push(issue(file, "vague-filename", "warning", `filename '${slug}.behavior.md' is not descriptive`));
  }
  if (!file.meta.rationale && !/^##\s+Rationale\s*$/im.test(file.rawBody)) {
    issues.push(issue(file, "missing-rationale", "warning", "add rationale frontmatter or a ## Rationale section"));
  }
  return issues;
}

export function lintBehaviorRegistry(files) {
  const issues = files.flatMap(lintBehavior);
  const byId = new Map();
  for (const file of files) {
    if (typeof file.meta.id !== "string") continue;
    const matches = byId.get(file.meta.id) ?? [];
    matches.push(file);
    byId.set(file.meta.id, matches);
  }
  for (const [id, matches] of byId) {
    if (matches.length < 2) continue;
    for (const file of matches) {
      issues.push(issue(file, "id-unique", "error", `Behavior id is duplicated: ${id}`));
    }
  }
  return issues.sort((left, right) =>
    left.file.localeCompare(right.file) || left.severity.localeCompare(right.severity) || left.rule.localeCompare(right.rule),
  );
}
