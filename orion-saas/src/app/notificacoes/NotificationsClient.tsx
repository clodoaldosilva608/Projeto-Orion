"use client";

import { useState, useTransition } from "react";
import { Check, CheckCheck, Bell, Loader2, Send } from "lucide-react";
import { markNotificationReadAction, markAllNotificationsReadAction, createNotificationAction } from "@/lib/p6-actions";

export function MarkReadButton({ id, small }: { id?: string; small?: boolean }) {
  const [pending, start] = useTransition();
  function onClick() {
    start(async () => {
      if (id) {
        await markNotificationReadAction(id);
      } else {
        await markAllNotificationsReadAction();
      }
    });
  }
  if (small) {
    return (
      <button
        onClick={onClick}
        disabled={pending}
        className="text-[10px] uppercase tracking-wide text-violet-300 hover:text-violet-200 disabled:opacity-50 px-2 py-1 rounded hover:bg-violet-500/10 transition-colors"
      >
        {pending ? <Loader2 className="h-3 w-3 animate-spin inline" /> : <Check className="h-3 w-3 inline" />} Ler
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      disabled={pending}
      className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-violet-500/15 text-violet-300 text-sm font-medium hover:bg-violet-500/20 transition-colors disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
      Marcar todas como lidas
    </button>
  );
}

export function CreateNotificationForm() {
  const [pending, start] = useTransition();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState("normal");
  const [channel, setChannel] = useState("in_app");
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    start(async () => {
      await createNotificationAction({ title, body, priority: priority as any, channel: channel as any });
      setTitle("");
      setBody("");
      setPriority("normal");
      setChannel("in_app");
      setDone(true);
      setTimeout(() => setDone(false), 2500);
    });
  }

  return (
    <form onSubmit={onSubmit} className="glass-card p-5 lg:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Send className="h-4 w-4 text-violet-300" />
        <h3 className="text-sm font-semibold text-white">Nova notificação</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
            placeholder="Ex: Sistema em manutenção"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Prioridade</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
            >
              <option value="low">Baixa</option>
              <option value="normal">Normal</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Canal</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="w-full h-10 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
            >
              <option value="in_app">In-app</option>
              <option value="email">E-mail</option>
              <option value="sms">SMS</option>
              <option value="push">Push</option>
              <option value="webhook">Webhook</option>
            </select>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Mensagem</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={3}
            className="w-full rounded-lg bg-white/5 border border-white/[0.06] px-3 py-2 text-sm text-white outline-none focus:border-violet-400/50 resize-none"
            placeholder="Conteúdo da notificação..."
          />
        </div>
      </div>
      <div className="flex items-center gap-3 mt-4">
        <button
          type="submit"
          disabled={pending || !title.trim() || !body.trim()}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg brand-gradient text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:opacity-95 transition-opacity disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
          Enviar notificação
        </button>
        {done && <span className="text-xs text-emerald-300">Notificação criada ✓</span>}
      </div>
    </form>
  );
}
