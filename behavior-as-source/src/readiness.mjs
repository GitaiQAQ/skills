import { pathExists } from "./fs.mjs";

export function activeReadinessFailures(file) {
  const { meta } = file;
  const failures = [];
  if (meta.owner === "TODO") failures.push({ code: "owner_confirmation", message: "owner must not be TODO" });
  if (!Array.isArray(meta.implementation) || meta.implementation.length === 0) {
    failures.push({ code: "implementation", message: "implementation must contain at least one path" });
  }
  if (meta.evidence?.result !== "passed") {
    failures.push({ code: "passed_evidence", message: "evidence.result must be passed" });
  }
  if (!pathExists(file.root, meta.evidence?.run_id)) {
    failures.push({ code: "evidence_record", message: "evidence.run_id must point to an existing file" });
  }
  if (!meta.hidden_scenarios_ref || meta.hidden_scenarios_ref === "TODO") {
    failures.push({ code: "hidden_scenarios", message: "hidden_scenarios_ref must not be TODO" });
  }
  if (Array.isArray(meta.conflicts_with) && meta.conflicts_with.length > 0) {
    failures.push({ code: "conflict_resolution", message: "active behavior must not declare conflicts_with" });
  }
  return failures;
}
