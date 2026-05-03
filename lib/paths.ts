import path from "node:path";
import os from "node:os";
import fs from "node:fs";

export function expandHome(input: string): string {
  if (input.startsWith("~")) {
    return path.join(os.homedir(), input.slice(1));
  }
  return input;
}

export function normalizeProjectPath(input: string): string {
  const expanded = expandHome(input);
  return path.resolve(path.normalize(expanded));
}

export function validateProjectPath(input: string): { valid: boolean; error?: string; normalized?: string } {
  try {
    const normalized = normalizeProjectPath(input);
    if (!fs.existsSync(normalized)) {
      return { valid: false, error: "El path no existe" };
    }
    if (!fs.statSync(normalized).isDirectory()) {
      return { valid: false, error: "No es un directorio" };
    }
    const openspecPath = path.join(normalized, "openspec");
    if (!fs.existsSync(openspecPath)) {
      return { valid: false, error: "No contiene una carpeta openspec/" };
    }
    return { valid: true, normalized };
  } catch (e) {
    return { valid: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export function ensureWithinOpenspec(projectPath: string, relativePath: string): string {
  const openspecRoot = path.resolve(projectPath, "openspec");
  const target = path.resolve(openspecRoot, relativePath);
  const rel = path.relative(openspecRoot, target);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error("Path traversal detectado");
  }
  return target;
}
