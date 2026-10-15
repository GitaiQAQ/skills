import fs from "node:fs";
import path from "node:path";

import { repositoryRelative } from "./fs.mjs";
import { parseBehaviorDir, parseBehaviorFile } from "./parse.mjs";

function normalize(value) {
  return value.split(path.sep).join("/").replace(/^\.\//, "");
}

export function behaviorsForImplementation(files, sourcePath, root = process.cwd()) {
  const relative = normalize(path.isAbsolute(sourcePath) ? repositoryRelative(root, sourcePath) : sourcePath);
  return files.filter((file) =>
    (Array.isArray(file.meta.implementation) ? file.meta.implementation : []).some(
      (implementation) => normalize(implementation) === relative,
    ),
  );
}

export function behaviorDetails(file) {
  return {
    id: file.meta.id,
    path: file.path,
    implementation: file.meta.implementation,
    driver: file.meta.driver,
    oracle: file.meta.oracle,
    evidence_run_id: file.meta.evidence?.run_id,
  };
}

export function parseRegistryForImpact(root = process.cwd(), sourcePath) {
  const absoluteRoot = path.resolve(root);
  if (!sourcePath) return parseBehaviorDir(absoluteRoot);

  const localPaths = [];
  let directory = path.dirname(path.resolve(absoluteRoot, sourcePath));
  while (directory === absoluteRoot || directory.startsWith(`${absoluteRoot}${path.sep}`)) {
    if (fs.existsSync(directory)) {
      for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        if (entry.isFile() && entry.name.endsWith(".behavior.md")) {
          localPaths.push(path.join(directory, entry.name));
        }
      }
    }
    if (directory === absoluteRoot) break;
    directory = path.dirname(directory);
  }

  const seen = new Set(localPaths.map((filePath) => path.resolve(filePath)));
  const local = [...seen].sort().map((filePath) => parseBehaviorFile(filePath, absoluteRoot));
  const remaining = parseBehaviorDir(absoluteRoot).filter((file) => !seen.has(file.path));
  return [...local, ...remaining];
}
