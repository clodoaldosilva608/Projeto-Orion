import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase";
import { OnboardingClient } from "./OnboardingClient";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

async function getCurrentUserCompany() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: {
      id: true,
      isSuperAdmin: true,
      companyId: true,
      company: {
        select: {
          id: true, tradeName: true, legalName: true, cnpj: true, phone: true,
          address: true, city: true, state: true,
          primaryColor: true, secondaryColor: true, appName: true, logoUrl: true,
          onboardingCompleted: true,
        },
      },
    },
  });
  return dbUser;
}

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const user = await getCurrentUserCompany();
  if (!user) redirect("/login?redirect=/onboarding");

  // Super Admin não precisa de onboarding
  if (user.isSuperAdmin) redirect(next || "/dashboard");

  // Se já completou, vai direto pro next ou dashboard
  if (user.company?.onboardingCompleted) redirect(next || "/dashboard");

  return <OnboardingClient companyId={user.companyId.toString()} initial={user.company || {}} nextUrl={next} />;
}
