import { redirect } from "next/navigation";
import { checkCompanyLicense } from "@/lib/modules-actions";
import { prisma } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Dashboard layout — Server-side checks.
 *
 * - Super Admin: passa direto (a page.tsx envolve em DashboardShell)
 * - Usuário comum: verifica licença + onboarding
 *   - Licença inativa → redirect /bloqueada ou /planos
 *   - Onboarding pendente → redirect /onboarding
 *   - Caso contrário: passa (a page.tsx renderiza MinimalDashboard sem Sidebar)
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: {
      id: true,
      isSuperAdmin: true,
      companyId: true,
      company: { select: { onboardingCompleted: true } },
    },
  });

  if (!dbUser) redirect("/login");

  // Super Admin passa direto
  if (dbUser.isSuperAdmin) {
    return <>{children}</>;
  }

  // Usuário comum: verifica licença
  const license = await checkCompanyLicense();
  if (!license.active) {
    let target = "/planos";
    if (license.status === "trial_expired") target = "/bloqueada?reason=trial_expired";
    else if (license.status === "suspended") target = "/bloqueada?reason=suspended";
    else if (license.status === "canceled") target = "/bloqueada?reason=canceled";
    else if (license.status === "expired") target = "/bloqueada?reason=expired";
    redirect(target);
  }

  // Onboarding pendente → redirect
  if (dbUser.company && !dbUser.company.onboardingCompleted) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}
