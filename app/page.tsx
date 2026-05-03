import { MainLayout } from "@/components/MainLayout";
import { ProjectsConfigScreen } from "@/components/ProjectsConfigScreen";
import { readProjects } from "@/lib/store";
import { scanOpenspec } from "@/lib/openspec/scanner";
import path from "node:path";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const records = await readProjects();

  const projects = await Promise.all(
    records.map(async (r) => {
      try {
        const data = await scanOpenspec(r.path);
        const total = data.activeChanges.reduce((acc, c) => acc + c.tasksTotal, 0);
        const done = data.activeChanges.reduce((acc, c) => acc + c.tasksDone, 0);
        return {
          id: r.id,
          name: r.alias ?? path.basename(r.path),
          path: r.path,
          tasksDone: done,
          tasksTotal: total,
          activeChanges: data.activeChanges.length,
          lastScanned: r.lastScanned,
        };
      } catch {
        return {
          id: r.id,
          name: r.alias ?? path.basename(r.path),
          path: r.path,
          tasksDone: 0,
          tasksTotal: 0,
          activeChanges: 0,
          lastScanned: r.lastScanned,
        };
      }
    })
  );

  return (
    <MainLayout title="Gestor de Repositorios" icon="terminal" subtitle="OpenSpec Dashboard">
      <ProjectsConfigScreen projects={projects} />
    </MainLayout>
  );
}
