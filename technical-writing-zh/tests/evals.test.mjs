import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const caseIds = ["material-workflow", "platform-upgrade", "oncall-process", "test-environment"];
const forbidden = [
  "bytedance",
  "larkoffice",
  "feishu",
  "飞书",
  "抖音",
  "直播",
  "boe",
  "ppe",
  "goofy",
  "rocket",
  "perflab",
  "ttam",
  "pagepass",
  "user-id",
  "doc-id",
  "http://",
  "https://",
];

async function readCase(id) {
  const dir = path.join(skillRoot, "evals/cases", id);
  const [facts, degraded, gold] = await Promise.all([
    readFile(path.join(dir, "facts.json"), "utf8").then(JSON.parse),
    readFile(path.join(dir, "degraded.md"), "utf8"),
    readFile(path.join(dir, "gold.md"), "utf8"),
  ]);
  return { facts, degraded, gold };
}

test("each quality case has facts, a degraded input, and a gold reference", async () => {
  for (const id of caseIds) {
    const { facts, degraded, gold } = await readCase(id);
    assert.equal(facts.id, id, `${id}: facts.id mismatch`);
    assert.ok(facts.category, `${id}: category missing`);
    assert.ok(facts.prompt, `${id}: prompt missing`);
    assert.ok(facts.protected_facts.length >= 5, `${id}: protected facts incomplete`);
    assert.ok(degraded.length > 0 && gold.length > 0, `${id}: empty fixture`);
    assert.ok(degraded.length >= gold.length * 1.3, `${id}: degradation is too weak`);
  }
});

test("quality cases cover the four writing categories", async () => {
  const categories = new Set();
  for (const id of caseIds) {
    const { facts } = await readCase(id);
    categories.add(facts.category);
  }
  assert.deepEqual(
    [...categories].sort(),
    ["architecture_proposal", "decision_material", "operation_guide", "operational_policy"],
  );
});

test("quality fixtures carry no project-specific provenance", async () => {
  for (const id of caseIds) {
    const { degraded, gold } = await readCase(id);
    for (const [label, content] of [["degraded", degraded], ["gold", gold]]) {
      const normalized = content.toLowerCase();
      for (const token of forbidden) {
        assert.ok(!normalized.includes(token), `${id} ${label} leaks token: ${token}`);
      }
    }
  }
});

test("trigger evals contain balanced positive and negative cases", async () => {
  const triggers = JSON.parse(
    await readFile(path.join(skillRoot, "evals/trigger-evals.json"), "utf8"),
  );
  const positive = triggers.filter((item) => item.should_trigger);
  const negative = triggers.filter((item) => !item.should_trigger);
  assert.equal(positive.length, negative.length);
});
