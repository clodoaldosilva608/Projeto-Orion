import Link from "next/link";
import { CheckCircle2, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SucessoPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const email = params.email || "";
  const company = params.company || "";

  return (
    <div className="min-h-screen bg-[#0a0b14] text-white flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-emerald-500/15 mb-6">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Pagamento aprovado!</h1>
        <p className="text-sm text-[#8b8fa3] mb-6">
          Sua instância da plataforma está sendo configurada.
          {company && <> Empresa: <strong className="text-white">{company}</strong></>}
          {email && <> · E-mail: <strong className="text-white">{email}</strong></>}
        </p>
        <div className="glass-card p-5 text-left space-y-3 mb-6">
          <div className="flex items-start gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/15 text-violet-300 text-xs font-bold shrink-0">1</span>
            <p className="text-xs text-[#c4c8d8]">Nossa equipe está criando sua instância com subdomínio próprio.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/15 text-violet-300 text-xs font-bold shrink-0">2</span>
            <p className="text-xs text-[#c4c8d8]">Você receberá um e-mail com suas credenciais de acesso em até 24h.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/15 text-violet-300 text-xs font-bold shrink-0">3</span>
            <p className="text-xs text-[#c4c8d8]">Acesse sua instância e comece a usar imediatamente.</p>
          </div>
        </div>
        <Link href="/"
          className="inline-flex items-center gap-2 h-11 px-6 rounded-lg brand-gradient text-sm font-semibold text-white">
          <Sparkles className="h-4 w-4" />
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
