import { NextResponse } from "next/server";
import { deleteProject, updateProject } from "@/lib/store";
import { loadProject } from "@/lib/openspec/project";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const project = await loadProject(id);
  if (!project) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
  return NextResponse.json(project);
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const removed = await deleteProject(id);
  if (!removed) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const updated = await updateProject(id, body);
  if (!updated) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
  return NextResponse.json(updated);
}
