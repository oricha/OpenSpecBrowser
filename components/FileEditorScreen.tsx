"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface FileEditorScreenProps {
  projectId: string;
  projectName: string;
  filePath: string;
  initialContent: string;
  initialSha256: string;
}

type ViewMode = "split" | "preview";
type RenderMode = "markdown" | "plain";

export function FileEditorScreen({
  projectId,
  projectName,
  filePath,
  initialContent,
  initialSha256,
}: FileEditorScreenProps) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [baseSha, setBaseSha] = useState(initialSha256);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [renderMode, setRenderMode] = useState<RenderMode>("markdown");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const lines = content.split("\n");
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const dirty = content !== initialContent;

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMsg(null);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/files?path=${encodeURIComponent(filePath)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, baseSha256: baseSha }),
        }
      );
      if (res.status === 409) {
        const data = await res.json();
        setStatusMsg(`Conflicto: el archivo cambió en disco (${data?.current?.sha256?.slice(0, 8)}…)`);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setStatusMsg(`Error: ${data.error ?? res.statusText}`);
        return;
      }
      const data = await res.json();
      if (data?.saved?.sha256) setBaseSha(data.saved.sha256);
      setStatusMsg("Guardado");
      setTimeout(() => setStatusMsg(null), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFullscreenToggle = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      /* algunas plataformas bloquean fullscreen */
    }
  };

  const handleClose = () => {
    if (dirty && !confirm("Hay cambios sin guardar. ¿Salir igualmente?")) return;
    router.push(`/projects/${projectId}` as never);
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-screen"
      style={{ backgroundColor: "var(--background)" }}
    >
      <header
        className="flex items-center justify-between px-6 backdrop-blur-md border-b sticky top-0 z-40"
        style={{
          height: "48px",
          backgroundColor: "rgba(16, 19, 26, 0.85)",
          borderColor: "var(--outline-variant)",
        }}
      >
        <div className="flex items-center gap-4 min-w-0">
          <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: "18px" }}>
            edit_note
          </span>
          <div className="flex items-center gap-2 min-w-0 text-xs" style={{ fontFamily: "JetBrains Mono, monospace" }}>
            <span style={{ color: "var(--on-surface-variant)" }}>{projectName}</span>
            <span style={{ color: "var(--outline)" }}>/</span>
            <span className="truncate font-bold" style={{ color: "var(--primary)" }}>
              {filePath}
            </span>
            {dirty && (
              <span
                className="ml-2 px-1.5 py-0.5 rounded text-[10px]"
                style={{
                  backgroundColor: "rgba(255, 183, 134, 0.1)",
                  color: "var(--tertiary)",
                  border: "1px solid rgba(255, 183, 134, 0.3)",
                }}
              >
                MODIFICADO
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SegmentedControl
            options={[
              { value: "markdown", label: "Markdown", icon: "description" },
              { value: "plain", label: "Plain", icon: "text_fields" },
            ]}
            value={renderMode}
            onChange={(v) => setRenderMode(v as RenderMode)}
          />
          <SegmentedControl
            options={[
              { value: "split", label: "Split", icon: "splitscreen" },
              { value: "preview", label: "Preview", icon: "visibility" },
            ]}
            value={viewMode}
            onChange={(v) => setViewMode(v as ViewMode)}
          />

          <button
            onClick={handleFullscreenToggle}
            title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            className="flex items-center justify-center rounded transition-colors"
            style={{
              width: "32px",
              height: "30px",
              backgroundColor: isFullscreen ? "var(--surface-container-highest)" : "transparent",
              color: isFullscreen ? "var(--primary)" : "var(--on-surface-variant)",
              border: "1px solid var(--outline-variant)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--primary)";
            }}
            onMouseLeave={(e) => {
              if (!isFullscreen) e.currentTarget.style.color = "var(--on-surface-variant)";
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
              {isFullscreen ? "fullscreen_exit" : "fullscreen"}
            </span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving || !dirty}
            className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all active:scale-95"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--on-primary)",
              opacity: isSaving || !dirty ? 0.5 : 1,
              height: "30px",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
              save
            </span>
            {isSaving ? "Guardando…" : "Guardar"}
          </button>

          <button
            onClick={handleClose}
            className="flex items-center justify-center rounded transition-colors"
            style={{
              width: "30px",
              height: "30px",
              color: "var(--on-surface-variant)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--error)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--on-surface-variant)")}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              close
            </span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {viewMode === "split" && (
          <section
            className="flex-1 flex flex-col border-r"
            style={{
              borderColor: "var(--outline-variant)",
              backgroundColor: "var(--surface-container-lowest)",
            }}
          >
            <PaneHeader label={`Editor — ${renderMode === "markdown" ? "Markdown" : "Plain Text"}`} />
            <div className="flex-1 overflow-hidden flex">
              <div
                className="select-none text-right pt-3 pr-2 pl-3"
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "13px",
                  lineHeight: "20px",
                  color: "var(--outline)",
                  backgroundColor: "var(--surface-container-low)",
                  borderRight: "1px solid var(--outline-variant)",
                  minWidth: "48px",
                }}
              >
                {lines.map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                spellCheck={false}
                className="flex-1 outline-none p-3 resize-none"
                style={{
                  backgroundColor: "var(--surface-container-lowest)",
                  color: "var(--on-surface)",
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "13px",
                  lineHeight: "20px",
                  border: "none",
                }}
              />
            </div>
          </section>
        )}

        <section
          className="flex-1 flex flex-col"
          style={{ backgroundColor: "var(--surface-container-low)" }}
        >
          <PaneHeader label={`Vista Previa — ${renderMode === "markdown" ? "Renderizado" : "Texto Plano"}`} />
          <div className="flex-1 overflow-y-auto p-8">
            {renderMode === "markdown" ? (
              <div className="markdown-body max-w-3xl mx-auto" style={{ color: "var(--on-surface)" }}>
                <MarkdownRenderer content={content} />
              </div>
            ) : (
              <pre
                className="max-w-full"
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "13px",
                  lineHeight: "20px",
                  color: "var(--on-surface)",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {content}
              </pre>
            )}
          </div>
        </section>
      </div>

      <footer
        className="flex items-center justify-between px-4 text-[10px]"
        style={{
          height: "24px",
          backgroundColor: "var(--surface-container-low)",
          borderTop: "1px solid var(--outline-variant)",
          color: "var(--on-surface-variant)",
          fontFamily: "JetBrains Mono, monospace",
        }}
      >
        <div className="flex items-center gap-4">
          <span style={{ color: "var(--primary)" }}>UTF-8</span>
          <span>Ln {lines.length} · Col 1</span>
          <span>{wordCount} palabras</span>
          <span>{renderMode === "markdown" ? "Markdown" : "Plain Text"}</span>
        </div>
        <div className="flex items-center gap-3">
          {statusMsg && <span style={{ color: dirty ? "var(--tertiary)" : "var(--secondary)" }}>{statusMsg}</span>}
          <span style={{ color: dirty ? "var(--tertiary)" : "var(--secondary)" }}>
            {dirty ? "● Modificado" : "● Sincronizado"}
          </span>
        </div>
      </footer>
    </div>
  );
}

