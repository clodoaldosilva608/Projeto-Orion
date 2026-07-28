import { cookies } from "next/headers";
import { getTenantBySubdomain, type TenantConfig, DEFAULT_TENANT } from "./tenant-db";

export type { TenantConfig };
export { DEFAULT_TENANT };

export async function getCurrentTenant(): Promise<TenantConfig | null> {
  try {
    const cookieStore = await cookies();
    const subdomain = cookieStore.get("x-tenant-subdomain")?.value ?? null;
    return await getTenantBySubdomain(subdomain);
  } catch {
    return await getTenantBySubdomain(null);
  }
}
