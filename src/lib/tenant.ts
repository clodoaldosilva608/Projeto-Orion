import { headers } from "next/headers";
import { getTenantBySubdomain, type TenantConfig, DEFAULT_TENANT } from "./tenant-db";

export type { TenantConfig };
export { DEFAULT_TENANT };

export async function getCurrentTenant(): Promise<TenantConfig | null> {
  try {
    const headerStore = await headers();
    // Proxy injeta o subdomain como header, não cookie
    const subdomain = headerStore.get("x-tenant-subdomain") ?? null;
    return await getTenantBySubdomain(subdomain);
  } catch {
    return await getTenantBySubdomain(null);
  }
}
