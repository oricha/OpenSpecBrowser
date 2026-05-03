import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { randomUUID } from "node:crypto";
import type { ProjectRecord } from "./openspec/types";

const CONFIG_DIR = path.join(os.homedir(), ".config", "openspec-dashboard");
const CONFIG_FILE = path.join(CONFIG_DIR, "projects.json");

async function ensureConfigDir(): Promise<void> {
  await fs.mkdir(CONFIG_DIR, { recursive: true });
}

export async function readProjects(): Promise<ProjectRecord[]> {
  await ensureConfigDir();
  try {
    const raw = await fs.readFile(CONFIG_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

export async function writeProjects(projects: ProjectRecord[]): Promise<void> {
  await ensureConfigDir();
  await fs.writeFile(CONFIG_FILE, JSON.stringify(projects, null, 2), "utf-8");
}

export async function addProject(input: { path: string; alias?: string; scanIntervalSeconds?: number }): Promise<ProjectRecord> {
  const projects = await readProjects();
  const existing = projects.find((p) => p.path === input.path);
  if (existing) return existing;
  const record: ProjectRecord = {
    id: randomUUID(),
    path: input.path,
    addedAt: new Date().toISOString(),
    alias: input.alias,
    scanIntervalSeconds: input.scanIntervalSeconds,
  };
  projects.push(record);
  await writeProjects(projects);
  return record;
}

export async function getProject(id: string): Promise<ProjectRecord | undefined> {
  const projects = await readProjects();
  return projects.find((p) => p.id === id);
}

export async function deleteProject(id: string): Promise<boolean> {
  const projects = await readProjects();
  const filtered = projects.filter((p) => p.id !== id);
  if (filtered.length === projects.length) return false;
  await writeProjects(filtered);
  return true;
}

export async function updateProject(id: string, patch: Partial<ProjectRecord>): Promise<ProjectRecord | undefined> {
  const projects = await readProjects();
  const idx = projects.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  projects[idx] = { ...projects[idx], ...patch, id: projects[idx].id };
  await writeProjects(projects);
  return projects[idx];
}
