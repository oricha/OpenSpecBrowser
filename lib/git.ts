import simpleGit, { type SimpleGit } from "simple-git";
import type { CommitInfo, GitInfo } from "./openspec/types";

function toGithubUrl(remote: string | null): string | null {
  if (!remote) return null;
  const sshMatch = remote.match(/^git@([^:]+):(.+?)(\.git)?$/);
  if (sshMatch) {
    return `https://${sshMatch[1]}/${sshMatch[2]}`;
  }
  const httpsMatch = remote.match(/^(https?:\/\/[^/]+\/.+?)(\.git)?$/);
  if (httpsMatch) {
    return httpsMatch[1];
  }
  return null;
}

export async function readGitInfo(projectPath: string): Promise<GitInfo> {
  const git: SimpleGit = simpleGit(projectPath);
  let remoteUrl: string | null = null;
  let branch: string | null = null;
  let lastCommits: CommitInfo[] = [];

  try {
    const remote = await git.getRemotes(true);
    const origin = remote.find((r) => r.name === "origin");
    remoteUrl = origin?.refs?.fetch ?? origin?.refs?.push ?? null;
  } catch {
    remoteUrl = null;
  }
  try {
    const summary = await git.branch();
    branch = summary.current ?? null;
  } catch {
    branch = null;
  }
  try {
    const log = await git.log({ maxCount: 15 });
    lastCommits = log.all.map((c) => ({
      hash: c.hash,
      message: c.message,
      author: { name: c.author_name, email: c.author_email },
      date: c.date,
    }));
  } catch {
    lastCommits = [];
  }

  return {
    remoteUrl,
    githubUrl: toGithubUrl(remoteUrl),
    branch,
    lastCommits,
  };
}
