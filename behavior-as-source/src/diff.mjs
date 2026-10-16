import { execFileSync } from "node:child_process";
import path from "node:path";

import { findRepositoryRoot, repositoryRelative } from "./fs.mjs";
import { parseBehaviorSource } from "./parse.mjs";

const COMPARED_FIELDS = [
  "status",
  "owner",
  "introduced_in",
  "changed_in",
  "deprecated_in",
  "actor",
  "intent",
  "implementation",
  "driver",
  "oracle",
  "evidence",
  "hidden_scenarios_ref",
  "review_log",
  "conflicts_with",
];
const GHERKIN_FIELDS = [
  "scenario_keyword",
  "scenario_name",
  "scenario_description",
  "scenario_tags",
  "examples",
  "data_tables",
  "doc_strings",
];

function git(root, args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
}

function readRef(ref, requestedRoot) {
  const repositoryRoot = findRepositoryRoot(requestedRoot);
  const rootRelative = repositoryRelative(repositoryRoot, requestedRoot);
  const pathspec = rootRelative === "." ? [] : ["--", rootRelative];
  const paths = git(repositoryRoot, ["ls-tree", "-r", "--name-only", ref, ...pathspec])
    .split(/\r?\n/)
    .filter((filePath) => filePath.endsWith(".behavior.md"))
    .sort();
  return paths.map((filePath) =>
    parseBehaviorSource(
      path.resolve(repositoryRoot, filePath),
      git(repositoryRoot, ["show", `${ref}:${filePath}`]),
      repositoryRoot,
    ),
  );
}

function uniqueById(files, ref) {
  const result = new Map();
  for (const file of files) {
    if (!file.meta.id) throw new Error(`${ref} 中 ${file.path} 缺少 Behavior ID`);
    if (result.has(file.meta.id)) throw new Error(`${ref} 中 Behavior ID 重复：${file.meta.id}`);
    result.set(file.meta.id, file);
  }
  return result;
}

function stepKey(step) {
  return `${step.keyword}\0${step.text}`;
}

function lcsPairs(before, after) {
  const lengths = Array.from({ length: before.length + 1 }, () => Array(after.length + 1).fill(0));
  for (let left = before.length - 1; left >= 0; left -= 1) {
    for (let right = after.length - 1; right >= 0; right -= 1) {
      lengths[left][right] =
        stepKey(before[left]) === stepKey(after[right])
          ? lengths[left + 1][right + 1] + 1
          : Math.max(lengths[left + 1][right], lengths[left][right + 1]);
    }
  }
  const pairs = [];
  let left = 0;
  let right = 0;
  while (left < before.length && right < after.length) {
    if (stepKey(before[left]) === stepKey(after[right])) {
      pairs.push([left, right]);
      left += 1;
      right += 1;
    } else if (lengths[left + 1][right] >= lengths[left][right + 1]) {
      left += 1;
    } else {
      right += 1;
    }
  }
  return pairs;
}

export function compareSteps(before, after) {
  const anchors = [...lcsPairs(before, after), [before.length, after.length]];
  const changes = [];
  let beforeStart = 0;
  let afterStart = 0;
  for (const [beforeEnd, afterEnd] of anchors) {
    const removed = before.slice(beforeStart, beforeEnd);
    const added = after.slice(afterStart, afterEnd);
    const paired = Math.min(removed.length, added.length);
    for (let index = 0; index < paired; index += 1) {
      changes.push({ kind: "modified", before: removed[index], after: added[index] });
    }
    for (const step of removed.slice(paired)) changes.push({ kind: "deleted", before: step });
    for (const step of added.slice(paired)) changes.push({ kind: "added", after: step });
    beforeStart = beforeEnd + 1;
    afterStart = afterEnd + 1;
  }
  return changes;
}

function firstThen(file) {
  return file.steps.find((step) => step.keyword === "Then")?.text ?? file.steps.at(-1)?.text ?? "";
}

