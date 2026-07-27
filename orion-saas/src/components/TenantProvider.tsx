"use client";
import { createContext, useContext, type ReactNode } from "react";

export type TenantConfig = {
  id: string;
  tradeName: string;
  legalName: string;
  logoUrl: string | null;
  appName: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  subdomain: string | null;
  customDomain: string | null;
  plan: string;
};

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

const TenantContext = createContext<TenantConfig>(DEFAULT_TENANT);

export function useTenant() {
  return useContext(TenantContext);
}

export function TenantProvider({
  children,
  tenant,
}: {
  children: ReactNode;
  tenant: TenantConfig;
}) {
  return (
    <TenantContext.Provider value={tenant}>
      {children}
    </TenantContext.Provider>
  );
}
