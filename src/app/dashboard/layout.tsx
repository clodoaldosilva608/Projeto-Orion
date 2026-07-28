import { redirect } from "next/navigation";
import { checkCompanyLicense } from "@/lib/modules-actions";
import { DashboardShell } from "./DashboardShell";

export const dynamic = "force-dynamic";

/**
 * Dashboard layout — Server-side license check.
 *
 * Antes de renderizar qualquer página dentro de /dashboard, verificamos:
 *  1. Usuário autenticado (já garantido pelo proxy)
 *  2. Empresa ativa
 *  3. Licença status === 'active' e não expirada
 *
 * Se a licença não estiver ativa, redireciona para /planos (cobrança).
 * Super Admin sempre passa (pode administrar mesmo sem licença).
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const license = await checkCompanyLicense();

  if (!license.active) {
    console.log(
      `[dashboard] License check failed for user — reason: ${license.reason}`
    );
    redirect("/planos?reason=license_inactive");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
