"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  icon: string;
  label: string;
  href: string;
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  items?: NavItem[];
}

const defaultItems: NavItem[] = [
  { icon: "dashboard", label: "Dashboard", href: "/" },
  { icon: "folder_open", label: "Proyectos", href: "/projects/new" },
];

export function Sidebar({ collapsed, onToggle, items = defaultItems }: SidebarProps) {
  const pathname = usePathname();
  const width = collapsed ? "64px" : "256px";

  return (
    <aside
      className="fixed left-0 top-0 z-50 hidden h-screen border-r md:flex md:flex-col transition-[width] duration-300 ease-out"
      style={{
        width,
        borderColor: "var(--outline-variant)",
        backgroundColor: "var(--surface-container-lowest)",
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-4 border-b"
        style={{ borderColor: "var(--outline-variant)", height: "56px" }}
      >
        {!collapsed && (
          <span
            className="text-sm font-bold tracking-tight uppercase"
            style={{ color: "var(--on-surface)" }}
          >
            OpenSpec
          </span>
        )}
        <button
          onClick={onToggle}
          aria-label={collapsed ? "Expandir sidebar" : "Contraer sidebar"}
          className="flex items-center justify-center rounded transition-colors"
          style={{
            width: "28px",
            height: "28px",
            color: "var(--on-surface-variant)",
            backgroundColor: "transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--surface-container)";
            e.currentTarget.style.color = "var(--primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--on-surface-variant)";
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
            {collapsed ? "chevron_right" : "chevron_left"}
          </span>
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href as never}
              title={collapsed ? item.label : undefined}
              className="flex items-center gap-3 rounded text-xs font-medium tracking-tight transition-colors"
              style={{
                color: active ? "var(--primary)" : "var(--on-surface-variant)",
                backgroundColor: active ? "var(--surface-container-low)" : "transparent",
                borderLeft: active ? "2px solid var(--primary)" : "2px solid transparent",
                padding: collapsed ? "8px" : "8px 12px",
                justifyContent: collapsed ? "center" : "flex-start",
                height: "36px",
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = "var(--surface-container-low)";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                {item.icon}
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t" style={{ borderColor: "var(--outline-variant)" }}>
        <div
          className="flex items-center gap-3"
          style={{ justifyContent: collapsed ? "center" : "flex-start" }}
        >
          <div
            className="flex items-center justify-center text-[10px] font-bold rounded-full flex-shrink-0"
            style={{
              width: "32px",
              height: "32px",
              backgroundColor: "var(--surface-container-highest)",
              color: "var(--primary)",
            }}
          >
            DV
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold truncate" style={{ color: "var(--on-surface)" }}>
                Dev User
              </span>
              <span className="text-[10px]" style={{ color: "var(--on-surface-variant)" }}>
                v1.2.4-stable
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
