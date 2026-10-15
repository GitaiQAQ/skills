import fs from "node:fs";
import path from "node:path";

export function findRepositoryRoot(start = process.cwd()) {
  let current = path.resolve(start);
  if (!fs.existsSync(current)) current = path.dirname(current);
  if (fs.existsSync(current) && !fs.statSync(current).isDirectory()) current = path.dirname(current);
  while (true) {
    if (fs.existsSync(path.join(current, ".git"))) return current;
    const parent = path.dirname(current);
    if (parent === current) return path.resolve(start);
    current = parent;
  }
}

export function repositoryRelative(root, target) {
  return path.relative(path.resolve(root), path.resolve(target)).split(path.sep).join("/") || ".";
}

export function pathExists(root, value) {
  return typeof value === "string" && value !== "TODO" && fs.existsSync(path.resolve(root, value));
}
