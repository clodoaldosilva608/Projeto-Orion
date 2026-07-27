"use client";

import { useTransition } from "react";
import { Loader2, Check, X, Package } from "lucide-react";
import {
  approveRedemptionAction,
  rejectRedemptionAction,
  fulfillRedemptionAction,
} from "@/lib/gamification-actions";

export function RedemptionActions({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();

  function approve() {
    start(async () => {
      await approveRedemptionAction(id);
    });
  }
  function reject() {
    if (!confirm("Rejeitar esta solicitação? Os pontos serão devolvidos ao usuário.")) return;
    start(async () => {
      await rejectRedemptionAction(id);
    });
  }
  function fulfill() {
    if (!confirm("Marcar como entregue?")) return;
    start(async () => {
      await fulfillRedemptionAction(id);
    });
  }

  if (pending) {
    return <Loader2 className="h-4 w-4 animate-spin text-[#8b8fa3] inline" />;
  }

  return (
    <div className="inline-flex items-center gap-1">
      {status === "pending" && (
        <>
          <button
            onClick={approve}
            title="Aprovar"
            className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-emerald-300 hover:bg-emerald-500/10 transition-colors"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={reject}
            title="Rejeitar"
            className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </>
      )}
      {status === "approved" && (
        <button
          onClick={fulfill}
          title="Marcar como entregue"
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-emerald-500/15 text-emerald-300 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
        >
          <Package className="h-3.5 w-3.5" />
          Entregar
        </button>
      )}
      {(status === "rejected" || status === "fulfilled") && (
        <span className="text-xs text-[#6b7280]">—</span>
      )}
    </div>
  );
}
