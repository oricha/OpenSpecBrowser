import path from "node:path";
import { NextResponse } from "next/server";
import { getProject } from "@/lib/store";
import { ensureWithinOpenspec } from "@/lib/paths";
import { toggleTaskInFile } from "@/lib/openspec/tasks";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const project = await getProject(id);
  if (!project) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });

  const body = (await request.json().catch(() => ({}))) as {
    changeSlug?: string;
    archived?: boolean;
    line?: number;
    text?: string;
    done?: boolean;
  };
  if (!body.changeSlug || typeof body.line !== "number" || typeof body.text !== "string" || typeof body.done !== "boolean") {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
  }
  const relative = body.archived
    ? path.join("changes", "archive", body.changeSlug, "tasks.md")
    : path.join("changes", body.changeSlug, "tasks.md");
  let target: string;
  try {
    target = ensureWithinOpenspec(project.path, relative);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Path inválido" }, { status: 400 });
  }

  const result = await toggleTaskInFile(target, body.text, body.line, body.done);
  if (!result.ok) {
    return NextResponse.json({ error: result.reason, currentLine: result.currentLine }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}
