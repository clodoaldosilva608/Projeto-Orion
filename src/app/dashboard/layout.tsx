import { redirect } from "next/navigation";
import { checkCompanyLicense } from "@/lib/modules-actions";
import { DashboardShell } from "./DashboardShell";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

/**
 * Dashboard layout — Server-side license + onboarding check.
 *
 * 1. Verifica se usuário está autenticado (proxy já garantiu cookie)
 * 2. Verifica status da licença:
 *    - trial/trial_expired → /bloqueada
 *    - suspended/canceled → /bloqueada
 *    - no_license → /planos
 * 3. Super Admin sempre passa
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const license = await checkCompanyLicense();

  if (!license.active) {
    let target = "/planos";

    if (license.status === "trial_expired") {
      target = "/bloqueada?reason=trial_expired";
    } else if (license.status === "suspended") {
      target = "/bloqueada?reason=suspended";
    } else if (license.status === "canceled") {
      target = "/bloqueada?reason=canceled";
    } else if (license.status === "expired") {
      target = "/bloqueada?reason=expired";
    } else if (license.status === "no_license") {
      target = "/planos?reason=no_license";
    }

    console.log(`[dashboard] License check failed — status: ${license.status}, redirecting to ${target}`);
    redirect(target);
  }

  return <DashboardShell>{children}</DashboardShell>;
}
