"use client";

interface TopAppBarProps {
  title: string;
  icon?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function TopAppBar({ title, icon, subtitle, actions }: TopAppBarProps) {
  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-6 backdrop-blur-md border-b"
      style={{
        height: "56px",
        backgroundColor: "rgba(16, 19, 26, 0.85)",
        borderColor: "var(--outline-variant)",
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <span
            className="material-symbols-outlined flex-shrink-0"
            style={{ color: "var(--primary)", fontSize: "20px" }}
          >
            {icon}
          </span>
        )}
        <div className="flex flex-col min-w-0">
          <h1
            className="text-sm font-semibold truncate"
            style={{ color: "var(--on-surface)" }}
          >
            {title}
          </h1>
          {subtitle && (
            <span
              className="text-[10px] truncate"
              style={{ color: "var(--on-surface-variant)", fontFamily: "JetBrains Mono, monospace" }}
            >
              {subtitle}
            </span>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
