import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createCheckoutSession, type PlanSlug } from "@/lib/stripe";
import { Check, ShoppingCart, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ComprarPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) notFound();

  const features = Array.isArray(product.features) ? product.features.filter((x): x is string => typeof x === "string") : [];

  // Map product price to a Stripe plan
  const planMap: Record<number, PlanSlug> = {
    9900: "starter",
    29900: "pro",
    49900: "enterprise",
  };
  const plan = planMap[product.priceCents] || "starter";

  async function handlePurchase(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").trim();
    const companyName = String(formData.get("companyName") ?? "").trim();
    if (!email || !companyName) return;

    const result = await createCheckoutSession({
      plan,
      customerEmail: email,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://orion-saas-platform.vercel.app"}/produtos/${slug}/sucesso?email=${encodeURIComponent(email)}&company=${encodeURIComponent(companyName)}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://orion-saas-platform.vercel.app"}/produtos/${slug}/comprar`,
    });

    if (result.url) {
      redirect(result.url);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0b14] text-white">
      <header className="border-b border-white/5 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/produtos" className="inline-flex items-center gap-2 text-sm text-[#8b8fa3] hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <span className="text-sm font-bold brand-text">ORION</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl brand-gradient mb-4">
            <ShoppingCart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Adquirir {product.name}</h1>
          <p className="text-sm text-[#8b8fa3] mt-2">
            Você receberá sua própria instância com subdomínio, personalização de marca e dados isolados.
          </p>
        </div>

        <div className="glass-card p-6 mb-6">
          <h3 className="text-sm font-semibold text-white mb-3">O que está incluído:</h3>
          <ul className="space-y-2">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-[#c4c8d8]">
                <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" /> {f}
              </li>
            ))}
            <li className="flex items-start gap-2 text-sm text-[#c4c8d8]">
              <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" /> Subdomínio próprio (suaempresa.orion-saas-platform.vercel.app)
            </li>
            <li className="flex items-start gap-2 text-sm text-[#c4c8d8]">
              <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" /> Personalização de cores e logo
            </li>
            <li className="flex items-start gap-2 text-sm text-[#c4c8d8]">
              <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" /> Dados 100% isolados (multi-tenant)
            </li>
            <li className="flex items-start gap-2 text-sm text-[#c4c8d8]">
              <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" /> Suporte e atualizações inclusos
            </li>
          </ul>
        </div>

        <form action={handlePurchase} className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white">Seus dados</h3>
          <div>
            <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Nome da empresa *</label>
            <input name="companyName" required type="text" placeholder="Ex: Padaria Bom Pão"
              className="w-full h-11 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">E-mail do responsável *</label>
            <input name="email" required type="email" placeholder="voce@empresa.com"
              className="w-full h-11 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50" />
          </div>
          <div className="pt-2 border-t border-white/[0.06]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[#8b8fa3]">Valor da implantação</span>
              <span className="text-2xl font-bold text-white">
                {(product.priceCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>
            <button type="submit"
              className="w-full h-12 rounded-lg brand-gradient text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:opacity-95 inline-flex items-center justify-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Pagar e ativar minha instância
            </button>
            <p className="text-[10px] text-[#6b7280] text-center mt-2">
              Pagamento processado via Stripe. Você será redirecionado para o checkout seguro.
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}
