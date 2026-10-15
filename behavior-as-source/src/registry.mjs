import path from "node:path";

import { parseBehaviorDir } from "./parse.mjs";

export function loadRegistry(root = process.cwd()) {
  const absoluteRoot = path.resolve(root);
  return { root: absoluteRoot, files: parseBehaviorDir(absoluteRoot) };
}

export function findById(files, id) {
  return files.filter((file) => file.meta.id === id);
}

export function sortedRegistryRows(files) {
  return files
    .map((file) => ({
      id: file.meta.id,
      status: file.meta.status,
      owner: file.meta.owner,
      path: file.path,
      title: file.title,
    }))
    .sort((left, right) => String(left.id).localeCompare(String(right.id)));
}
