"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface ProjectRow {
  id: string;
  name: string;
  path: string;
  tasksDone: number;
  tasksTotal: number;
  activeChanges: number;
  lastScanned?: string;
}

interface ProjectsConfigScreenProps {
  projects: ProjectRow[];
}

export function ProjectsConfigScreen({ projects }: ProjectsConfigScreenProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [path, setPath] = useState("");
  const [alias, setAlias] = useState("");
  const [interval, setInterval] = useState("60");
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: path.trim(),
        alias: alias.trim() || undefined,
        scanIntervalSeconds: Number(interval) || undefined,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Error al añadir proyecto");
      return;
    }
    setPath("");
    setAlias("");
    startTransition(() => router.refresh());
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este proyecto del registro?")) return;
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) {
      startTransition(() => router.refresh());
    }
  };

  const totalTasks = projects.reduce((acc, p) => acc + p.tasksTotal, 0);
  const totalDone = projects.reduce((acc, p) => acc + p.tasksDone, 0);
  const totalChanges = projects.reduce((acc, p) => acc + p.activeChanges, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--on-surface)" }}>
          Gestor de Repositorios
        </h2>
        <p className="text-sm" style={{ color: "var(--on-surface-variant)" }}>
          Registra los proyectos OpenSpec a monitorizar.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <section
          className="lg:col-span-2 border rounded-xl overflow-hidden"
          style={{
            backgroundColor: "var(--surface-container-lowest)",
            borderColor: "var(--outline-variant)",
          }}
        >
          <div
            className="px-5 py-3 border-b flex items-center gap-2"
            style={{ backgroundColor: "var(--surface-container-low)", borderColor: "var(--outline-variant)" }}
          >
            <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: "20px" }}>
              add_box
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--on-surface)" }}>
              Registrar nuevo proyecto
            </h3>
          </div>
          <form onSubmit={handleAdd} className="p-5 space-y-4">
            <div>
              <label
                className="block text-[10px] uppercase tracking-widest mb-2"
                style={{ color: "var(--on-surface-variant)" }}
              >
                Path absoluto
              </label>
              <input
                type="text"
                required
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="/Users/zion/dev/project/cora-clinic-site"
                className="w-full px-3 py-2 text-sm rounded outline-none transition-colors"
                style={{
                  backgroundColor: "var(--surface-container)",
                  border: "1px solid var(--outline-variant)",
                  color: "var(--on-surface)",
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "13px",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--outline-variant)")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-[10px] uppercase tracking-widest mb-2"
                  style={{ color: "var(--on-surface-variant)" }}
                >
                  Alias (opcional)
                </label>
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="Cora Clinic"
                  className="w-full px-3 py-2 text-sm rounded outline-none transition-colors"
                  style={{
                    backgroundColor: "var(--surface-container)",
                    border: "1px solid var(--outline-variant)",
                    color: "var(--on-surface)",
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-[10px] uppercase tracking-widest mb-2"
                  style={{ color: "var(--on-surface-variant)" }}
                >
                  Intervalo de scan (s)
                </label>
                <input
                  type="number"
                  min="10"
                  value={interval}
                  onChange={(e) => setInterval(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded outline-none transition-colors"
                  style={{
                    backgroundColor: "var(--surface-container)",
                    border: "1px solid var(--outline-variant)",
                    color: "var(--on-surface)",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                />
              </div>
            </div>

            {error && (
              <div
                className="px-3 py-2 rounded text-xs"
                style={{
                  backgroundColor: "rgba(255, 180, 171, 0.1)",
                  color: "var(--error)",
                  border: "1px solid rgba(255, 180, 171, 0.3)",
                }}
              >
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 rounded text-xs font-medium transition-all active:scale-95"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--on-primary)",
                  opacity: isPending ? 0.6 : 1,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                  add
                </span>
                Añadir proyecto
              </button>
            </div>
          </form>
        </section>

        <section
          className="border rounded-xl p-5"
          style={{
            backgroundColor: "rgba(173, 198, 255, 0.05)",
            borderColor: "var(--primary)",
          }}
        >
          <h4 className="text-xs font-bold mb-3 uppercase" style={{ color: "var(--primary)" }}>
            Estructura esperada
          </h4>
          <pre
            className="text-[11px] leading-relaxed"
            style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--on-surface-variant)" }}
          >
{`<repo>/openspec/
├── changes/
│   ├── <slug>/
│   │   ├── proposal.md
│   │   ├── design.md
│   │   └── tasks.md
│   └── archive/
└── specs/
    └── <feature>/spec.md`}
          </pre>
        </section>
      </div>

      <section
        className="border rounded-xl overflow-hidden"
        style={{
          backgroundColor: "var(--surface-container-lowest)",
          borderColor: "var(--outline-variant)",
        }}
      >
        <div
          className="px-5 py-3 border-b flex items-center justify-between"
          style={{ backgroundColor: "var(--surface-container-low)", borderColor: "var(--outline-variant)" }}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: "20px" }}>
              storage
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--on-surface)" }}>
              Proyectos registrados
            </h3>
          </div>
          <span className="text-[10px]" style={{ color: "var(--on-surface-variant)", fontFamily: "JetBrains Mono, monospace" }}>
            {projects.length} proyectos
          </span>
        </div>

        {projects.length === 0 ? (
          <div className="p-8 text-center text-sm" style={{ color: "var(--on-surface-variant)" }}>
            No hay proyectos registrados. Añade el primero usando el formulario de arriba.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr
                  style={{
                    backgroundColor: "var(--surface-container)",
                    borderBottom: "1px solid var(--outline-variant)",
                  }}
                >
                  <th className="px-4 py-2 text-[10px] uppercase tracking-widest font-medium" style={{ color: "var(--on-surface-variant)" }}>
                    Proyecto
                  </th>
                  <th className="px-4 py-2 text-[10px] uppercase tracking-widest font-medium" style={{ color: "var(--on-surface-variant)" }}>
                    Path
                  </th>
                  <th className="px-4 py-2 text-[10px] uppercase tracking-widest font-medium" style={{ color: "var(--on-surface-variant)" }}>
                    Progreso
                  </th>
                  <th className="px-4 py-2 text-[10px] uppercase tracking-widest font-medium text-right" style={{ color: "var(--on-surface-variant)" }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p, idx) => {
                  const pct = p.tasksTotal === 0 ? 0 : Math.round((p.tasksDone / p.tasksTotal) * 100);
                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom:
                          idx < projects.length - 1 ? "1px solid var(--outline-variant)" : "none",
                      }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <a
                            href={`/projects/${p.id}`}
                            className="text-xs font-semibold transition-colors"
                            style={{ color: "var(--primary)" }}
                          >
                            {p.name}
                          </a>
                          <span className="text-[10px]" style={{ color: "var(--on-surface-variant)" }}>
                            {p.activeChanges} active changes
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-[11px]"
                          style={{
                            color: "var(--on-surface-variant)",
                            fontFamily: "JetBrains Mono, monospace",
                          }}
                        >
                          {p.path}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="rounded-full overflow-hidden"
                            style={{ width: "80px", height: "4px", backgroundColor: "var(--surface-container)" }}
                          >
                            <div
                              className="h-full"
                              style={{ width: `${pct}%`, backgroundColor: "var(--primary)" }}
                            />
                          </div>
                          <span
                            className="text-[10px]"
                            style={{ color: "var(--on-surface-variant)", fontFamily: "JetBrains Mono, monospace" }}
                          >
                            {p.tasksDone}/{p.tasksTotal} · {pct}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <a
                            href={`/projects/${p.id}`}
                            className="px-3 py-1 text-[11px] font-medium border rounded transition-colors"
                            style={{
                              borderColor: "var(--outline-variant)",
                              color: "var(--on-surface)",
                            }}
                          >
                            Abrir
                          </a>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="px-3 py-1 text-[11px] font-medium border rounded transition-colors"
                            style={{
                              borderColor: "rgba(255, 180, 171, 0.3)",
                              color: "var(--error)",
                              backgroundColor: "rgba(255, 180, 171, 0.05)",
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div
          className="px-5 py-3 border-t flex items-center justify-between text-[10px]"
          style={{
            borderColor: "var(--outline-variant)",
            backgroundColor: "var(--surface-container-low)",
            color: "var(--on-surface-variant)",
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          <span>
            {totalChanges} active changes · {totalDone}/{totalTasks} tasks
          </span>
          <span style={{ color: "var(--secondary)" }}>● Sistema operativo</span>
        </div>
      </section>
    </div>
  );
}
