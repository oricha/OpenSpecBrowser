"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopAppBar } from "./TopAppBar";

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
  icon?: string;
  subtitle?: string;
  topbarActions?: React.ReactNode;
}

export function MainLayout({ children, title, icon, subtitle, topbarActions }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      <main
        className="flex flex-col min-h-screen transition-[margin] duration-300 ease-out"
        style={{ marginLeft: 0, paddingLeft: 0 }}
      >
        <div
          className="hidden md:block transition-[padding] duration-300 ease-out"
          style={{ paddingLeft: collapsed ? "64px" : "256px" }}
        >
          <TopAppBar title={title} icon={icon} subtitle={subtitle} actions={topbarActions} />
          <div style={{ backgroundColor: "var(--background)" }}>{children}</div>
        </div>

        <div className="md:hidden">
          <TopAppBar title={title} icon={icon} subtitle={subtitle} actions={topbarActions} />
          <div style={{ backgroundColor: "var(--background)" }}>{children}</div>
        </div>
      </main>
    </div>
  );
}
