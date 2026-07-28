"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TenantProvider, type TenantConfig } from "@/components/TenantProvider";

const DEFAULT_TENANT: TenantConfig = {
  id: "1",
  tradeName: "Orion",
  legalName: "Orion Platform",
  logoUrl: null,
  appName: "Orion",
  primaryColor: "#8b5cf6",
  secondaryColor: "#6366f1",
  backgroundColor: "#0f111a",
  subdomain: null,
  customDomain: null,
  plan: "free",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tenant, setTenant] = useState<TenantConfig>(DEFAULT_TENANT);

  useEffect(() => {
    fetch("/api/tenant")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.appName) setTenant(data);
      })
      .catch(() => {});
  }, []);

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
