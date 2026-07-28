"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TenantProvider, type TenantConfig } from "@/components/TenantProvider";

export function DashboardLayoutClient({
  children,
  tenant,
}: {
  children: React.ReactNode;
  tenant: TenantConfig;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <TenantProvider tenant={tenant}>
      <ThemeProvider>
        <div className="min-h-screen flex">
          <Sidebar
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((v) => !v)}
            mobileOpen={mobileOpen}
            onCloseMobile={() => setMobileOpen(false)}
          />
          <div className="flex-1 flex flex-col min-w-0">
            <Header onOpenMobile={() => setMobileOpen(true)} />
            <main className="flex-1 p-4 lg:p-6">{children}</main>
          </div>
        </div>
      </ThemeProvider>
    </TenantProvider>
  );
}
