import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import lockfile from "proper-lockfile";
import { ensureWithinOpenspec } from "../paths";

const ALLOWED_EXTENSIONS = new Set([".md", ".yaml", ".yml"]);

export function sha256(content: string): string {
  return createHash("sha256").update(content, "utf-8").digest("hex");
}

export interface ReadFileResult {
  content: string;
  sha256: string;
  mtime: string;
  relativePath: string;
}

export async function readOpenspecFile(projectPath: string, relativePath: string): Promise<ReadFileResult> {
  const target = ensureWithinOpenspec(projectPath, relativePath);
  const ext = path.extname(target).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error(`Extensión no permitida: ${ext}`);
  }
  const content = await fs.readFile(target, "utf-8");
  const stat = await fs.stat(target);
  return {
    content,
    sha256: sha256(content),
    mtime: stat.mtime.toISOString(),
    relativePath,
  };
}

export interface WriteFileOutcome {
  ok: boolean;
  conflict?: boolean;
  current?: ReadFileResult;
  saved?: ReadFileResult;
  error?: string;
}

export async function writeOpenspecFile(
  projectPath: string,
  relativePath: string,
  newContent: string,
  baseSha256: string | undefined
): Promise<WriteFileOutcome> {
  const target = ensureWithinOpenspec(projectPath, relativePath);
  const ext = path.extname(target).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return { ok: false, error: `Extensión no permitida: ${ext}` };
  }
  let release: (() => Promise<void>) | undefined;
  try {
    release = await lockfile.lock(target, { retries: 3, stale: 10000 });
    const current = await fs.readFile(target, "utf-8");
    const currentHash = sha256(current);
    if (baseSha256 && baseSha256 !== currentHash) {
      const stat = await fs.stat(target);
      return {
        ok: false,
        conflict: true,
        current: {
          content: current,
          sha256: currentHash,
          mtime: stat.mtime.toISOString(),
          relativePath,
        },
      };
    }
    await fs.writeFile(target, newContent, "utf-8");
    const stat = await fs.stat(target);
    return {
      ok: true,
      saved: {
        content: newContent,
        sha256: sha256(newContent),
        mtime: stat.mtime.toISOString(),
        relativePath,
      },
    };
  } finally {
    if (release) {
      try { await release(); } catch { /* ignore */ }
    }
  }
}
