/** @typedef {"hypothesis" | "pending_decision" | "active" | "deprecated" | "conflict"} BehaviorStatus */
/** @typedef {"not_run" | "passed" | "failed" | "blocked"} EvidenceResult */

/**
 * @typedef {object} BehaviorEvidence
 * @property {EvidenceResult} result
 * @property {string} run_id
 * @property {string | null} minimal_failure
 */

/**
 * @typedef {object} BehaviorMeta
 * @property {string} id
 * @property {BehaviorStatus} status
 * @property {string} owner
 * @property {string} introduced_in
 * @property {string} actor
 * @property {string} intent
 * @property {string[]} implementation
 * @property {string} driver
 * @property {string[]} oracle
 * @property {BehaviorEvidence} evidence
 * @property {string} hidden_scenarios_ref
 * @property {object[]} review_log
 * @property {string} [changed_in]
 * @property {string} [deprecated_in]
 * @property {string[]} [conflicts_with]
 * @property {string} [rationale]
 */

/**
 * @typedef {object} BehaviorFile
 * @property {string} path
 * @property {string} root
 * @property {BehaviorMeta} meta
 * @property {import("@cucumber/messages").GherkinDocument | undefined} gherkin
 * @property {string} rawBody
 * @property {string} rawFrontmatter
 */

/**
 * @typedef {object} LintIssue
 * @property {string} file
 * @property {string} rule
 * @property {"error" | "warning"} severity
 * @property {string} message
 * @property {number} [line]
 */

export const behaviorStatuses = ["hypothesis", "pending_decision", "active", "deprecated", "conflict"];
export const evidenceResults = ["not_run", "passed", "failed", "blocked"];
