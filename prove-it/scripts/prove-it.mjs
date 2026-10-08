#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const STORE_RELATIVE_PATH = path.join(".prove-it", "checkpoints.yaml");
const SCHEMA = "prove-it/v1";
const STATES = new Set(["open", "satisfied", "blocked", "not_applicable"]);
const ID_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;
const HEADER = `# Managed by prove-it.
# Normal operation: use the CLI; do not read or edit this file directly.
# Repair mode: direct inspection and minimal edits are allowed only after
# \`prove-it check\` reports store_invalid.
`;

class ProveItError extends Error {
  constructor(code, details = {}, exitCode = 2) {
    super(code);
    this.code = code;
    this.details = details;
    this.exitCode = exitCode;
  }
}

function scalarFromYaml(raw, line) {
  const value = raw.trim();
  if (value === "[]") return [];
  if (value === "{}") return {};
  if (value === "null" || value === "~") return null;
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value)) return Number(value);
  if (value.startsWith('"')) {
    try {
      return JSON.parse(value);
    } catch {
      throw new ProveItError("yaml_parse_error", { line, problem: "invalid_double_quoted_string" }, 3);
    }
  }
  if (value.startsWith("'")) {
    if (!value.endsWith("'") || value.length < 2) {
      throw new ProveItError("yaml_parse_error", { line, problem: "invalid_single_quoted_string" }, 3);
    }
    return value.slice(1, -1).replace(/''/g, "'");
  }
  if (value.startsWith("[") || value.startsWith("{")) {
    try {
      return JSON.parse(value);
    } catch {
      throw new ProveItError("yaml_parse_error", {
        line,
        problem: "inline_collections_must_use_json_quoted_strings",
      }, 3);
    }
  }
  if (/^[&*!]/.test(value)) {
    throw new ProveItError("yaml_parse_error", { line, problem: "yaml_anchors_aliases_and_tags_are_not_supported" }, 3);
  }
  return value;
}

function mapEntry(content, line) {
  const match = /^([A-Za-z0-9_-]+):(?:\s*(.*))?$/.exec(content);
  if (!match) {
    throw new ProveItError("yaml_parse_error", { line, problem: "expected_mapping_entry" }, 3);
  }
  return { key: match[1], rawValue: match[2] ?? "" };
}

