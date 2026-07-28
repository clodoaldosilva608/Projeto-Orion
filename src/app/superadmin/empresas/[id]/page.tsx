import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase";
import { getCompanyDetailAction } from "@/lib/superadmin-actions";
import { CompanyDetailClient } from "./CompanyDetailClient";

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

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await checkSuperAdmin();
  if (!admin) redirect("/login?error=Acesso+restrito+ao+Super+Admin");

  const { id } = await params;
  const { data: company, error } = await getCompanyDetailAction(id);

  if (error || !company) {
    return (
      <div className="min-h-screen bg-[#0a0b14] text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-[#8b8fa3]">{error || "Empresa não encontrada"}</p>
          <Link href="/superadmin" className="mt-4 inline-flex items-center gap-2 text-xs text-violet-300">
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0b14] text-white p-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl brand-gradient">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Detalhes da Empresa</h1>
              <p className="text-xs text-[#8b8fa3]">Gerencie licença, trial e status</p>
            </div>
          </div>
          <Link href="/superadmin" className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-white/10 bg-white/5 text-xs font-medium text-[#c4c8d8] hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar à lista
          </Link>
        </div>

        <CompanyDetailClient company={company as any} />
      </div>
    </div>
  );
}
