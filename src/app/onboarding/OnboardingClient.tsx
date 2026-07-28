"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Building2, Palette, Image as ImageIcon, Check, Loader2, ArrowRight, ArrowLeft, X } from "lucide-react";
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

export function OnboardingClient({ companyId, initial, nextUrl }: { companyId: string; initial: any; nextUrl?: string }) {
  const router = useRouter();
  const tenant = useTenant();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    legalName: initial.legalName || initial.tradeName || "",
    cnpj: initial.cnpj || "",
    phone: initial.phone || "",
    address: initial.address || "",
    city: initial.city || "",
    state: initial.state || "",
    primaryColor: initial.primaryColor || "#8b5cf6",
    secondaryColor: initial.secondaryColor || "#6366f1",
    appName: initial.appName || initial.tradeName || "",
    logoUrl: initial.logoUrl || "",
  });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/logo", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro no upload");
        return;
      }
      update("logoUrl", data.url);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/onboarding/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyId, ...form }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Erro ao salvar");
          return;
        }
        // Se veio de uma página de produto (next=), volta para ela
        if (nextUrl) {
          router.push(nextUrl);
        } else {
          router.push("/dashboard?onboarding=completed");
        }
        router.refresh();
      } catch (e: any) {
        setError(e.message);
      }
    });
  };

  const totalSteps = 3;

  return (
    <div className="force-dark min-h-screen bg-[#0a0b14] text-white p-4">
      <div className="max-w-2xl mx-auto py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl brand-gradient">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Configuração inicial</h1>
              <p className="text-xs text-[#8b8fa3]">Passo {step} de {totalSteps}</p>
            </div>
          </div>
          <button onClick={() => router.push("/dashboard")} className="text-xs text-[#8b8fa3] hover:text-white inline-flex items-center gap-1">
            <X className="h-3 w-3" /> Pular por agora
          </button>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? "brand-gradient" : "bg-white/10"}`} />
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Step 1 — Dados da empresa */}
        {step === 1 && (
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-5 w-5 text-violet-300" />
              <h2 className="text-base font-semibold">Dados da empresa</h2>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Razão Social</label>
              <input value={form.legalName} onChange={(e) => update("legalName", e.target.value)} type="text" placeholder="Sua Empresa LTDA"
                className="w-full h-11 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">CNPJ</label>
              <input value={form.cnpj ? formatCnpj(form.cnpj) : ""} onChange={(e) => update("cnpj", e.target.value.replace(/\D/g, ""))} type="text" placeholder="00.000.000/0000-00" maxLength={18}
                className="w-full h-11 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Telefone</label>
                <input value={form.phone} onChange={(e) => update("phone", e.target.value)} type="text" placeholder="(11) 3000-0000"
                  className="w-full h-11 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Cidade</label>
                <input value={form.city} onChange={(e) => update("city", e.target.value)} type="text" placeholder="São Paulo"
                  className="w-full h-11 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Endereço</label>
              <input value={form.address} onChange={(e) => update("address", e.target.value)} type="text" placeholder="Rua Exemplo, 123"
                className="w-full h-11 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50" />
            </div>

            <button onClick={() => setStep(2)} className="w-full h-11 rounded-lg brand-gradient text-sm font-semibold text-white shadow-lg inline-flex items-center justify-center gap-2">
              Continuar <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 2 — Identidade visual */}
        {step === 2 && (
          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="h-5 w-5 text-violet-300" />
              <h2 className="text-base font-semibold">Identidade visual</h2>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8b8fa3] mb-2">Cores da marca</label>
              <div className="grid grid-cols-6 gap-2">
                {COLOR_PRESETS.map((p) => (
                  <button key={p.name} onClick={() => { update("primaryColor", p.primary); update("secondaryColor", p.secondary); }}
                    className={`h-10 rounded-lg transition-all ${form.primaryColor === p.primary ? "ring-2 ring-white scale-105" : "hover:scale-105"}`}
                    style={{ background: `linear-gradient(135deg, ${p.primary}, ${p.secondary})` }} title={p.name} />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Nome de exibição (appName)</label>
              <input value={form.appName} onChange={(e) => update("appName", e.target.value)} type="text" placeholder="Minha Empresa"
                className="w-full h-11 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50" />
              <p className="text-[10px] text-[#6b7280] mt-1">Aparece na sidebar e na tela de login</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8b8fa3] mb-2">Logo (opcional)</label>
              <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" onChange={handleLogoUpload} className="hidden" />
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-white/10 bg-white/5 overflow-hidden">
                  {form.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-[#6b7280]" />
                  )}
                </div>
                <button onClick={() => fileInputRef.current?.click()} disabled={uploadingLogo}
                  className="h-9 px-3 rounded-lg border border-white/10 bg-white/5 text-xs font-medium text-[#c4c8d8] hover:text-white inline-flex items-center gap-1.5 disabled:opacity-50">
                  {uploadingLogo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
                  {form.logoUrl ? "Trocar" : "Enviar"}
                </button>
                {form.logoUrl && (
                  <button onClick={() => update("logoUrl", "")} className="text-xs text-red-300 hover:text-red-200">Remover</button>
                )}
              </div>
              <p className="text-[10px] text-[#6b7280] mt-1">PNG, JPG, SVG ou WebP. Máximo 2MB.</p>
            </div>

            {/* Preview */}
            <div className="rounded-lg p-4" style={{ background: `linear-gradient(135deg, ${form.primaryColor}22, ${form.secondaryColor}22)`, border: `1px solid ${form.primaryColor}55` }}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden" style={{ background: `linear-gradient(135deg, ${form.primaryColor}, ${form.secondaryColor})` }}>
                  {form.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                  ) : (
                    <Sparkles className="h-5 w-5 text-white" />
                  )}
                </div>
                <div>
                  <div className="text-base font-bold uppercase tracking-wide" style={{ color: form.primaryColor }}>{form.appName || "Sua Empresa"}</div>
                  <div className="text-[10px] text-[#8b8fa3] uppercase tracking-[0.2em]">Prévia da marca</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="h-11 px-4 rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-[#c4c8d8] hover:text-white">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button onClick={() => setStep(3)} className="flex-1 h-11 rounded-lg brand-gradient text-sm font-semibold text-white shadow-lg inline-flex items-center justify-center gap-2">
                Continuar <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Confirmação */}
        {step === 3 && (
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Check className="h-5 w-5 text-emerald-400" />
              <h2 className="text-base font-semibold">Tudo pronto!</h2>
            </div>

            <p className="text-sm text-[#8b8fa3]">
              Sua conta está configurada com trial de <strong className="text-white">14 dias grátis</strong>.<br />
              Após esse período, você precisará assinar um plano para continuar.
            </p>

            <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[#8b8fa3]">Empresa</span><span className="text-white font-medium">{form.appName || form.legalName}</span></div>
              {form.cnpj && <div className="flex justify-between"><span className="text-[#8b8fa3]">CNPJ</span><span className="text-white font-mono text-xs">{formatCnpj(form.cnpj)}</span></div>}
              <div className="flex justify-between"><span className="text-[#8b8fa3]">Plano</span><span className="text-white font-medium">Trial (14 dias)</span></div>
              <div className="flex justify-between items-center"><span className="text-[#8b8fa3]">Cores</span>
                <div className="flex gap-1">
                  <span className="h-4 w-4 rounded" style={{ background: form.primaryColor }} />
                  <span className="h-4 w-4 rounded" style={{ background: form.secondaryColor }} />
                </div>
              </div>
              {form.logoUrl && <div className="flex justify-between items-center"><span className="text-[#8b8fa3]">Logo</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.logoUrl} alt="Logo" className="h-6 w-auto object-contain" />
              </div>}
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setStep(2)} className="h-11 px-4 rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-[#c4c8d8] hover:text-white">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button onClick={handleSave} disabled={isPending}
                className="flex-1 h-11 rounded-lg brand-gradient text-sm font-semibold text-white shadow-lg disabled:opacity-50 inline-flex items-center justify-center gap-2">
                {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</> : <><Check className="h-4 w-4" /> Concluir e acessar painel</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
