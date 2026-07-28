import { getTenantBySubdomain, DEFAULT_TENANT } from "@/lib/tenant-db";
import { DashboardLayoutClient } from "./DashboardLayoutClient";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getTenantBySubdomain(null) ?? DEFAULT_TENANT;

  return (
    <DashboardLayoutClient tenant={tenant}>
      {children}
    </DashboardLayoutClient>
  );
}
