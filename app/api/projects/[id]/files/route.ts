import { NextResponse } from "next/server";
import { getProject } from "@/lib/store";
import { readOpenspecFile, writeOpenspecFile } from "@/lib/openspec/files";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const project = await getProject(id);
  if (!project) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });

  const url = new URL(request.url);
  const relativePath = url.searchParams.get("path");
  if (!relativePath) return NextResponse.json({ error: "Falta path" }, { status: 400 });

  try {
    const result = await readOpenspecFile(project.path, relativePath);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al leer archivo" },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const project = await getProject(id);
  if (!project) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });

  const url = new URL(request.url);
  const relativePath = url.searchParams.get("path");
  if (!relativePath) return NextResponse.json({ error: "Falta path" }, { status: 400 });

  const body = (await request.json().catch(() => ({}))) as {
    content?: string;
    baseSha256?: string;
  };
  if (typeof body.content !== "string") {
    return NextResponse.json({ error: "Falta content" }, { status: 400 });
  }

  try {
    const outcome = await writeOpenspecFile(project.path, relativePath, body.content, body.baseSha256);
    if (outcome.conflict) {
      return NextResponse.json({ conflict: true, current: outcome.current }, { status: 409 });
    }
    if (!outcome.ok) {
      return NextResponse.json({ error: outcome.error ?? "Error al escribir" }, { status: 400 });
    }
    return NextResponse.json({ ok: true, saved: outcome.saved });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al escribir archivo" },
      { status: 400 }
    );
  }
}