function parseYaml(text) {
  if (text.includes("\t")) {
    throw new ProveItError("yaml_parse_error", { problem: "tabs_are_not_allowed" }, 3);
  }
  const tokens = [];
  for (const [offset, rawLine] of text.replace(/\r\n/g, "\n").split("\n").entries()) {
    if (!rawLine.trim() || rawLine.trimStart().startsWith("#")) continue;
    const indent = rawLine.length - rawLine.trimStart().length;
    if (indent % 2 !== 0) {
      throw new ProveItError("yaml_parse_error", { line: offset + 1, problem: "indentation_must_use_two_spaces" }, 3);
    }
    const content = rawLine.slice(indent);
    if (content === "---" || content === "...") {
      throw new ProveItError("yaml_parse_error", { line: offset + 1, problem: "multi_document_yaml_is_not_supported" }, 3);
    }
    tokens.push({ indent, content, line: offset + 1 });
  }
  if (tokens.length === 0) {
    throw new ProveItError("yaml_parse_error", { problem: "empty_document" }, 3);
  }

  function parseBlock(index, indent) {
    const token = tokens[index];
    if (!token || token.indent !== indent) {
      throw new ProveItError("yaml_parse_error", {
        line: token?.line,
        problem: "unexpected_indentation",
      }, 3);
    }
    return token.content === "-" || token.content.startsWith("- ")
      ? parseSequence(index, indent)
      : parseMapping(index, indent);
  }

  function assignEntry(target, entry, index, indent) {
    if (Object.hasOwn(target, entry.key)) {
      throw new ProveItError("yaml_parse_error", {
        line: tokens[index].line,
        problem: "duplicate_mapping_key",
        key: entry.key,
      }, 3);
    }
    if (entry.rawValue !== "") {
      target[entry.key] = scalarFromYaml(entry.rawValue, tokens[index].line);
      return index + 1;
    }
    const next = tokens[index + 1];
    if (!next || next.indent <= indent) {
      throw new ProveItError("yaml_parse_error", {
        line: tokens[index].line,
        problem: "missing_nested_value",
        key: entry.key,
      }, 3);
    }
    if (next.indent !== indent + 2) {
      throw new ProveItError("yaml_parse_error", {
        line: next.line,
        problem: "nested_value_must_indent_two_spaces",
      }, 3);
    }
    const parsed = parseBlock(index + 1, indent + 2);
    target[entry.key] = parsed.value;
    return parsed.index;
  }

  function parseMapping(index, indent) {
    const result = {};
    while (index < tokens.length && tokens[index].indent === indent) {
      if (tokens[index].content === "-" || tokens[index].content.startsWith("- ")) break;
      const entry = mapEntry(tokens[index].content, tokens[index].line);
      index = assignEntry(result, entry, index, indent);
    }
    return { value: result, index };
  }

  function parseSequence(index, indent) {
    const result = [];
    while (index < tokens.length && tokens[index].indent === indent) {
      const token = tokens[index];
      if (!(token.content === "-" || token.content.startsWith("- "))) break;
      const itemText = token.content === "-" ? "" : token.content.slice(2);
      if (itemText === "") {
        const next = tokens[index + 1];
        if (!next || next.indent !== indent + 2) {
          throw new ProveItError("yaml_parse_error", { line: token.line, problem: "missing_sequence_value" }, 3);
        }
        const parsed = parseBlock(index + 1, indent + 2);
        result.push(parsed.value);
        index = parsed.index;
        continue;
      }
      if (/^[A-Za-z0-9_-]+:/.test(itemText)) {
        const item = {};
        const first = mapEntry(itemText, token.line);
        index = assignEntry(item, first, index, indent + 2);
        while (index < tokens.length && tokens[index].indent === indent + 2 && !tokens[index].content.startsWith("-")) {
          const entry = mapEntry(tokens[index].content, tokens[index].line);
          index = assignEntry(item, entry, index, indent + 2);
        }
        result.push(item);
        continue;
      }
      result.push(scalarFromYaml(itemText, token.line));
      index += 1;
    }
    return { value: result, index };
  }

  const parsed = parseBlock(0, tokens[0].indent);
  if (tokens[0].indent !== 0 || parsed.index !== tokens.length) {
    const token = tokens[parsed.index] ?? tokens[0];
    throw new ProveItError("yaml_parse_error", { line: token.line, problem: "unexpected_trailing_content" }, 3);
  }
  return parsed.value;
}

function yamlScalar(value) {
  if (value === null) return "null";
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  return JSON.stringify(String(value));
}

function writeYamlLines(value, indent = 0) {
  const prefix = " ".repeat(indent);
  if (Array.isArray(value)) {
    if (value.length === 0) return [`${prefix}[]`];
    const lines = [];
    for (const item of value) {
      if (item !== null && typeof item === "object") {
        lines.push(`${prefix}-`);
        lines.push(...writeYamlLines(item, indent + 2));
      } else {
        lines.push(`${prefix}- ${yamlScalar(item)}`);
      }
    }
    return lines;
  }
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length === 0) return [`${prefix}{}`];
    const lines = [];
    for (const [key, child] of entries) {
      if (Array.isArray(child) && child.length === 0) {
        lines.push(`${prefix}${key}: []`);
      } else if (child !== null && typeof child === "object" && Object.keys(child).length === 0) {
        lines.push(`${prefix}${key}: {}`);
      } else if (child !== null && typeof child === "object") {
        lines.push(`${prefix}${key}:`);
        lines.push(...writeYamlLines(child, indent + 2));
      } else {
        lines.push(`${prefix}${key}: ${yamlScalar(child)}`);
      }
    }
    return lines;
  }
  return [`${prefix}${yamlScalar(value)}`];
}

