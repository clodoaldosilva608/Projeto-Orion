/**
 * Tenant Resolver — SaaS Multi-Tenant
 *
 * Reads the `x-tenant-subdomain` header (set by proxy.ts) and resolves
 * the Company (tenant) from the database. Falls back to the default
 * tenant (PagueMenos, id=1) when no subdomain is detected.
 *
 * Used by:
 *   - Root layout (white-label CSS injection)
 *   - Login page (tenant-specific branding)
 *   - Sidebar (appName, logoUrl)
 *   - Server components (companyId for data isolation)
 */
import { prisma } from "./db";
import { headers } from "next/headers";

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

let cachedTenant: TenantConfig | null = null;
let cachedSubdomain: string | null | undefined = undefined;

export async function getCurrentTenant(): Promise<TenantConfig | null> {
  // In Next.js, headers() is async and cached per request, so this is safe
  const headerStore = await headers();
  const subdomain = headerStore.get("x-tenant-subdomain");
  const hostname = headerStore.get("x-tenant-hostname");

  // Return cached if same request
  if (cachedSubdomain === subdomain && cachedTenant) {
    return cachedTenant;
  }

  try {
    let company: any = null;

    // Try by subdomain first
    if (subdomain) {
      company = await prisma.company.findFirst({
        where: {
          subdomain: { equals: subdomain, mode: "insensitive" },
          deletedAt: null,
          active: true,
        },
        select: {
          id: true, tradeName: true, legalName: true, logoUrl: true,
          appName: true, primaryColor: true, secondaryColor: true,
          backgroundColor: true, subdomain: true, customDomain: true,
          plan: true,
        },
      });
    }

    // Try by custom domain (hostname)
    if (!company && hostname) {
      company = await prisma.company.findFirst({
        where: {
          customDomain: { equals: hostname, mode: "insensitive" },
          deletedAt: null,
          active: true,
        },
        select: {
          id: true, tradeName: true, legalName: true, logoUrl: true,
          appName: true, primaryColor: true, secondaryColor: true,
          backgroundColor: true, subdomain: true, customDomain: true,
          plan: true,
        },
      });
    }

    // Fall back to default tenant (id=1, PagueMenos)
    if (!company) {
      company = await prisma.company.findFirst({
        where: { id: 1n, deletedAt: null },
        select: {
          id: true, tradeName: true, legalName: true, logoUrl: true,
          appName: true, primaryColor: true, secondaryColor: true,
          backgroundColor: true, subdomain: true, customDomain: true,
          plan: true,
        },
      });
    }

    // Absolute fallback — first active company
    if (!company) {
      company = await prisma.company.findFirst({
        where: { deletedAt: null, active: true },
        select: {
          id: true, tradeName: true, legalName: true, logoUrl: true,
          appName: true, primaryColor: true, secondaryColor: true,
          backgroundColor: true, subdomain: true, customDomain: true,
          plan: true,
        },
      });
    }

    if (!company) return null;

    cachedSubdomain = subdomain;
    cachedTenant = {
      ...company,
      id: company.id.toString(),
      plan: company.plan as string,
    };
    return cachedTenant;
  } catch (e) {
    console.error("[tenant] Error resolving tenant:", e);
    return null;
  }
}

/**
 * Get default tenant config (used when DB is unavailable, e.g., during build)
 */
export const DEFAULT_TENANT: TenantConfig = {
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
