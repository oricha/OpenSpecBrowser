import { notFound } from "next/navigation";
import { MainLayout } from "@/components/MainLayout";
import { ProjectDashboard } from "@/components/ProjectDashboard";
import { loadProject } from "@/lib/openspec/project";

export const dynamic = "force-dynamic";

function timeAgo(iso?: string): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `hace ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days}d`;
  return new Date(iso).toLocaleDateString("es-ES");
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await loadProject(id);
  if (!project) notFound();

  const changes = project.openspec.activeChanges.map((c) => ({
    slug: c.slug,
    modifiedTime: timeAgo(c.modifiedAt),
    tasksDone: c.tasksDone,
    tasksTotal: c.tasksTotal,
  }));

  const specs = project.openspec.specs.map((s) => ({
    feature: s.feature,
    path: s.path,
    status: s.status,
  }));

  const commits = project.git.lastCommits.map((c) => ({
    hash: c.hash,
    message: c.message,
    time: timeAgo(c.date),
    author:
      typeof c.author === "string"
        ? c.author
        : c.author.name + (c.author.email ? ` <${c.author.email}>` : ""),
  }));

  return (
    <MainLayout
      title={project.name}
      icon="folder_managed"
      subtitle={project.path}
    >
      <ProjectDashboard
        projectId={project.id}
        projectName={project.name}
        projectPath={project.path}
        branch={project.git.branch}
        githubUrl={project.git.githubUrl}
        changes={changes}
        specs={specs}
        commits={commits}
        progress={{
          done: project.progress.tasksDone,
          total: project.progress.tasksTotal,
          percentage: project.progress.percentage,
        }}
      />
    </MainLayout>
  );
}
