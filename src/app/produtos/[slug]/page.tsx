import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase";
import { Check, ShoppingCart, ExternalLink, ArrowLeft, Download, Sparkles, Shield, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

type Product = {
  id: bigint;
  name: string;
  slug: string;
  description: string | null;
  repoUrl: string | null;
  demoUrl: string | null;
  category: string;
  priceCents: number;
  status: string;
  features: unknown;
  iconColor: string;
};

function readFeatures(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((x): x is string => typeof x === "string");
  return [];
}

const CATEGORY_LABELS: Record<string, string> = {
  gestao_comercial: "Gestão Comercial",
  saude: "Saúde",
  financas: "Finanças",
  educacao: "Educação",
  fitness: "Fitness",
  logistica: "Logística",
  varejo: "Varejo",
  ia_dados: "IA & Dados",
};

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { id: true, isSuperAdmin: true, companyId: true },
  });
  return dbUser;
}

export default async function ProdutoDetalhePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } }) as Product | null;
  if (!product) notFound();

  const features = readFeatures(product.features);
  const user = await getCurrentUser();

  // Determina tipo de produto (assinatura ou compra única)
  // Se priceCents >= 10000 (R$ 100+), é assinatura; senão é compra única
  const isSubscription = product.priceCents >= 10000;
  const ctaText = isSubscription ? "Assinar agora" : "Comprar agora";
  const ctaIcon = isSubscription ? <ShoppingCart className="h-4 w-4" /> : <Download className="h-4 w-4" />;

  return (
    <div className="min-h-screen bg-[#0a0b14] text-white">
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/produtos" className="inline-flex items-center gap-2 text-sm text-[#8b8fa3] hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Catálogo
          </Link>
          <span className="text-sm font-bold brand-text">ORION</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Hero do produto */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-md bg-violet-500/15 text-violet-300">
                {CATEGORY_LABELS[product.category] || product.category}
              </span>
              {isSubscription && (
                <span className="text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300">
                  Assinatura mensal
                </span>
              )}
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">{product.name}</h1>
            <p className="text-sm text-[#8b8fa3] leading-relaxed mb-6">
              {product.description || "Solução completa para sua empresa."}
            </p>

            {/* Features */}
            <div className="space-y-2 mb-6">
              {features.map((f) => (
                <div key={f} className="flex items-start gap-2 text-sm text-[#c4c8d8]">
                  <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" /> {f}
                </div>
              ))}
            </div>

            {/* Preço + CTA */}
            <div className="glass-card p-5">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold text-white">{formatBRL(product.priceCents)}</span>
                {isSubscription && <span className="text-sm text-[#8b8fa3]">/mês</span>}
              </div>
              <p className="text-xs text-[#8b8fa3] mb-4">
                {isSubscription
                  ? "Cancele quando quiser. 14 dias grátis sem cartão."
                  : "Pagamento único. Acesso vitalício."}
              </p>

              {user ? (
                // Logado → vai direto para checkout
                <Link
                  href={`/produtos/${product.slug}/comprar`}
                  className="w-full h-12 rounded-lg brand-gradient text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:opacity-95 inline-flex items-center justify-center gap-2"
                >
                  {ctaIcon} {ctaText}
                </Link>
              ) : (
                // Não logado → vai para signup com produto selecionado
                // O produto é habilitado automaticamente no signup (register API
                // cria EnabledModule baseado no productSlug)
                // Após signup → onboarding → dashboard (com produto já ativo)
                <Link
                  href={`/signup?produto=${product.slug}`}
                  className="w-full h-12 rounded-lg brand-gradient text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:opacity-95 inline-flex items-center justify-center gap-2"
                >
                  {ctaIcon} {ctaText}
                </Link>
              )}

              {product.demoUrl && (
                <a
                  href={product.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full h-10 rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-[#c4c8d8] hover:text-white inline-flex items-center justify-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" /> Ver demonstração
                </a>
              )}
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="glass-card p-8 h-full flex items-center justify-center min-h-[300px]">
              <div
                className="flex h-24 w-24 items-center justify-center rounded-3xl text-4xl font-bold text-white shadow-2xl"
                style={{ background: `linear-gradient(135deg, ${product.iconColor}, ${product.iconColor}cc)` }}
              >
                {product.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Como funciona */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Como funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl brand-gradient mb-2">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">1. Assine ou compre</h3>
              <p className="text-xs text-[#8b8fa3]">Escolha o plano e faça o cadastro da sua empresa</p>
            </div>
            <div className="text-center">
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl brand-gradient mb-2">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">2. Configure sua conta</h3>
              <p className="text-xs text-[#8b8fa3]">Dados da empresa, cores da marca e primeiro usuário admin</p>
            </div>
            <div className="text-center">
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl brand-gradient mb-2">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">3. Comece a usar</h3>
              <p className="text-xs text-[#8b8fa3]">Acesse seu painel e use no PC ou celular com suas credenciais</p>
            </div>
          </div>
        </div>

        {/* FAQ simplificado */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Perguntas frequentes</h2>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-white">Preciso de cartão de crédito?</p>
              <p className="text-xs text-[#8b8fa3] mt-0.5">Não. Você tem 14 dias grátis sem cartão. Só precisa assinar após o trial.</p>
            </div>
            <div>
              <p className="font-medium text-white">Posso usar no PC e celular?</p>
              <p className="text-xs text-[#8b8fa3] mt-0.5">Sim! Faça login com as mesmas credenciais em qualquer dispositivo.</p>
            </div>
            <div>
              <p className="font-medium text-white">Meus dados estão seguros?</p>
              <p className="text-xs text-[#8b8fa3] mt-0.5">Sim. Cada empresa tem dados 100% isolados (multi-tenant). Conforme LGPD.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
