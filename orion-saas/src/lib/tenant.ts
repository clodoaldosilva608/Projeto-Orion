/**
 * Tenant Resolver — SaaS Multi-Tenant
 *
 * Reads the `x-tenant-subdomain` COOKIE (set by proxy.ts) and resolves
 * the Company (tenant) from the database. Falls back to the default
 * tenant (PagueMenos, id=1) when no subdomain is detected.
 *
 * NOTE: We use cookies instead of request headers because modifying
 * request headers in Next.js 16 proxy breaks cookie forwarding,
 * causing session loss on page navigation.
 */
import { prisma } from "./db";
import { cookies } from "next/headers";

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

export async function getCurrentTenant(): Promise<TenantConfig | null> {
  try {
    const cookieStore = await cookies();
    const subdomain = cookieStore.get("x-tenant-subdomain")?.value ?? null;

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

    return {
      ...company,
      id: company.id.toString(),
      plan: company.plan as string,
    };
  } catch (e) {
    console.error("[tenant] Error resolving tenant:", e);
    return null;
  }
}

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
