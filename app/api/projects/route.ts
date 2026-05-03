import { NextResponse } from "next/server";
import { addProject, readProjects } from "@/lib/store";
import { validateProjectPath } from "@/lib/paths";

export async function GET() {
  const projects = await readProjects();
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    path?: string;
    alias?: string;
    scanIntervalSeconds?: number;
  };
  if (!body.path || typeof body.path !== "string") {
    return NextResponse.json({ error: "Falta path" }, { status: 400 });
  }
  const validation = validateProjectPath(body.path);
  if (!validation.valid || !validation.normalized) {
    return NextResponse.json({ error: validation.error ?? "Path inválido" }, { status: 400 });
  }
  const record = await addProject({
    path: validation.normalized,
    alias: body.alias,
    scanIntervalSeconds: body.scanIntervalSeconds,
  });
  return NextResponse.json(record, { status: 201 });
}
