"use client";

import { useState } from "react";
import Link from "next/link";

interface ChangeRow {
  slug: string;
  modifiedTime?: string;
  tasksDone: number;
  tasksTotal: number;
}

interface SpecRow {
  feature: string;
  path: string;
  status: "VALIDADO" | "EN REVISIÓN" | "PENDIENTE";
}

interface CommitRow {
  hash: string;
  message: string;
  time: string;
  author: string;
}

interface ProjectDashboardProps {
  projectId: string;
  projectName: string;
  projectPath: string;
  branch: string | null;
  githubUrl: string | null;
  changes: ChangeRow[];
  specs: SpecRow[];
  commits: CommitRow[];
  progress: { done: number; total: number; percentage: number };
}

export function ProjectDashboard({
  projectId,
  projectName,
  projectPath,
  branch,
  githubUrl,
  changes,
  specs,
  commits,
  progress,
}: ProjectDashboardProps) {
  const [gitCollapsed, setGitCollapsed] = useState(false);

  return (
    <div className="p-8">
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-widest"
              style={{
                backgroundColor: "rgba(78, 222, 163, 0.1)",
                color: "var(--secondary)",
                borderColor: "rgba(78, 222, 163, 0.2)",
              }}
            >
              {branch ?? "—"}
            </span>
            <span
              className="text-xs"
              style={{
                fontFamily: "JetBrains Mono, monospace",
                color: "var(--on-surface-variant)",
              }}
            >
              {projectPath}
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--on-surface)" }}>
            {projectName}
          </h2>
          <p className="text-sm" style={{ color: "var(--on-surface-variant)" }}>
            {progress.done}/{progress.total} tasks · {progress.percentage}% completado · {changes.length} cambios activos
          </p>
        </div>

        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded border transition-colors"
            style={{
              backgroundColor: "var(--surface-container)",
              borderColor: "var(--outline-variant)",
            }}
          >
            <span className="text-xs" style={{ color: "var(--on-surface)" }}>
              Ver en GitHub
            </span>
            <span className="material-symbols-outlined" style={{ color: "var(--on-surface-variant)", fontSize: "14px" }}>
              open_in_new
            </span>
          </a>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <section
            className="border rounded-xl overflow-hidden"
            style={{
              backgroundColor: "var(--surface-container-lowest)",
              borderColor: "var(--outline-variant)",
            }}
          >
            <div
              className="px-5 py-3 border-b flex justify-between items-center"
              style={{
                backgroundColor: "var(--surface-container-low)",
                borderColor: "var(--outline-variant)",
              }}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ color: "var(--tertiary)", fontSize: "20px" }}>
                  folder_managed
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--on-surface)" }}>
                  Cambios Activos
                </h3>
              </div>
              <span
                className="text-[10px]"
                style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--on-surface-variant)" }}
              >
                openspec/changes/
              </span>
            </div>

            {changes.length === 0 ? (
              <div className="p-6 text-center text-sm" style={{ color: "var(--on-surface-variant)" }}>
                No hay cambios activos.
              </div>
            ) : (
              <div>
                {changes.map((change, idx) => {
                  const pct = change.tasksTotal === 0 ? 0 : Math.round((change.tasksDone / change.tasksTotal) * 100);
                  return (
                    <div
                      key={change.slug}
                      className="p-4 flex items-center justify-between group transition-colors"
                      style={{
                        borderBottom: idx < changes.length - 1 ? "1px solid var(--outline-variant)" : "none",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-container-low)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="material-symbols-outlined" style={{ color: "var(--on-surface-variant)", fontSize: "20px" }}>
                          folder
                        </span>
                        <div className="min-w-0">
                          <p
                            className="text-xs truncate"
                            style={{
                              fontFamily: "JetBrains Mono, monospace",
                              color: "var(--on-surface)",
                            }}
                          >
                            {change.slug}
                          </p>
                          <p className="text-[10px]" style={{ color: "var(--on-surface-variant)" }}>
                            {change.tasksDone}/{change.tasksTotal} tasks · {pct}%
                            {change.modifiedTime ? ` · ${change.modifiedTime}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={`/projects/${projectId}/edit?path=${encodeURIComponent(`changes/${change.slug}/proposal.md`)}` as never}
                          className="px-3 py-1 text-[11px] font-medium border rounded transition-colors"
                          style={{
                            borderColor: "var(--outline-variant)",
                            color: "var(--on-surface)",
                          }}
                        >
                          Proposal
                        </Link>
                        <Link
                          href={`/projects/${projectId}/edit?path=${encodeURIComponent(`changes/${change.slug}/design.md`)}` as never}
                          className="px-3 py-1 text-[11px] font-medium border rounded transition-colors"
                          style={{
                            borderColor: "var(--outline-variant)",
                            color: "var(--on-surface)",
                          }}
                        >
                          Design
                        </Link>
                        <Link
                          href={`/projects/${projectId}/edit?path=${encodeURIComponent(`changes/${change.slug}/tasks.md`)}` as never}
                          className="px-3 py-1 text-[11px] font-medium border rounded transition-colors"
                          style={{
                            backgroundColor: "rgba(173, 198, 255, 0.1)",
                            borderColor: "rgba(173, 198, 255, 0.3)",
                            color: "var(--primary)",
                          }}
                        >
                          Tasks
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section
            className="border rounded-xl overflow-hidden"
            style={{
              backgroundColor: "var(--surface-container-lowest)",
              borderColor: "var(--outline-variant)",
            }}
          >
            <div
              className="px-5 py-3 border-b flex justify-between items-center"
              style={{
                backgroundColor: "var(--surface-container-low)",
                borderColor: "var(--outline-variant)",
              }}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: "20px" }}>
                  description
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--on-surface)" }}>
                  Specs Baseline
                </h3>
              </div>
              <span
                className="text-[10px]"
                style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--on-surface-variant)" }}
              >
                openspec/specs/
              </span>
            </div>

            {specs.length === 0 ? (
              <div className="p-6 text-center text-sm" style={{ color: "var(--on-surface-variant)" }}>
                No hay specs registrados.
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
                        Archivo
                      </th>
                      <th className="px-4 py-2 text-[10px] uppercase tracking-widest font-medium" style={{ color: "var(--on-surface-variant)" }}>
                        Estado
                      </th>
                      <th className="px-4 py-2 text-[10px] uppercase tracking-widest font-medium text-right" style={{ color: "var(--on-surface-variant)" }}>
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {specs.map((spec, idx) => (
                      <tr
                        key={spec.feature}
                        style={{
                          borderBottom: idx < specs.length - 1 ? "1px solid var(--outline-variant)" : "none",
                          borderLeft: spec.status === "EN REVISIÓN" ? "2px solid var(--tertiary)" : "none",
                        }}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined" style={{ color: "var(--on-surface-variant)", fontSize: "16px" }}>
                              article
                            </span>
                            <span
                              className="text-xs"
                              style={{
                                fontFamily: "JetBrains Mono, monospace",
                                color: "var(--on-surface)",
                              }}
                            >
                              {spec.feature}/spec.md
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block"
                            style={{
                              backgroundColor:
                                spec.status === "VALIDADO"
                                  ? "rgba(78, 222, 163, 0.1)"
                                  : spec.status === "EN REVISIÓN"
                                  ? "rgba(255, 183, 134, 0.1)"
                                  : "rgba(140, 144, 159, 0.1)",
                              color:
                                spec.status === "VALIDADO"
                                  ? "var(--secondary)"
                                  : spec.status === "EN REVISIÓN"
                                  ? "var(--tertiary)"
                                  : "var(--on-surface-variant)",
                              borderColor:
                                spec.status === "VALIDADO"
                                  ? "rgba(78, 222, 163, 0.2)"
                                  : spec.status === "EN REVISIÓN"
                                  ? "rgba(255, 183, 134, 0.2)"
                                  : "var(--outline-variant)",
                            }}
                          >
                            {spec.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/projects/${projectId}/edit?path=${encodeURIComponent(spec.path)}` as never}
                            className="text-xs font-medium hover:underline"
                            style={{ color: "var(--primary)" }}
                          >
                            Editar
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <section
            className="border rounded-xl overflow-hidden transition-[max-height] duration-300"
            style={{
              backgroundColor: "var(--surface-container-lowest)",
              borderColor: "var(--outline-variant)",
              maxHeight: gitCollapsed ? "52px" : "1200px",
            }}
          >
            <button
              type="button"
              onClick={() => setGitCollapsed((c) => !c)}
              className="w-full px-5 py-3 border-b flex items-center justify-between cursor-pointer transition-colors"
              style={{
                backgroundColor: "var(--surface-container-low)",
                borderColor: gitCollapsed ? "transparent" : "var(--outline-variant)",
                height: "52px",
              }}
              aria-expanded={!gitCollapsed}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined" style={{ color: "var(--secondary)", fontSize: "20px" }}>
                  history
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--on-surface)" }}>
                  Actividad Git
                </h3>
                {gitCollapsed && (
                  <span className="text-[10px] ml-1" style={{ color: "var(--on-surface-variant)", fontFamily: "JetBrains Mono, monospace" }}>
                    · {commits.length} commits
                  </span>
                )}
              </div>
              <span
                className="material-symbols-outlined transition-transform duration-200"
                style={{
                  color: "var(--on-surface-variant)",
                  fontSize: "18px",
                  transform: gitCollapsed ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                expand_less
              </span>
            </button>

            <div className="p-5">
              {commits.length === 0 ? (
                <p className="text-xs text-center" style={{ color: "var(--on-surface-variant)" }}>
                  Sin commits.
                </p>
              ) : (
                <div className="space-y-5 relative pl-6">
                  <div
                    className="absolute left-2 top-2 bottom-2 w-[1px]"
                    style={{ backgroundColor: "var(--outline-variant)" }}
                  />
                  {commits.slice(0, 5).map((commit) => (
                    <div key={commit.hash} className="relative">
                      <div
                        className="absolute -left-6 top-1.5 rounded-full"
                        style={{
                          width: "8px",
                          height: "8px",
                          backgroundColor: "var(--primary)",
                          boxShadow: "0 0 0 4px var(--surface-container-lowest)",
                        }}
                      />
                      <div className="flex justify-between items-center mb-1 gap-2">
                        <span
                          className="text-[11px]"
                          style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--primary)" }}
                        >
                          #{commit.hash.substring(0, 7)}
                        </span>
                        <span className="text-[10px] flex-shrink-0" style={{ color: "var(--on-surface-variant)" }}>
                          {commit.time}
                        </span>
                      </div>
                      <p className="text-xs leading-snug" style={{ color: "var(--on-surface)" }}>
                        {commit.message}
                      </p>
                      <span className="text-[10px]" style={{ color: "var(--on-surface-variant)" }}>
                        {commit.author}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section
            className="border rounded-xl p-5"
            style={{
              backgroundColor: "rgba(173, 198, 255, 0.05)",
              borderColor: "var(--primary)",
            }}
          >
            <h4 className="text-xs font-bold mb-3 uppercase" style={{ color: "var(--primary)" }}>
              Conformidad técnica
            </h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[10px] mb-1" style={{ color: "var(--on-surface-variant)" }}>
                  <span>Tasks Coverage</span>
                  <span style={{ color: "var(--primary)" }}>{progress.percentage}%</span>
                </div>
                <div
                  className="rounded-full overflow-hidden"
                  style={{ height: "4px", backgroundColor: "var(--surface-container)" }}
                >
                  <div
                    className="h-full"
                    style={{ width: `${progress.percentage}%`, backgroundColor: "var(--primary)" }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] mb-1" style={{ color: "var(--on-surface-variant)" }}>
                  <span>Specs validados</span>
                  <span style={{ color: "var(--secondary)" }}>
                    {specs.filter((s) => s.status === "VALIDADO").length}/{specs.length}
                  </span>
                </div>
                <div
                  className="rounded-full overflow-hidden"
                  style={{ height: "4px", backgroundColor: "var(--surface-container)" }}
                >
                  <div
                    className="h-full"
                    style={{
                      width:
                        specs.length === 0
                          ? "0%"
                          : `${(specs.filter((s) => s.status === "VALIDADO").length / specs.length) * 100}%`,
                      backgroundColor: "var(--secondary)",
                    }}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
