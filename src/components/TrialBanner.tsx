"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, X, ArrowRight } from "lucide-react";

type TrialStatus = {
  status: "trial" | "ok" | "trial_expired" | "suspended" | "canceled" | "expired" | "no_license";
  daysLeft?: number;
};

export function TrialBanner() {
  const [data, setData] = useState<TrialStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/license-status")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {});
  }, []);

  if (dismissed || !data || data.status !== "trial") return null;

  const days = data.daysLeft ?? 0;
  const isUrgent = days <= 3;

  return (
    <div
      className={`border-b px-4 py-2.5 flex items-center justify-between gap-3 ${
        isUrgent
          ? "bg-amber-500/15 border-amber-500/30 text-amber-200"
          : "bg-violet-500/10 border-violet-500/20 text-violet-200"
      }`}
    >
      <div className="flex items-center gap-2 text-xs font-medium">
        <Clock className="h-4 w-4" />
        <span>
          {isUrgent ? "⏰ " : ""}
          {days === 0
            ? "Seu trial expira hoje!"
            : days === 1
            ? "Seu trial expira amanhã!"
            : `Seu trial expira em ${days} dias`}
        </span>
        <span className="opacity-70">— assine um plano para não perder o acesso</span>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/planos"
          className={`inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-[11px] font-semibold transition-colors ${
            isUrgent
              ? "bg-amber-500 text-white hover:bg-amber-600"
              : "brand-gradient text-white"
          }`}
        >
          Ver planos <ArrowRight className="h-3 w-3" />
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded hover:bg-white/10"
          aria-label="Fechar"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
