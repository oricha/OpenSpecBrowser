import path from "node:path";
import { notFound, redirect } from "next/navigation";
import { FileEditorScreen } from "@/components/FileEditorScreen";
import { getProject } from "@/lib/store";
import { readOpenspecFile } from "@/lib/openspec/files";

export const dynamic = "force-dynamic";

export default async function EditFilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ path?: string }>;
}) {
  const { id } = await params;
  const { path: relativePath } = await searchParams;

  if (!relativePath) {
    redirect(`/projects/${id}` as never);
  }

  const project = await getProject(id);
  if (!project) notFound();

  let initialContent: string;
  let initialSha: string;
  try {
    const result = await readOpenspecFile(project.path, relativePath!);
    initialContent = result.content;
    initialSha = result.sha256;
  } catch {
    notFound();
  }

  const projectName = project.alias ?? path.basename(project.path);

  return (
    <FileEditorScreen
      projectId={project.id}
      projectName={projectName}
      filePath={relativePath!}
      initialContent={initialContent!}
      initialSha256={initialSha!}
    />
  );
}
