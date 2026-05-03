import fs from "node:fs/promises";
import lockfile from "proper-lockfile";
import type { Task, TaskGroup } from "./types";

const TASK_REGEX = /^(\s*)-\s*\[( |x|X)\]\s+(.+)$/;
const HEADING_REGEX = /^(#{1,6})\s+(.+)$/;

export interface ParsedTasks {
  groups: TaskGroup[];
  total: number;
  done: number;
}

export function parseTasks(content: string): ParsedTasks {
  const lines = content.split(/\r?\n/);
  const root: TaskGroup = { heading: "", level: 0, tasks: [], subgroups: [] };
  const stack: TaskGroup[] = [root];
  let total = 0;
  let done = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headingMatch = HEADING_REGEX.exec(line);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const heading = headingMatch[2].trim();
      while (stack.length > 1 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }
      const group: TaskGroup = { heading, level, tasks: [], subgroups: [] };
      stack[stack.length - 1].subgroups.push(group);
      stack.push(group);
      continue;
    }
    const taskMatch = TASK_REGEX.exec(line);
    if (taskMatch) {
      const isDone = taskMatch[2].toLowerCase() === "x";
      const task: Task = { text: taskMatch[3].trim(), done: isDone, line: i };
      stack[stack.length - 1].tasks.push(task);
      total++;
      if (isDone) done++;
    }
  }
  return { groups: root.subgroups.length > 0 ? root.subgroups : [root], total, done };
}

export async function readTasksFile(filePath: string): Promise<ParsedTasks> {
  const content = await fs.readFile(filePath, "utf-8");
  return parseTasks(content);
}

export async function toggleTaskInFile(
  filePath: string,
  expectedText: string,
  lineNumber: number,
  done: boolean
): Promise<{ ok: true } | { ok: false; reason: string; currentLine?: string }> {
  let release: (() => Promise<void>) | undefined;
  try {
    release = await lockfile.lock(filePath, { retries: 3, stale: 10000 });
    const content = await fs.readFile(filePath, "utf-8");
    const lines = content.split(/\r?\n/);
    const eol = content.includes("\r\n") ? "\r\n" : "\n";

    if (lineNumber < 0 || lineNumber >= lines.length) {
      return { ok: false, reason: "Línea fuera de rango" };
    }
    const original = lines[lineNumber];
    const match = TASK_REGEX.exec(original);
    if (!match) {
      return { ok: false, reason: "La línea no contiene un task", currentLine: original };
    }
    if (match[3].trim() !== expectedText.trim()) {
      return { ok: false, reason: "El texto del task no coincide (archivo cambió)", currentLine: original };
    }
    const indent = match[1];
    const newLine = `${indent}- [${done ? "x" : " "}] ${match[3]}`;
    lines[lineNumber] = newLine;
    await fs.writeFile(filePath, lines.join(eol), "utf-8");
    return { ok: true };
  } finally {
    if (release) {
      try { await release(); } catch { /* ignore */ }
    }
  }
}
