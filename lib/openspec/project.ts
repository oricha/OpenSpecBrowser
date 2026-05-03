import path from "node:path";
import { getProject, updateProject } from "../store";
import { readGitInfo } from "../git";
import { scanOpenspec } from "./scanner";
import type { Project } from "./types";

export async function loadProject(id: string): Promise<Project | null> {
  const record = await getProject(id);
  if (!record) return null;
  const [git, openspec] = await Promise.all([
    readGitInfo(record.path),
    scanOpenspec(record.path),
  ]);

  const tasksTotal = openspec.activeChanges.reduce((acc, c) => acc + c.tasksTotal, 0);
  const tasksDone = openspec.activeChanges.reduce((acc, c) => acc + c.tasksDone, 0);
  const percentage = tasksTotal === 0 ? 0 : Math.round((tasksDone / tasksTotal) * 100);

  await updateProject(id, { lastScanned: new Date().toISOString() });

  return {
    id: record.id,
    path: record.path,
    name: record.alias ?? path.basename(record.path),
    alias: record.alias,
    addedAt: record.addedAt,
    lastScanned: new Date().toISOString(),
    git,
    openspec,
    progress: {
      tasksTotal,
      tasksDone,
      percentage,
      activeChanges: openspec.activeChanges.length,
    },
  };
}
