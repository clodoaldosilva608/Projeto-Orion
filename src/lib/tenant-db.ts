import { prisma } from "./db";

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

export async function getTenantBySubdomain(subdomain: string | null): Promise<TenantConfig | null> {
  try {
    let company: any = null;

    if (subdomain) {
      company = await prisma.company.findFirst({
        where: { subdomain: { equals: subdomain, mode: "insensitive" }, deletedAt: null, active: true },
        select: { id: true, tradeName: true, legalName: true, logoUrl: true, appName: true, primaryColor: true, secondaryColor: true, backgroundColor: true, subdomain: true, customDomain: true, plan: true },
      });
    }

    if (!company) {
      company = await prisma.company.findFirst({
        where: { id: 1n, deletedAt: null },
        select: { id: true, tradeName: true, legalName: true, logoUrl: true, appName: true, primaryColor: true, secondaryColor: true, backgroundColor: true, subdomain: true, customDomain: true, plan: true },
      });
    }

    if (!company) {
      company = await prisma.company.findFirst({
        where: { deletedAt: null, active: true },
        select: { id: true, tradeName: true, legalName: true, logoUrl: true, appName: true, primaryColor: true, secondaryColor: true, backgroundColor: true, subdomain: true, customDomain: true, plan: true },
      });
    }

    if (!company) return null;
    return { ...company, id: company.id.toString(), plan: company.plan as string };
  } catch (e) {
    console.error("[tenant] Error:", e);
    return null;
  }
}

export const DEFAULT_TENANT: TenantConfig = {
  id: "1", tradeName: "Orion", legalName: "Orion Platform", logoUrl: null,
  appName: "Orion", primaryColor: "#8b5cf6", secondaryColor: "#6366f1",
  backgroundColor: "#0f111a", subdomain: null, customDomain: null, plan: "free",
};
