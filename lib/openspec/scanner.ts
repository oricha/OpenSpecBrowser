import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { parseTasks } from "./tasks";
import type { Change, OpenSpecData, Spec, SpecStatus, TaskGroup } from "./types";

async function listDirs(dir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }
}

async function readFileSafe(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}

function firstParagraph(markdown: string): string {
  const stripped = matter(markdown).content.trim();
  const blocks = stripped.split(/\n\s*\n/);
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("#")) continue;
    return trimmed.replace(/\n/g, " ");
  }
  return "";
}

async function loadChange(changeDir: string, slug: string, archived: boolean): Promise<Change> {
  const proposal = (await readFileSafe(path.join(changeDir, "proposal.md"))) ?? "";
  const tasksContent = (await readFileSafe(path.join(changeDir, "tasks.md"))) ?? "";
  const parsed = parseTasks(tasksContent);
  let modifiedAt: string | undefined;
  try {
    const stat = await fs.stat(path.join(changeDir, "tasks.md"));
    modifiedAt = stat.mtime.toISOString();
  } catch {
    modifiedAt = undefined;
  }
  const groups: TaskGroup[] = parsed.groups;
  return {
    slug,
    proposalSummary: firstParagraph(proposal).slice(0, 280),
    tasks: groups,
    tasksTotal: parsed.total,
    tasksDone: parsed.done,
    archived,
    modifiedAt,
  };
}

function inferSpecStatus(content: string): SpecStatus {
  const fm = matter(content).data as Record<string, unknown>;
  const status = String(fm.status ?? "").toLowerCase();
  if (status.includes("valid") || status.includes("approved") || status.includes("done")) return "VALIDADO";
  if (status.includes("review") || status.includes("revisi")) return "EN REVISIÓN";
  return "PENDIENTE";
}

export async function scanOpenspec(projectPath: string): Promise<OpenSpecData> {
  const openspecRoot = path.join(projectPath, "openspec");
  const changesRoot = path.join(openspecRoot, "changes");
  const archiveRoot = path.join(changesRoot, "archive");
  const specsRoot = path.join(openspecRoot, "specs");

  const activeSlugs = (await listDirs(changesRoot)).filter((d) => d !== "archive");
  const archivedSlugs = await listDirs(archiveRoot);

  const activeChanges = await Promise.all(
    activeSlugs.map((slug) => loadChange(path.join(changesRoot, slug), slug, false))
  );
  const archivedChanges = await Promise.all(
    archivedSlugs.map((slug) => loadChange(path.join(archiveRoot, slug), slug, true))
  );

  const specFeatures = await listDirs(specsRoot);
  const specs: Spec[] = await Promise.all(
    specFeatures.map(async (feature) => {
      const specPath = path.join(specsRoot, feature, "spec.md");
      const content = (await readFileSafe(specPath)) ?? "";
      return {
        feature,
        path: path.relative(openspecRoot, specPath),
        status: inferSpecStatus(content),
      };
    })
  );

  return { activeChanges, archivedChanges, specs };
}
