"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

function LoginInner() {
  const params = useSearchParams();
  const error = params.get("error");
  const redirect = params.get("redirect") ?? "/dashboard";
  const [loading, setLoading] = useState(false);
  const [appName, setAppName] = useState("ORION");
  const [tradeName, setTradeName] = useState("SaaS Platform");

  useEffect(() => {
    fetch("/api/tenant")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.appName) setAppName(d.appName.toUpperCase());
        if (d?.tradeName) setTradeName(d.tradeName);
      })
      .catch(() => {});
  }, []);

  return (
    // force-dark: login page is always dark (per spec) regardless of theme toggle
    <div className="force-dark min-h-screen flex items-center justify-center p-4 bg-[#0f111a]">
      <div className="w-full max-w-md fade-in-up">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl brand-gradient shadow-lg shadow-violet-500/25 mb-4">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold brand-text">{appName}</h1>
          <p className="text-xs uppercase tracking-[0.25em] text-muted mt-1">
            {tradeName}
          </p>
        </div>

        <div className="glass-card p-6 lg:p-8">
          <h2 className="text-lg font-semibold text-white">Acessar painel</h2>
          <p className="text-sm text-muted mt-1">
            Entre com suas credenciais de administrador.
          </p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
              {error}
            </div>
          )}

          <form
            action="/api/auth/login"
            method="POST"
            className="mt-6 space-y-4"
            onSubmit={() => setLoading(true)}
          >
            <input type="hidden" name="redirect" value={redirect} />

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-muted mb-1.5"
              >
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  defaultValue="clodoaldosilva608@gmail.com"
                  placeholder="voce@empresa.com"
                  className="w-full h-11 rounded-lg bg-white/5 border border-white/10 pl-10 pr-3 text-sm text-white placeholder:text-muted/60 outline-none focus:border-violet-400/50 focus:bg-white/[0.07] transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-muted mb-1.5"
              >
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  defaultValue="Silva88677488"
                  placeholder="••••••••"
                  className="w-full h-11 rounded-lg bg-white/5 border border-white/10 pl-10 pr-3 text-sm text-white placeholder:text-muted/60 outline-none focus:border-violet-400/50 focus:bg-white/[0.07] transition-colors"
                />
              </div>
            </div>

            <button
              id="btn-login"
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg brand-gradient text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:opacity-95 transition-opacity inline-flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Entrar
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted">
            Esqueceu sua senha?{" "}
            <a href="#" className="text-violet-300 hover:text-violet-200">
              Recuperar acesso
            </a>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-muted/60">
          © {new Date().getFullYear()} Orion SaaS Platform. Todos os direitos
          reservados.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