function stringifyYaml(value, withHeader = false) {
  return `${withHeader ? HEADER : ""}${writeYamlLines(value).join("\n")}\n`;
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateStore(store) {
  const issues = [];
  const issue = (pathName, problem, details = {}) => issues.push({ path: pathName, problem, ...details });
  const exactKeys = (value, allowed, required, pathName) => {
    if (!isObject(value)) {
      issue(pathName, "expected_mapping");
      return false;
    }
    for (const key of Object.keys(value)) {
      if (!allowed.includes(key)) issue(`${pathName}.${key}`, "unknown_field");
    }
    for (const key of required) {
      if (!Object.hasOwn(value, key)) issue(`${pathName}.${key}`, "missing_field");
    }
    return true;
  };
  const stringList = (value, pathName) => {
    if (!Array.isArray(value)) {
      issue(pathName, "expected_string_array");
      return;
    }
    value.forEach((entry, index) => {
      if (typeof entry !== "string" || !entry.trim()) issue(`${pathName}[${index}]`, "expected_non_empty_string");
    });
  };
  const validId = (value, pathName) => {
    if (typeof value !== "string" || !ID_PATTERN.test(value)) issue(pathName, "invalid_id");
  };

  if (!exactKeys(store, ["schema", "story", "dimensions", "facets", "checkpoints"], ["schema", "story", "dimensions", "facets", "checkpoints"], "$")) {
    return issues;
  }
  if (store.schema !== SCHEMA) issue("schema", "unsupported_schema", { expected: SCHEMA, actual: store.schema });

  if (exactKeys(store.story, ["id", "goal", "refs"], ["id", "goal"], "story")) {
    validId(store.story.id, "story.id");
    if (typeof store.story.goal !== "string" || !store.story.goal.trim()) issue("story.goal", "expected_non_empty_string");
    if (Object.hasOwn(store.story, "refs")) stringList(store.story.refs, "story.refs");
  }

  const dimensionNames = [];
  const dimensionValues = new Map();
  if (!isObject(store.dimensions) || Object.keys(store.dimensions).length === 0) {
    issue("dimensions", "expected_non_empty_mapping");
  } else {
    for (const [name, values] of Object.entries(store.dimensions)) {
      validId(name, `dimensions.${name}`);
      dimensionNames.push(name);
      if (!Array.isArray(values) || values.length === 0) {
        issue(`dimensions.${name}`, "expected_non_empty_id_array");
        continue;
      }
      const seen = new Set();
      for (const [index, value] of values.entries()) {
        validId(value, `dimensions.${name}[${index}]`);
        if (seen.has(value)) issue(`dimensions.${name}[${index}]`, "duplicate_dimension_value", { value });
        seen.add(value);
      }
      dimensionValues.set(name, values);
    }
  }

  const facetNames = [];
  if (!isObject(store.facets) || Object.keys(store.facets).length === 0) {
    issue("facets", "expected_non_empty_mapping");
  } else {
    for (const [name, description] of Object.entries(store.facets)) {
      validId(name, `facets.${name}`);
      facetNames.push(name);
      if (typeof description !== "string" || !description.trim()) issue(`facets.${name}`, "expected_non_empty_string");
    }
  }

  const actual = new Map();
  if (!Array.isArray(store.checkpoints)) {
    issue("checkpoints", "expected_array");
  } else {
    for (const [index, checkpoint] of store.checkpoints.entries()) {
      const base = `checkpoints[${index}]`;
      if (!exactKeys(checkpoint, ["id", "at", "facets", "notes", "refs"], ["id", "at", "facets", "notes", "refs"], base)) continue;
      if (typeof checkpoint.id !== "string" || !checkpoint.id.trim()) issue(`${base}.id`, "expected_non_empty_string");
      if (actual.has(checkpoint.id)) issue(`${base}.id`, "duplicate_checkpoint_id", { id: checkpoint.id });
      actual.set(checkpoint.id, checkpoint);

      if (exactKeys(checkpoint.at, dimensionNames, dimensionNames, `${base}.at`)) {
        const coordinate = [];
        for (const name of dimensionNames) {
          const value = checkpoint.at[name];
          coordinate.push(value);
          if (!dimensionValues.get(name)?.includes(value)) issue(`${base}.at.${name}`, "unknown_dimension_value", { value });
        }
        const expectedId = coordinate.join(".");
        if (checkpoint.id !== expectedId) issue(`${base}.id`, "checkpoint_id_does_not_match_coordinates", { expected: expectedId, actual: checkpoint.id });
      }

      if (exactKeys(checkpoint.facets, facetNames, facetNames, `${base}.facets`)) {
        for (const facetName of facetNames) {
          const facet = checkpoint.facets[facetName];
          const facetPath = `${base}.facets.${facetName}`;
          if (!exactKeys(facet, ["state", "notes", "refs"], ["state", "notes", "refs"], facetPath)) continue;
          if (!STATES.has(facet.state)) issue(`${facetPath}.state`, "invalid_state", { actual: facet.state, allowed: [...STATES] });
          stringList(facet.notes, `${facetPath}.notes`);
          stringList(facet.refs, `${facetPath}.refs`);
        }
      }
      stringList(checkpoint.notes, `${base}.notes`);
      stringList(checkpoint.refs, `${base}.refs`);
    }
  }

  if (dimensionNames.length > 0 && [...dimensionValues.values()].every((values) => Array.isArray(values) && values.length > 0)) {
    const expected = [];
    const visit = (depth, values) => {
      if (depth === dimensionNames.length) {
        expected.push(values.join("."));
        return;
      }
      for (const value of dimensionValues.get(dimensionNames[depth])) visit(depth + 1, [...values, value]);
    };
    visit(0, []);
    const expectedSet = new Set(expected);
    const missing = expected.filter((id) => !actual.has(id));
    const foreign = [...actual.keys()].filter((id) => !expectedSet.has(id));
    if (missing.length) issue("checkpoints", "missing_cartesian_checkpoints", { ids: missing });
    if (foreign.length) issue("checkpoints", "foreign_checkpoints", { ids: foreign });
  }
  return issues;
}

function derivedState(checkpoint) {
  const states = Object.values(checkpoint.facets).map((facet) => facet.state);
  if (states.includes("blocked")) return "blocked";
  if (states.includes("open")) return "open";
  if (states.every((state) => state === "not_applicable")) return "not_applicable";
  return "satisfied";
}

function summary(store) {
  const counts = { total: store.checkpoints.length, satisfied: 0, open: 0, blocked: 0, not_applicable: 0 };
  for (const checkpoint of store.checkpoints) counts[derivedState(checkpoint)] += 1;
  return counts;
}

function storePaths() {
  const root = process.cwd();
  const directory = path.join(root, ".prove-it");
  const file = path.join(root, STORE_RELATIVE_PATH);
  return { root, directory, file };
}

function checkedStoreDirectory(directory) {
  let directoryStat;
  try {
    directoryStat = fs.lstatSync(directory);
  } catch (error) {
    if (error.code === "ENOENT") throw new ProveItError("store_not_found", { path: STORE_RELATIVE_PATH }, 3);
    throw error;
  }
  if (directoryStat.isSymbolicLink() || !directoryStat.isDirectory()) {
    throw new ProveItError("store_invalid", {
      path: STORE_RELATIVE_PATH,
      issues: [{ path: ".prove-it", problem: "store_directory_must_be_a_non_symlink_directory" }],
      repair: { direct_edit_allowed: true, rerun: "prove-it check" },
    }, 3);
  }
}

function checkedRegularFile(file, label) {
  let stat;
  try {
    stat = fs.lstatSync(file);
  } catch (error) {
    if (error.code === "ENOENT") throw new ProveItError("store_not_found", { path: STORE_RELATIVE_PATH }, 3);
    throw error;
  }
  if (stat.isSymbolicLink() || !stat.isFile()) {
    throw new ProveItError("store_invalid", {
      path: STORE_RELATIVE_PATH,
      issues: [{ path: label, problem: "store_must_be_a_regular_non_symlink_file" }],
      repair: { direct_edit_allowed: true, rerun: "prove-it check" },
    }, 3);
  }
}

function readStore() {
  const { directory, file } = storePaths();
  checkedStoreDirectory(directory);
  checkedRegularFile(file, STORE_RELATIVE_PATH);
  let store;
  try {
    store = parseYaml(fs.readFileSync(file, "utf8"));
  } catch (error) {
    if (error instanceof ProveItError) {
      throw new ProveItError("store_invalid", {
        path: STORE_RELATIVE_PATH,
        issues: [{ path: "$", problem: error.code, ...error.details }],
        repair: { direct_edit_allowed: true, rerun: "prove-it check" },
      }, 3);
    }
    throw error;
  }
  const issues = validateStore(store);
  if (issues.length) {
    throw new ProveItError("store_invalid", {
      path: STORE_RELATIVE_PATH,
      issues,
      repair: { direct_edit_allowed: true, rerun: "prove-it check" },
    }, 3);
  }
  return { store, file, directory };
}

function withStoreLock(operation) {
  const { directory } = storePaths();
  checkedStoreDirectory(directory);
  const lockPath = path.join(directory, ".write.lock");
  let lock;
  try {
    lock = fs.openSync(lockPath, "wx", 0o600);
    fs.writeFileSync(lock, `${process.pid}\n`, "utf8");
  } catch (error) {
    if (error.code === "EEXIST") throw new ProveItError("store_busy", { changed: false }, 4);
    throw error;
  }
  try {
    return operation();
  } finally {
    try { if (lock !== undefined) fs.closeSync(lock); } catch {}
    try { fs.unlinkSync(lockPath); } catch {}
  }
}

function atomicWriteStore(file, store) {
  const directory = path.dirname(file);
  const temporary = path.join(directory, `.checkpoints.${process.pid}.${Date.now()}.tmp`);
  let descriptor;
  try {
    descriptor = fs.openSync(temporary, "wx", 0o600);
    fs.writeFileSync(descriptor, stringifyYaml(store, true), "utf8");
    fs.fsyncSync(descriptor);
    fs.closeSync(descriptor);
    descriptor = undefined;
    checkedRegularFile(file, STORE_RELATIVE_PATH);
    fs.renameSync(temporary, file);
  } finally {
    try { if (descriptor !== undefined) fs.closeSync(descriptor); } catch {}
    try { fs.unlinkSync(temporary); } catch {}
  }
}

function emit(value) {
  process.stdout.write(stringifyYaml(value));
}

function checkpointById(store, id) {
  const checkpoint = store.checkpoints.find((candidate) => candidate.id === id);
  if (checkpoint) return checkpoint;
  const candidates = store.checkpoints
    .map((candidate) => candidate.id)
    .filter((candidate) => candidate.includes(id) || id.includes(candidate.split(".")[0]))
    .slice(0, 5);
  throw new ProveItError("checkpoint_not_found", { checkpoint: id, changed: false, ...(candidates.length ? { candidates } : {}) }, 2);
}

function facetById(checkpoint, facetName) {
  if (Object.hasOwn(checkpoint.facets, facetName)) return checkpoint.facets[facetName];
  throw new ProveItError("facet_not_found", {
    checkpoint: checkpoint.id,
    facet: facetName,
    changed: false,
    candidates: Object.keys(checkpoint.facets),
  }, 2);
}

function parseOptions(args, specs) {
  const result = {};
  for (const [name, spec] of Object.entries(specs)) result[name] = spec.repeatable ? [] : spec.boolean ? false : undefined;
  for (let index = 0; index < args.length; index += 1) {
    const option = args[index];
    const spec = specs[option];
    if (!spec) throw new ProveItError("unknown_option", { option, changed: false }, 2);
    if (spec.boolean) {
      if (result[option]) throw new ProveItError("duplicate_option", { option, changed: false }, 2);
      result[option] = true;
      continue;
    }
    const value = args[index + 1];
    if (value === undefined || value.startsWith("--")) throw new ProveItError("missing_option_value", { option, changed: false }, 2);
    index += 1;
    if (!value.trim()) throw new ProveItError("empty_option_value", { option, changed: false }, 2);
    if (spec.repeatable) result[option].push(value);
    else {
      if (result[option] !== undefined) throw new ProveItError("duplicate_option", { option, changed: false }, 2);
      result[option] = value;
    }
  }
  return result;
}

function requireOption(options, option) {
  if (options[option] === undefined) throw new ProveItError("missing_required_option", { option, changed: false }, 2);
  return options[option];
}

function addUnique(target, values) {
  const known = new Set(target);
  for (const value of values) {
    if (!known.has(value)) {
      target.push(value);
      known.add(value);
    }
  }
}

function mutationCommand(command, args) {
  if (args.length < 2) throw new ProveItError("usage_error", { usage: `prove-it ${command} <checkpoint> <facet> --from <state> --note <text> [--ref <location>]...`, changed: false }, 2);
  const [checkpointId, facetName, ...optionArgs] = args;
  const options = parseOptions(optionArgs, {
    "--from": {},
    "--note": {},
    "--ref": { repeatable: true },
  });
  const from = requireOption(options, "--from");
  const note = requireOption(options, "--note");
  if (!STATES.has(from)) throw new ProveItError("invalid_state", { option: "--from", actual: from, allowed: [...STATES], changed: false }, 2);
  if (!note.trim()) throw new ProveItError("empty_option_value", { option: "--note", changed: false }, 2);
  const targetState = {
    satisfy: "satisfied",
    block: "blocked",
    "not-applicable": "not_applicable",
    reopen: "open",
  }[command];

  return withStoreLock(() => {
    const { store, file } = readStore();
    const checkpoint = checkpointById(store, checkpointId);
    const facet = facetById(checkpoint, facetName);
    if (facet.state !== from) {
      throw new ProveItError("state_conflict", {
        checkpoint: checkpointId,
        facet: facetName,
        expected: from,
        actual: facet.state,
        changed: false,
        hint: "Run `prove-it show <checkpoint>` and reconsider the update.",
      }, 4);
    }
    if (facet.state === targetState) throw new ProveItError("state_unchanged", { checkpoint: checkpointId, facet: facetName, state: targetState, changed: false }, 2);
    const before = facet.state;
    facet.state = targetState;
    facet.notes.push(note);
    addUnique(facet.refs, options["--ref"]);
    const issues = validateStore(store);
    if (issues.length) throw new ProveItError("store_invalid", { path: STORE_RELATIVE_PATH, issues, changed: false }, 3);
    atomicWriteStore(file, store);
    return {
      ok: true,
      checkpoint: checkpointId,
      facet: facetName,
      before,
      after: targetState,
      checkpoint_state: derivedState(checkpoint),
    };
  });
}

function noteCommand(args) {
  if (args.length < 1) throw new ProveItError("usage_error", { usage: "prove-it note <checkpoint> [facet] [--text <text>] [--ref <location>]...", changed: false }, 2);
  const checkpointId = args[0];
  let index = 1;
  let facetName;
  if (args[index] && !args[index].startsWith("--")) {
    facetName = args[index];
    index += 1;
  }
  const options = parseOptions(args.slice(index), {
    "--text": {},
    "--ref": { repeatable: true },
  });
  const textValue = options["--text"];
  const refs = options["--ref"];
  if (textValue === undefined && refs.length === 0) {
    throw new ProveItError("missing_annotation", { required: ["--text", "--ref"], changed: false }, 2);
  }
  return withStoreLock(() => {
    const { store, file } = readStore();
    const checkpoint = checkpointById(store, checkpointId);
    const target = facetName ? facetById(checkpoint, facetName) : checkpoint;
    if (textValue !== undefined) target.notes.push(textValue);
    addUnique(target.refs, refs);
    const issues = validateStore(store);
    if (issues.length) throw new ProveItError("store_invalid", { path: STORE_RELATIVE_PATH, issues, changed: false }, 3);
    atomicWriteStore(file, store);
    return {
      ok: true,
      checkpoint: checkpointId,
      ...(facetName ? { facet: facetName } : {}),
      note_added: textValue !== undefined,
      refs_added: refs.length,
      checkpoint_state: derivedState(checkpoint),
    };
  });
}

function showCommand(args) {
  if (args.length !== 1) throw new ProveItError("usage_error", { usage: "prove-it show <checkpoint>" }, 2);
  const { store } = readStore();
  const checkpoint = checkpointById(store, args[0]);
  return { ok: true, story: store.story.id, checkpoint: { ...checkpoint, state: derivedState(checkpoint) } };
}

function splitPair(value, option) {
  const position = value.indexOf("=");
  if (position <= 0 || position === value.length - 1) throw new ProveItError("invalid_option_value", { option, actual: value, expected: "name=value" }, 2);
  return [value.slice(0, position), value.slice(position + 1)];
}

function findCommand(args) {
  const options = parseOptions(args, {
    "--state": {},
    "--dimension": { repeatable: true },
    "--facet-state": { repeatable: true },
    "--has-note": { boolean: true },
    "--has-ref": { boolean: true },
  });
  const { store } = readStore();
  if (options["--state"] !== undefined && !STATES.has(options["--state"])) {
    throw new ProveItError("invalid_state", { option: "--state", actual: options["--state"], allowed: [...STATES] }, 2);
  }
  const dimensionFilters = options["--dimension"].map((value) => splitPair(value, "--dimension"));
  for (const [name, value] of dimensionFilters) {
    if (!Object.hasOwn(store.dimensions, name)) throw new ProveItError("dimension_not_found", { dimension: name, candidates: Object.keys(store.dimensions) }, 2);
    if (!store.dimensions[name].includes(value)) throw new ProveItError("dimension_value_not_found", { dimension: name, value, candidates: store.dimensions[name] }, 2);
  }
  const facetFilters = options["--facet-state"].map((value) => splitPair(value, "--facet-state"));
  for (const [name, state] of facetFilters) {
    if (!Object.hasOwn(store.facets, name)) throw new ProveItError("facet_not_found", { facet: name, candidates: Object.keys(store.facets) }, 2);
    if (!STATES.has(state)) throw new ProveItError("invalid_state", { option: "--facet-state", actual: state, allowed: [...STATES] }, 2);
  }

  const matches = store.checkpoints.filter((checkpoint) => {
    if (options["--state"] !== undefined && derivedState(checkpoint) !== options["--state"]) return false;
    if (dimensionFilters.some(([name, value]) => checkpoint.at[name] !== value)) return false;
    if (facetFilters.some(([name, state]) => checkpoint.facets[name].state !== state)) return false;
    if (options["--has-note"] && checkpoint.notes.length === 0 && Object.values(checkpoint.facets).every((facet) => facet.notes.length === 0)) return false;
    if (options["--has-ref"] && checkpoint.refs.length === 0 && Object.values(checkpoint.facets).every((facet) => facet.refs.length === 0)) return false;
    return true;
  }).map((checkpoint) => ({
    id: checkpoint.id,
    state: derivedState(checkpoint),
    at: checkpoint.at,
    facets: Object.fromEntries(Object.entries(checkpoint.facets).map(([name, facet]) => [name, facet])),
    notes: checkpoint.notes,
    refs: checkpoint.refs,
  }));
  return { ok: true, count: matches.length, matches };
}

function help() {
  return `Usage:
  prove-it
  prove-it check
  prove-it show <checkpoint>
  prove-it find [--state <state>] [--dimension <name=value>]... [--facet-state <facet=state>] [--has-note] [--has-ref]
  prove-it satisfy <checkpoint> <facet> --from <state> --note <text> [--ref <location>]...
  prove-it block <checkpoint> <facet> --from <state> --note <text> [--ref <location>]...
  prove-it not-applicable <checkpoint> <facet> --from <state> --note <text> [--ref <location>]...
  prove-it reopen <checkpoint> <facet> --from <state> --note <text> [--ref <location>]...
  prove-it note <checkpoint> [facet] [--text <text>] [--ref <location>]...
`;
}

function main(argv) {
  if (argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write(help());
    return;
  }
  const [command, ...args] = argv;
  let output;
  if (command === undefined) {
    const { store } = readStore();
    output = { ok: true, story: store.story, checkpoints: summary(store) };
  } else if (command === "check") {
    if (args.length) throw new ProveItError("usage_error", { usage: "prove-it check" }, 2);
    const { store } = readStore();
    output = { ok: true, store: "valid", story: store.story.id, checkpoints: summary(store) };
  } else if (command === "show") output = showCommand(args);
  else if (command === "find") output = findCommand(args);
  else if (["satisfy", "block", "not-applicable", "reopen"].includes(command)) output = mutationCommand(command, args);
  else if (command === "note") output = noteCommand(args);
  else throw new ProveItError("unknown_command", { command, hint: "Run `prove-it --help`." }, 2);
  emit(output);
}

try {
  main(process.argv.slice(2));
} catch (error) {
  if (error instanceof ProveItError) {
    emit({ ok: false, error: error.code, ...error.details });
    process.exitCode = error.exitCode;
  } else {
    emit({ ok: false, error: "internal_error", message: error instanceof Error ? error.message : String(error), changed: false });
    process.exitCode = 1;
  }
}