function PaneHeader({ label }: { label: string }) {
  return (
    <div
      className="flex items-center px-4 border-b"
      style={{
        height: "30px",
        backgroundColor: "var(--surface-container)",
        borderColor: "var(--outline-variant)",
      }}
    >
      <span
        className="text-[10px] uppercase tracking-widest"
        style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--on-surface-variant)" }}
      >
        {label}
      </span>
    </div>
  );
}

interface SegmentedOption {
  value: string;
  label: string;
  icon?: string;
}

function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: SegmentedOption[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      className="flex rounded p-0.5"
      style={{
        backgroundColor: "var(--surface-container)",
        border: "1px solid var(--outline-variant)",
        height: "30px",
      }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="flex items-center gap-1.5 px-2.5 rounded text-xs font-medium transition-colors"
            style={{
              backgroundColor: active ? "var(--surface-container-highest)" : "transparent",
              color: active ? "var(--primary)" : "var(--on-surface-variant)",
            }}
          >
            {opt.icon && (
              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                {opt.icon}
              </span>
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: (props) => <h1 style={{ fontSize: "24px", fontWeight: 600, margin: "1.5rem 0 1rem", color: "var(--on-surface)" }} {...props} />,
        h2: (props) => <h2 style={{ fontSize: "20px", fontWeight: 600, margin: "1.25rem 0 0.75rem", color: "var(--on-surface)" }} {...props} />,
        h3: (props) => <h3 style={{ fontSize: "16px", fontWeight: 600, margin: "1rem 0 0.5rem", color: "var(--on-surface)" }} {...props} />,
        p: (props) => <p style={{ margin: "0.75rem 0", lineHeight: 1.6, color: "var(--on-surface-variant)" }} {...props} />,
        ul: (props) => <ul style={{ paddingLeft: "1.5rem", margin: "0.75rem 0", color: "var(--on-surface-variant)" }} {...props} />,
        ol: (props) => <ol style={{ paddingLeft: "1.5rem", margin: "0.75rem 0", color: "var(--on-surface-variant)" }} {...props} />,
        li: (props) => <li style={{ margin: "0.25rem 0" }} {...props} />,
        code: ({ children, className, ...rest }) => {
          const isInline = !className;
          return isInline ? (
            <code
              {...rest}
              style={{
                backgroundColor: "var(--surface-container)",
                padding: "1px 5px",
                borderRadius: "3px",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "12px",
                color: "var(--primary)",
              }}
            >
              {children}
            </code>
          ) : (
            <code className={className}>{children}</code>
          );
        },
        pre: (props) => (
          <pre
            style={{
              backgroundColor: "var(--surface-container)",
              padding: "1rem",
              borderRadius: "4px",
              overflowX: "auto",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "12px",
              border: "1px solid var(--outline-variant)",
            }}
            {...props}
          />
        ),
        blockquote: (props) => (
          <blockquote
            style={{
              borderLeft: "2px solid var(--primary)",
              paddingLeft: "1rem",
              margin: "1rem 0",
              color: "var(--on-surface-variant)",
              fontStyle: "italic",
            }}
            {...props}
          />
        ),
        a: (props) => <a style={{ color: "var(--primary)", textDecoration: "underline" }} {...props} />,
        table: (props) => (
          <table
            style={{
              borderCollapse: "collapse",
              width: "100%",
              margin: "1rem 0",
              fontSize: "12px",
            }}
            {...props}
          />
        ),
        th: (props) => (
          <th
            style={{
              border: "1px solid var(--outline-variant)",
              padding: "6px 10px",
              backgroundColor: "var(--surface-container)",
              textAlign: "left",
              color: "var(--on-surface)",
            }}
            {...props}
          />
        ),
        td: (props) => (
          <td
            style={{
              border: "1px solid var(--outline-variant)",
              padding: "6px 10px",
              color: "var(--on-surface-variant)",
            }}
            {...props}
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
