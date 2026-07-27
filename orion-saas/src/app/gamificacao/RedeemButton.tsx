"use client";

import { useState, useTransition } from "react";
import { Loader2, Check, Lock } from "lucide-react";
import { redeemPointsAction } from "@/lib/gamification-actions";

export function RedeemButton({
  rewardKey,
  rewardName,
  affordable,
}: {
  rewardKey: string;
  rewardName: string;
  affordable: boolean;
}) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function redeem() {
    if (!confirm(`Trocar pontos por "${rewardName}"?`)) return;
    setErr(null);
    start(async () => {
      const { error } = await redeemPointsAction(rewardKey);
      if (error) {
        setErr(error);
        return;
      }
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    });
  }

  if (done) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-300">
        <Check className="h-3.5 w-3.5" /> Solicitado!
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={redeem}
        disabled={pending || !affordable}
        title={affordable ? "Trocar pontos" : "Pontos insuficientes"}
        className={`inline-flex items-center justify-center h-8 px-3 rounded-lg text-xs font-medium transition-colors ${
          affordable
            ? "bg-amber-500/15 text-amber-300 hover:bg-amber-500/20"
            : "bg-white/5 text-[#6b7280] cursor-not-allowed"
        } disabled:opacity-50`}
      >
        {pending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : affordable ? (
          "Trocar"
        ) : (
          <Lock className="h-3 w-3" />
        )}
      </button>
      {err && <span className="text-[10px] text-red-300 max-w-[100px]">{err}</span>}
    </div>
  );
}
