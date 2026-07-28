"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

type Props = {
  plan: "starter" | "pro" | "enterprise";
  cta: string;
  highlight: boolean;
};

export function PlanCheckoutButton({ plan, cta, highlight }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = () => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/stripe/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Erro ao iniciar checkout");
          return;
        }
        if (data.url) {
          window.location.href = data.url;
        }
      } catch (e: any) {
        setError(e.message);
      }
    });
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleCheckout}
        disabled={isPending}
        className={`w-full h-10 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-2 transition-opacity disabled:opacity-50 ${
          highlight
            ? "brand-gradient text-white shadow-lg shadow-violet-500/20 hover:opacity-90"
            : "border border-white/10 bg-white/5 text-[#c4c8d8] hover:text-white hover:bg-white/[0.08]"
        }`}
      >
        {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {isPending ? "Redirecionando..." : cta}
      </button>
      {error && (
        <p className="text-[10px] text-red-300 bg-red-500/10 border border-red-500/20 rounded px-2 py-1">
          {error}
        </p>
      )}
    </div>
  );
}
