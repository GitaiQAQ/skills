import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

test("progress reports keep delivery progress separate and refuse unmapped states", () => {
  const skill = read("SKILL.md");
  const template = read("templates/registry-report.md");
  const readme = read("README.md");

  assert.match(skill, /规格成熟度、交付进展和测试证据/);
  assert.match(skill, /分母版本、单位和完整状态映射/);
  assert.match(skill, /交付进展写为 `unknown`，且不输出完成百分比/);
  assert.match(skill, /通用 Skill 不复制或持久化消费项目的阶段事实/);
  assert.match(skill, /通用 Registry 报告只回答规格成熟度/);
  assert.match(template, /这是规格成熟度报告，不输出项目交付进展、场景通过率或项目完成百分比/);
  assert.match(readme, /状态未映射或口径缺失时，交付进展为 `unknown`，不输出完成百分比/);
});
