"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sparkles, Mail, Lock, User, Building2, Loader2, Check, ArrowRight, Palette } from "lucide-react";
import { useTenant } from "@/components/TenantProvider";
import { formatCnpj } from "@/lib/cnpj";

const COLOR_PRESETS = [
  { name: "Violeta", primary: "#8b5cf6", secondary: "#6366f1" },
  { name: "Vermelho", primary: "#DC2626", secondary: "#EF4444" },
  { name: "Azul", primary: "#3b82f6", secondary: "#06b3d4" },
  { name: "Verde", primary: "#10b981", secondary: "#34d399" },
  { name: "Laranja", primary: "#f59e0b", secondary: "#fb923c" },
  { name: "Rosa", primary: "#ec4899", secondary: "#f472b6" },
];

export function SignupClient() {
  const router = useRouter();
  const params = useSearchParams();
  const tenant = useTenant();
  const presetProduct = params.get("produto") || "projeto-paguemenos";
  const nextUrl = params.get("next"); // ex: /produtos/x/comprar

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    cnpj: "",
    primaryColor: "#8b5cf6",
    secondaryColor: "#6366f1",
    productSlug: presetProduct,
  });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    setError(null);
    if (!form.name || !form.email || !form.password || !form.companyName) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }
    if (form.password.length < 6) {
      setError("Senha deve ter ao menos 6 caracteres");
      return;
    }
    if (!acceptedTerms) {
      setError("Você precisa aceitar os Termos de Uso");
      return;
    }

    // Limpa CNPJ parcial — se não tem 14 dígitos, envia vazio (é opcional)
    const sanitizedCnpj = form.cnpj.replace(/\D/g, "");
    const payload = sanitizedCnpj.length === 14 || sanitizedCnpj.length === 0
      ? { ...form, cnpj: sanitizedCnpj }
      : { ...form, cnpj: "" }; // parcial → ignora

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Erro ao criar conta");
          return;
        }
        // Login automático após registro
        const loginRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            email: form.email,
            password: form.password,
            redirect: nextUrl || "/dashboard",
          }).toString(),
        });
        if (loginRes.ok) {
          // dashboard/layout.tsx vai redirecionar para /onboarding se necessário
          // Após onboarding, volta para nextUrl ou /dashboard
          if (nextUrl) {
            router.push(nextUrl);
          } else {
            router.push("/dashboard");
          }
        } else {
          router.push(`/login?registered=1&email=${encodeURIComponent(form.email)}`);
        }
      } catch (e: any) {
        setError(e.message);
      }
    });
  };

  return (
    <div className="force-dark min-h-screen flex items-center justify-center p-4 bg-[#0f111a]">
      <div className="w-full max-w-md fade-in-up">
        {/* Brand */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl brand-gradient shadow-lg shadow-violet-500/25 mb-3">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold brand-text uppercase tracking-wide">{tenant.appName}</h1>
          <p className="text-xs uppercase tracking-[0.25em] text-muted mt-1">14 dias grátis</p>
        </div>

        <div className="glass-card p-6 lg:p-8">
          <h2 className="text-lg font-semibold text-white">Criar minha conta</h2>
          <p className="text-sm text-muted mt-1">
            {step === 1 ? "Comece seu trial de 14 dias. Sem cartão." : "Personalize sua instância"}
          </p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
              {error}
            </div>
          )}

          {step === 1 ? (
            <div className="mt-6 space-y-4">
              <Field label="Seu nome" icon={<User className="h-4 w-4" />}>
                <input value={form.name} onChange={(e) => update("name", e.target.value)} type="text" required placeholder="João Silva"
                  className="input-base" />
              </Field>
              <Field label="Email" icon={<Mail className="h-4 w-4" />}>
                <input value={form.email} onChange={(e) => update("email", e.target.value)} type="email" required placeholder="voce@empresa.com"
                  className="input-base" />
              </Field>
              <Field label="Senha" icon={<Lock className="h-4 w-4" />}>
                <input value={form.password} onChange={(e) => update("password", e.target.value)} type="password" required placeholder="Mínimo 6 caracteres"
                  className="input-base" />
              </Field>
              <Field label="Nome da empresa" icon={<Building2 className="h-4 w-4" />}>
                <input value={form.companyName} onChange={(e) => update("companyName", e.target.value)} type="text" required placeholder="Ex: Padaria Bom Pão"
                  className="input-base" />
              </Field>
              <Field label="CNPJ (opcional)" icon={<Building2 className="h-4 w-4" />}>
                <input value={form.cnpj} onChange={(e) => update("cnpj", formatCnpj(e.target.value))} type="text" placeholder="00.000.000/0000-00"
                  className="input-base" maxLength={18} />
              </Field>

              <button onClick={() => setStep(2)} disabled={!form.name || !form.email || !form.password || !form.companyName}
                className="w-full h-11 rounded-lg brand-gradient text-sm font-semibold text-white shadow-lg disabled:opacity-50 inline-flex items-center justify-center gap-2">
                Continuar <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              <div>
                <label className="block text-xs font-medium text-muted mb-2 flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5" /> Cor da sua marca
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {COLOR_PRESETS.map((p) => (
                    <button key={p.name} onClick={() => { update("primaryColor", p.primary); update("secondaryColor", p.secondary); }}
                      className={`h-10 rounded-lg transition-all ${form.primaryColor === p.primary ? "ring-2 ring-white scale-105" : "hover:scale-105"}`}
                      style={{ background: `linear-gradient(135deg, ${p.primary}, ${p.secondary})` }}
                      title={p.name} />
                  ))}
                </div>
              </div>

              <div className="rounded-lg p-3" style={{ background: `linear-gradient(135deg, ${form.primaryColor}22, ${form.secondaryColor}22)`, border: `1px solid ${form.primaryColor}55` }}>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md text-white font-bold" style={{ background: `linear-gradient(135deg, ${form.primaryColor}, ${form.secondaryColor})` }}>
                    {form.companyName.charAt(0).toUpperCase() || "E"}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{form.companyName || "Sua Empresa"}</div>
                    <div className="text-[10px] text-muted">Prévia da sua marca</div>
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-2 text-xs text-muted cursor-pointer">
                <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 accent-violet-500" />
                <span>
                  Aceito os <Link href="/termos" target="_blank" className="text-violet-300 underline">Termos de Uso</Link> e a <Link href="/privacidade" target="_blank" className="text-violet-300 underline">Política de Privacidade</Link>
                </span>
              </label>

              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="h-11 px-4 rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-[#c4c8d8] hover:text-white">
                  Voltar
                </button>
                <button onClick={handleSubmit} disabled={isPending || !acceptedTerms}
                  className="flex-1 h-11 rounded-lg brand-gradient text-sm font-semibold text-white shadow-lg disabled:opacity-50 inline-flex items-center justify-center gap-2">
                  {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Criando conta...</> : <><Check className="h-4 w-4" /> Ativar trial 14 dias</>}
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-white/[0.06] text-center">
            <p className="text-xs text-muted">
              Já tem conta?{" "}
              <Link href="/login" className="text-violet-300 hover:text-violet-200 underline">Entrar</Link>
            </p>
          </div>
        </div>

        <p className="text-[10px] text-center text-[#6b7280] mt-4">
          ✓ Sem cartão de crédito &nbsp; ✓ Cancele quando quiser &nbsp; ✓ Dados 100% isolados
        </p>
      </div>

      <style jsx>{`
        .input-base {
          width: 100%;
          height: 2.75rem;
          border-radius: 0.5rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 0 0.75rem 0 2.25rem;
          font-size: 0.875rem;
          color: white;
          outline: none;
        }
        .input-base:focus { border-color: rgba(139,92,246,0.5); }
        .input-base::placeholder { color: #6b7280; }
      `}</style>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-1.5">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">{icon}</div>
        {children}
      </div>
    </div>
  );
}
