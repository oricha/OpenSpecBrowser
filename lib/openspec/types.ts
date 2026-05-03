export interface ProjectRecord {
  id: string;
  path: string;
  addedAt: string;
  alias?: string;
  scanIntervalSeconds?: number;
  lastScanned?: string;
}

export interface CommitInfo {
  hash: string;
  message: string;
  author: string | { name: string; email?: string };
  date: string;
}

export interface GitInfo {
  remoteUrl: string | null;
  githubUrl: string | null;
  branch: string | null;
  lastCommits: CommitInfo[];
}

export interface Task {
  text: string;
  done: boolean;
  line: number;
}

export interface TaskGroup {
  heading: string;
  level: number;
  tasks: Task[];
  subgroups: TaskGroup[];
}

export interface Change {
  slug: string;
  proposalSummary: string;
  tasks: TaskGroup[];
  tasksTotal: number;
  tasksDone: number;
  archived: boolean;
  modifiedAt?: string;
  modifiedBy?: string;
}

export type SpecStatus = "VALIDADO" | "EN REVISIÓN" | "PENDIENTE";

export interface Spec {
  feature: string;
  path: string;
  status: SpecStatus;
}

export interface OpenSpecData {
  activeChanges: Change[];
  archivedChanges: Change[];
  specs: Spec[];
}

export interface Progress {
  tasksTotal: number;
  tasksDone: number;
  percentage: number;
  activeChanges: number;
}

export interface Project {
  id: string;
  path: string;
  name: string;
  alias?: string;
  addedAt: string;
  lastScanned?: string;
  git: GitInfo;
  openspec: OpenSpecData;
  progress: Progress;
}
