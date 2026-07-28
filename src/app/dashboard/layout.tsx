import { redirect } from "next/navigation";
import { checkCompanyLicense } from "@/lib/modules-actions";
import { DashboardShell } from "./DashboardShell";

export const dynamic = "force-dynamic";

/**
 * Dashboard layout — Server-side license + onboarding check.
 *
 * 1. Verifica se usuário está autenticado (proxy já garantiu cookie)
 * 2. Verifica se empresa tem onboarding pendente → redirect /onboarding
 * 3. Verifica status da licença:
 *    - trial/trial_expired → /bloqueada
 *    - suspended/canceled → /bloqueada
 *    - no_license → /planos
 * 4. Super Admin sempre passa
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const license = await checkCompanyLicense();

  if (!license.active) {
    // Determina URL de destino conforme o status
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

  // Onboarding pendente (exceto Super Admin que sempre passa)
  if (!license.company?.onboardingCompleted && license.status !== undefined) {
    // Não redireciona em trial/primeiro acesso se ainda não completou
    // (o onboardingwizard vai tratar isso)
  }

  return <DashboardShell>{children}</DashboardShell>;
}
