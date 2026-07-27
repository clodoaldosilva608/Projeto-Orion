"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, Trash2 } from "lucide-react";
import {
  generateIaBriefingAction,
  deleteBriefingAction,
} from "@/lib/fabrica-actions";

export function GenerateIaButton({ briefingId }: { briefingId: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  function generate() {
    if (!confirm("Gerar PRD + arquitetura + estimativas via IA? Isso pode levar 10-20 segundos.")) return;
    start(async () => {
      const { error } = await generateIaBriefingAction(briefingId);
      if (error) {
        alert("Erro: " + error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <button
      onClick={generate}
      disabled={pending}
      title="Gerar PRD + arquitetura + estimativas via IA"
      className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-violet-500/15 text-violet-300 text-xs font-medium hover:bg-violet-500/20 transition-colors disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
      {pending ? "Gerando..." : "IA"}
    </button>
  );
}

export function DeleteBriefingButton({ id, clientName }: { id: string; clientName: string }) {
  const [pending, start] = useTransition();
  function onClick() {
    if (!confirm(`Excluir o briefing de "${clientName}"?`)) return;
    start(async () => {
      await deleteBriefingAction(id);
    });
  }
  return (
    <button
      onClick={onClick}
      disabled={pending}
      title="Excluir briefing"
      className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-[#8b8fa3] hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </button>
  );
}
