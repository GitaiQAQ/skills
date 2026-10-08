#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skill = fs.readFileSync(path.join(root, "SKILL.md"), "utf8");
const store = fs.readFileSync(path.join(root, "references/store.md"), "utf8");
const cli = fs.readFileSync(path.join(root, "scripts/prove-it.mjs"), "utf8");
const metadata = fs.readFileSync(path.join(root, "agents/openai.yaml"), "utf8");

for (const content of [skill, store, cli, metadata]) {
  assert.doesNotMatch(content, /\[TODO|TODO:/);
}

assert.match(skill, /do not read, search, or edit `\.prove-it\/checkpoints\.yaml` directly/i);
assert.match(skill, /Only then may you read `\.prove-it\/checkpoints\.yaml`/);
assert.match(skill, /\*\*Refs\*\* are optional breadcrumbs/i);
assert.match(skill, /does not choose the next Checkpoint/i);
assert.match(skill, /domain's canonical Facts, Ledger, test oracle, or business result/i);
assert.match(skill, /prove-it satisfy <checkpoint> <facet>/);
assert.match(skill, /prove-it block <checkpoint> <facet>/);
assert.match(skill, /prove-it not-applicable <checkpoint> <facet>/);
assert.match(skill, /prove-it reopen <checkpoint> <facet>/);
assert.match(skill, /prove-it note <checkpoint>/);

assert.match(store, /The Checkpoint list is exactly the Cartesian product/);
assert.match(store, /Refs are not resolved or checked for existence/);
assert.match(store, /direct inspection and minimal edits are allowed only after/);
assert.match(cli, /const STORE_RELATIVE_PATH = path\.join\("\.prove-it", "checkpoints\.yaml"\)/);
assert.match(metadata, /default_prompt: "Use \$prove-it/);

console.log("PROVE_IT_SKILL_CONTRACT_PASSED");
