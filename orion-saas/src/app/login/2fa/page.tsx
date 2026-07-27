"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Sparkles, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";

function TwoFactorInner() {
  const params = useSearchParams();
  const router = useRouter();
  const redirect = params.get("redirect") ?? "/dashboard";
  const email = params.get("email") ?? "";
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (token.length !== 6) {
      setError("Digite o código de 6 dígitos.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Código inválido.");
        setLoading(false);
        return;
      }
      router.push(redirect);
    } catch {
      setError("Falha de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="force-dark min-h-screen flex items-center justify-center p-4 bg-[#0f111a]">
      <div className="w-full max-w-md fade-in-up">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl brand-gradient shadow-lg shadow-violet-500/25 mb-4">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold brand-text">ORION</h1>
          <p className="text-xs uppercase tracking-[0.25em] text-muted mt-1">
            Verificação 2FA
          </p>
        </div>

        <div className="glass-card p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15">
              <ShieldCheck className="h-5 w-5 text-violet-300" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Autenticação em dois fatores</h2>
              <p className="text-xs text-muted mt-0.5">Digite o código do seu app autenticador.</p>
            </div>
          </div>

          {error && (
            <div className="mt-2 mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="token" className="block text-xs font-medium text-muted mb-1.5">
                Código de 6 dígitos
              </label>
              <input
                id="token"
                name="token"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                autoFocus
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="w-full h-14 rounded-lg bg-white/5 border border-white/10 px-3 text-center text-2xl tracking-[0.5em] font-mono text-white placeholder:text-muted/40 outline-none focus:border-violet-400/50 focus:bg-white/[0.07] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading || token.length !== 6}
              className="w-full h-11 rounded-lg brand-gradient text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:opacity-95 transition-opacity inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Verificar
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted">
            Não consegue acessar o app?{" "}
            <a href="/login" className="text-violet-300 hover:text-violet-200">
              Voltar para o login
            </a>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-muted/60">
          © {new Date().getFullYear()} Orion SaaS Platform. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}

export default function TwoFactorPage() {
  return (
    <Suspense fallback={null}>
      <TwoFactorInner />
    </Suspense>
  );
}
