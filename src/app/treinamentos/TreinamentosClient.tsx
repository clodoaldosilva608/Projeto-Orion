"use client";
import { useState, useTransition } from "react";
import { Loader2, Plus, Save, CheckCircle2, Trash2 } from "lucide-react";
import { createTrainingAction, updateTrainingProgressAction, deleteTrainingAction } from "@/lib/training-actions";

export function NewTrainingForm() {
  const [pending, start] = useTransition();
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("other");
  const [format, setFormat] = useState("video");
  const [duration, setDuration] = useState("");
  if (!show) return <button onClick={() => setShow(true)} className="inline-flex items-center gap-2 h-10 px-4 rounded-lg brand-gradient text-sm font-semibold text-white"><Plus className="h-4 w-4" />Novo treinamento</button>;
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (!title.trim()) return; start(async () => { await createTrainingAction({ title, contentUrl: url || undefined, category, format, durationMin: duration ? Number(duration) : undefined }); setTitle(""); setUrl(""); setDuration(""); setShow(false); }); }} className="glass-card p-5 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título *" required className="h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50" />
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL do conteúdo" className="h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 rounded-lg bg-white/5 border border-white/[0.06] px-2 text-sm text-white"><option value="onboarding">Onboarding</option><option value="sales">Vendas</option><option value="product">Produto</option><option value="compliance">Compliance</option><option value="technical">Técnico</option><option value="soft_skills">Soft Skills</option><option value="other">Outros</option></select>
        <div className="flex gap-2"><select value={format} onChange={(e) => setFormat(e.target.value)} className="flex-1 h-10 rounded-lg bg-white/5 border border-white/[0.06] px-2 text-sm text-white"><option value="video">Vídeo</option><option value="pdf">PDF</option><option value="presentation">Apresentação</option><option value="interactive">Interativo</option><option value="external_link">Link externo</option></select><input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="min" className="w-16 h-10 rounded-lg bg-white/5 border border-white/[0.06] px-2 text-sm text-white" /></div>
      </div>
      <div className="flex gap-2"><button type="submit" disabled={pending || !title.trim()} className="inline-flex items-center gap-2 h-9 px-3 rounded-lg brand-gradient text-xs font-semibold text-white disabled:opacity-50">{pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}Salvar</button><button type="button" onClick={() => setShow(false)} className="h-9 px-3 rounded-lg border border-white/10 bg-white/5 text-xs text-[#8b8fa3]">Cancelar</button></div>
    </form>
  );
}

export function ProgressButton({ id, currentProgress }: { id: string; currentProgress: number }) {
  const [pending, start] = useTransition();
  const next = currentProgress >= 100 ? 0 : currentProgress >= 50 ? 100 : 50;
  return <button onClick={() => start(async () => { await updateTrainingProgressAction(id, next); })} disabled={pending} className={`inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-medium ${currentProgress >= 100 ? "bg-emerald-500/15 text-emerald-300" : "bg-white/5 text-[#8b8fa3]"}`}>{pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}{currentProgress >= 100 ? "Concluído" : `${next}%`}</button>;
}

export function DeleteTrainingButton({ id, title }: { id: string; title: string }) {
  const [pending, start] = useTransition();
  return <button onClick={() => { if (confirm(`Excluir "${title}"?`)) start(async () => { await deleteTrainingAction(id); }); }} disabled={pending} className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-[#8b8fa3] hover:text-red-300"><Trash2 className="h-3.5 w-3.5" /></button>;
}