function rationale(file) {
  if (typeof file.meta.rationale === "string") return file.meta.rationale;
  const section = /^##\s+Rationale\s*\r?\n+([\s\S]*?)(?=^##\s|\s*$)/im.exec(file.rawBody)?.[1];
  return section?.trim().replace(/\s+/g, " ") || "未提供理由";
}

function changedFields(before, after, fields) {
  return fields.flatMap((field) =>
    JSON.stringify(before?.[field]) === JSON.stringify(after?.[field])
      ? []
      : [{ field, before: before?.[field], after: after?.[field] }],
  );
}

export function diffBehaviorRefs(refA, refB, root = process.cwd()) {
  const before = uniqueById(readRef(refA, path.resolve(root)), refA);
  const after = uniqueById(readRef(refB, path.resolve(root)), refB);
  const result = { refA, refB, added: [], modified: [], deprecated: [], errors: [] };

  for (const id of [...before.keys()].sort()) {
    if (!after.has(id)) result.errors.push(`Behavior ${id} 被直接删除；请保留条目并标为 deprecated`);
  }

  for (const [id, current] of [...after.entries()].sort(([left], [right]) => left.localeCompare(right))) {
    const previous = before.get(id);
    if (!previous) {
      result.added.push({ id, title: current.title, summary: firstThen(current) });
      continue;
    }
    if (current.meta.status === "deprecated" && previous.meta.status !== "deprecated") {
      result.deprecated.push({
        id,
        title: current.title,
        deprecated_in: current.meta.deprecated_in,
        reason: rationale(current),
      });
    }
    const frontmatter = changedFields(previous.meta, current.meta, COMPARED_FIELDS);
    const content = changedFields(
      { title: previous.title, rationale: rationale(previous) },
      { title: current.title, rationale: rationale(current) },
      ["title", "rationale"],
    );
    const gherkin = changedFields(previous.gherkinSemantics, current.gherkinSemantics, GHERKIN_FIELDS);
    const steps = compareSteps(previous.steps, current.steps);
    if (frontmatter.length || content.length || gherkin.length || steps.length) {
      result.modified.push({ id, title: current.title, frontmatter, content, gherkin, steps });
    }
  }
  return result;
}

function inline(value) {
  return value === undefined ? "—" : `\`${JSON.stringify(value)}\``;
}

export function renderBehaviorDiffMarkdown(result) {
  const lines = [`# Behavior Diff: ${result.refA} → ${result.refB}`, "", "## 新增", ""];
  if (!result.added.length) lines.push("- 无");
  for (const item of result.added) lines.push(`- **${item.id}** ${item.title}：${item.summary || "—"}`);
  lines.push("", "## 修改", "");
  if (!result.modified.length) lines.push("- 无");
  for (const item of result.modified) {
    lines.push(`### ${item.id}`, "");
    for (const change of item.frontmatter) {
      lines.push(`- ${change.field}: ${inline(change.before)} → ${inline(change.after)}`);
    }
    for (const change of item.content) {
      lines.push(`- ${change.field}: ${inline(change.before)} → ${inline(change.after)}`);
    }
    for (const change of item.gherkin) {
      lines.push(`- Gherkin ${change.field}: ${inline(change.before)} → ${inline(change.after)}`);
    }
    for (const change of item.steps) {
      if (change.kind === "modified") {
        lines.push(`- Step 修改：\`${change.before.keyword} ${change.before.text}\` → \`${change.after.keyword} ${change.after.text}\``);
      } else if (change.kind === "added") {
        lines.push(`- Step 新增：\`${change.after.keyword} ${change.after.text}\``);
      } else {
        lines.push(`- Step 删除：\`${change.before.keyword} ${change.before.text}\``);
      }
    }
  }
  lines.push("", "## 废弃", "");
  if (!result.deprecated.length) lines.push("- 无");
  for (const item of result.deprecated) {
    lines.push(`- **${item.id}** ${item.title}（${item.deprecated_in ?? "未填写 deprecated_in"}）：${item.reason}`);
  }
  if (result.errors.length) {
    lines.push("", "## 错误", "");
    for (const error of result.errors) lines.push(`- ${error}`);
  }
  return `${lines.join("\n")}\n`;
}
