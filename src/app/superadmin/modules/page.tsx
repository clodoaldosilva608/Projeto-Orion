import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Boxes, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase";
import { listCompaniesWithModulesAction } from "@/lib/modules-actions";
import { AVAILABLE_MODULES } from "@/lib/modules-catalog";
import { ModulesPanel } from "./ModulesPanel";

export const dynamic = "force-dynamic";

async function checkSuperAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { id: true, isSuperAdmin: true, name: true, email: true },
  });
  if (!dbUser || !dbUser.isSuperAdmin) return null;
  return dbUser;
}

export default async function SuperAdminModulesPage() {
  const admin = await checkSuperAdmin();
  if (!admin) {
    redirect("/login?error=Acesso+restrito+ao+Super+Admin");
  }

  const { data: companies } = await listCompaniesWithModulesAction();

  return (
    <div className="min-h-screen bg-[#0a0b14] text-white p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl brand-gradient shadow-lg">
              <Boxes className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Gestão de Módulos</h1>
              <p className="text-xs text-[#8b8fa3]">
                {admin.name} · Ative ou desative módulos para cada empresa
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/superadmin"
              className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-white/10 bg-white/5 text-xs font-medium text-[#c4c8d8] hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-white/10 bg-white/5 text-xs font-medium text-[#c4c8d8] hover:text-white"
            >
              ← Painel
            </Link>
          </div>
        </div>

        {/* Info Banner */}
        <div className="glass-card p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-violet-300 shrink-0 mt-0.5" />
            <div className="text-xs text-[#c4c8d8]">
              <strong className="text-white">Como funciona:</strong> Cada empresa
              (tenant) pode ter módulos específicos habilitados. Módulos desabilitados
              ficam invisíveis no painel do cliente. Quando um cliente compra uma
              assinatura via Stripe, os módulos do plano são ativados automaticamente.
            </div>
          </div>
        </div>

        {/* Companies + Modules */}
        {companies && companies.length > 0 ? (
          <ModulesPanel companies={companies as any} />
        ) : (
          <div className="glass-card p-10 text-center">
            <p className="text-sm text-[#8b8fa3]">
              Nenhuma empresa cadastrada. Crie empresas pelo painel{" "}
              <Link href="/superadmin" className="text-violet-300 underline">
                Super Admin
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
