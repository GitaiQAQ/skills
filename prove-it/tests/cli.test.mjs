#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const cli = path.resolve(here, "../scripts/prove-it.mjs");

const validStore = `# Managed by prove-it.
schema: "prove-it/v1"
story:
  id: "e2e-pilot"
  goal: "Prove representative E2E performance scenarios."
  refs:
    - ".unlazy/e2e/PLAN.md"
dimensions:
  objective:
    - "creation"
  entity:
    - "campaign"
  metric:
    - "tti"
    - "memory"
facets:
  runner: "The browser execution completed normally."
  metric: "The metric is valid and belongs to this action."
checkpoints:
  - id: "creation.campaign.tti"
    at:
      objective: "creation"
      entity: "campaign"
      metric: "tti"
    facets:
      runner:
        state: "open"
        notes: []
        refs: []
      metric:
        state: "open"
        notes: []
        refs: []
    notes: []
    refs: []
  - id: "creation.campaign.memory"
    at:
      objective: "creation"
      entity: "campaign"
      metric: "memory"
    facets:
      runner:
        state: "open"
        notes: []
        refs: []
      metric:
        state: "open"
        notes: []
        refs: []
    notes: []
    refs: []
`;

function project() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "prove-it-test-"));
  fs.mkdirSync(path.join(root, ".prove-it"));
  fs.writeFileSync(path.join(root, ".prove-it/checkpoints.yaml"), validStore, "utf8");
  return root;
}

function run(root, args, expectedStatus = 0) {
  const result = spawnSync(process.execPath, [cli, ...args], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1" },
  });
  assert.equal(result.status, expectedStatus, `command ${args.join(" ")}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
  return result.stdout;
}

const root = project();
try {
  let output = run(root, ["check"]);
  assert.match(output, /store: "valid"/);
  assert.match(output, /total: 2/);
  assert.match(output, /open: 2/);

  output = run(root, []);
  assert.match(output, /story:/);
  assert.match(output, /id: "e2e-pilot"/);

  output = run(root, ["show", "creation.campaign.tti"]);
  assert.match(output, /checkpoint:/);
  assert.match(output, /state: "open"/);

  output = run(root, [
    "satisfy", "creation.campaign.tti", "runner",
    "--from", "open",
    "--note", "Browser execution exited successfully.",
  ]);
  assert.match(output, /after: "satisfied"/);
  assert.match(output, /checkpoint_state: "open"/);

  output = run(root, [
    "satisfy", "creation.campaign.tti", "metric",
    "--from", "open",
    "--note", "TTI is 842 ms and belongs to the submit action.",
    "--ref", ".agents/notes/results/tti.md",
    "--ref", ".agents/notes/results/tti.md",
  ]);
  assert.match(output, /checkpoint_state: "satisfied"/);
  const deduplicatedRefStore = fs.readFileSync(path.join(root, ".prove-it/checkpoints.yaml"), "utf8");
  assert.equal((deduplicatedRefStore.match(/\.agents\/notes\/results\/tti\.md/g) ?? []).length, 1);

  output = run(root, [
    "block", "creation.campaign.memory", "metric",
    "--from", "open",
    "--note", "GC precondition was not satisfied.",
    "--ref", "missing-but-allowed.md",
  ]);
  assert.match(output, /checkpoint_state: "blocked"/);

  output = run(root, [
    "find",
    "--state", "blocked",
    "--dimension", "metric=memory",
    "--facet-state", "metric=blocked",
    "--has-note",
    "--has-ref",
  ]);
  assert.match(output, /count: 1/);
  assert.match(output, /id: "creation.campaign.memory"/);
  assert.match(output, /missing-but-allowed\.md/);

  output = run(root, [
    "note", "creation.campaign.memory",
    "--text", "Business behavior is valid; metric collection remains blocked.",
    "--ref", ".unlazy/e2e/GATES.md#memory",
  ]);
  assert.match(output, /note_added: true/);
  assert.match(output, /refs_added: 1/);

  const storePath = path.join(root, ".prove-it/checkpoints.yaml");
  const beforeConflict = fs.readFileSync(storePath, "utf8");
  output = run(root, [
    "satisfy", "creation.campaign.memory", "metric",
    "--from", "open",
    "--note", "This stale update must fail.",
  ], 4);
  assert.match(output, /error: "state_conflict"/);
  assert.match(output, /actual: "blocked"/);
  assert.equal(fs.readFileSync(storePath, "utf8"), beforeConflict);

  output = run(root, [
    "not-applicable", "creation.campaign.memory", "runner",
    "--from", "open",
    "--note", "This metric is imported and has no local runner.",
  ]);
  assert.match(output, /after: "not_applicable"/);

  output = run(root, [
    "reopen", "creation.campaign.memory", "metric",
    "--from", "blocked",
    "--note", "A new GC-capable environment is available.",
  ]);
  assert.match(output, /after: "open"/);
  assert.match(output, /checkpoint_state: "open"/);

  const beforeBadOption = fs.readFileSync(storePath, "utf8");
  output = run(root, [
    "block", "creation.campaign.memory", "metric",
    "--from", "open",
    "--state", "blocked",
    "--note", "Unknown options must fail.",
  ], 2);
  assert.match(output, /error: "unknown_option"/);
  assert.equal(fs.readFileSync(storePath, "utf8"), beforeBadOption);

  const broken = beforeBadOption.replace('state: "open"', 'state: "complete"');
  fs.writeFileSync(storePath, broken, "utf8");
  const beforeInvalidMutation = fs.readFileSync(storePath, "utf8");
  output = run(root, ["check"], 3);
  assert.match(output, /error: "store_invalid"/);
  assert.match(output, /direct_edit_allowed: true/);
  output = run(root, [
    "block", "creation.campaign.memory", "metric",
    "--from", "open",
    "--note", "A broken Store must reject writes.",
  ], 3);
  assert.match(output, /error: "store_invalid"/);
  assert.equal(fs.readFileSync(storePath, "utf8"), beforeInvalidMutation);

  fs.writeFileSync(storePath, beforeBadOption, "utf8");
  output = run(root, ["check"]);
  assert.match(output, /store: "valid"/);

  const missingCheckpoint = validStore.replace(/  - id: "creation\.campaign\.memory"[\s\S]*$/, "");
  fs.writeFileSync(storePath, missingCheckpoint, "utf8");
  output = run(root, ["check"], 3);
  assert.match(output, /missing_cartesian_checkpoints/);
  assert.match(output, /creation\.campaign\.memory/);
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}

const missingRoot = fs.mkdtempSync(path.join(os.tmpdir(), "prove-it-missing-test-"));
try {
  let output = run(missingRoot, ["check"], 3);
  assert.match(output, /error: "store_not_found"/);
  output = run(missingRoot, [
    "block", "creation.campaign.tti", "metric",
    "--from", "open",
    "--note", "Missing Stores must fail without an internal error.",
  ], 3);
  assert.match(output, /error: "store_not_found"/);
} finally {
  fs.rmSync(missingRoot, { recursive: true, force: true });
}

console.log("PROVE_IT_CLI_TESTS_PASSED");
