"use client";

import { useState, useTransition } from "react";
import {
  Loader2, Play, Square, RotateCcw, Trash2, Plus, UserMinus,
  Award as AwardIcon, RefreshCw,
} from "lucide-react";
import {
  updateCampaignStatusAction,
  deleteCampaignAction,
  addParticipantAction,
  removeParticipantAction,
  addAwardAction,
  deleteAwardAction,
  recomputeLeaderboardAction,
} from "@/lib/campanhas-actions";

const AWARD_TYPES = [
  { value: "points", label: "Pontos" },
  { value: "money", label: "Dinheiro" },
  { value: "product", label: "Produto" },
  { value: "badge", label: "Medalha / Badge" },
  { value: "experience", label: "Experiência (viagem, jantar, etc.)" },
  { value: "custom", label: "Personalizado" },
];

export function StatusButtons({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();
  const canStart = status === "draft" || status === "canceled" || status === "paused";
  const canEnd = status === "active";
  const canPause = status === "active";
  const canCancel = status === "active" || status === "draft" || status === "paused";

  function update(s: "draft" | "scheduled" | "active" | "paused" | "finished" | "canceled") {
    start(async () => {
      await updateCampaignStatusAction(id, s);
    });
  }
  function remove() {
    if (!confirm("Excluir esta campanha? Esta ação não pode ser desfeita.")) return;
    start(async () => {
      await deleteCampaignAction(id);
      window.location.href = "/campanhas";
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canStart && (
        <button
          onClick={() => update("active")}
          disabled={pending}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-emerald-500/15 text-emerald-300 text-xs font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
          Iniciar
        </button>
      )}
      {canPause && (
        <button
          onClick={() => update("paused")}
          disabled={pending}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-amber-500/15 text-amber-300 text-xs font-medium hover:bg-amber-500/20 transition-colors disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
          Pausar
        </button>
      )}
      {canEnd && (
        <button
          onClick={() => update("finished")}
          disabled={pending}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-sky-500/15 text-sky-300 text-xs font-medium hover:bg-sky-500/20 transition-colors disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Square className="h-3.5 w-3.5" />}
          Encerrar
        </button>
      )}
      {canCancel && (
        <button
          onClick={() => update("canceled")}
          disabled={pending}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-red-500/15 text-red-300 text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
          Cancelar
        </button>
      )}
      <button
        onClick={remove}
        disabled={pending}
        title="Excluir campanha"
        className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-[#8b8fa3] hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

export function LeaderboardActions({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  function recompute() {
    start(async () => {
      const { data } = await recomputeLeaderboardAction(id);
      setMessage(data?.updated != null ? `${data.updated} participantes atualizados` : null);
      setTimeout(() => setMessage(null), 2500);
    });
  }
  return (
    <div className="flex items-center gap-2">
      {message && <span className="text-xs text-emerald-300">{message}</span>}
      <button
        onClick={recompute}
        disabled={pending}
        className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-white/10 bg-white/5 text-xs font-medium text-[#8b8fa3] hover:text-white hover:bg-white/10 disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
        Recalcular
      </button>
    </div>
  );
}

export function AddParticipantForm({
  campaignId,
  availableUsers,
  participants,
}: {
  campaignId: string;
  availableUsers: any[];
  participants: any[];
}) {
  const [pending, start] = useTransition();
  const [userId, setUserId] = useState("");

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    start(async () => {
      await addParticipantAction(campaignId, userId);
      setUserId("");
    });
  }
  function remove(uid: string) {
    start(async () => {
      await removeParticipantAction(campaignId, uid);
    });
  }

  return (
    <div className="glass-card p-0 overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
        <Plus className="h-4 w-4 text-violet-300" />
        <h3 className="text-sm font-semibold text-white">Participantes</h3>
      </div>
      <div className="p-5 space-y-3">
        {availableUsers.length > 0 ? (
          <form onSubmit={add} className="flex gap-2">
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="flex-1 h-9 rounded-lg bg-white/5 border border-white/[0.06] px-2 text-sm text-white outline-none focus:border-violet-400/50"
            >
              <option value="">Selecione um usuário...</option>
              {availableUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} {u.jobTitle ? `· ${u.jobTitle}` : ""}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={pending || !userId}
              className="inline-flex items-center justify-center h-9 px-3 rounded-lg brand-gradient text-xs font-semibold text-white hover:opacity-95 disabled:opacity-50"
            >
              {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            </button>
          </form>
        ) : (
          <p className="text-xs text-[#6b7280]">Todos os usuários da empresa já são participantes.</p>
        )}

        {participants.length > 0 && (
          <ul className="space-y-1.5 pt-2 border-t border-white/[0.06]">
            {participants.map((p) => (
              <li key={p.id} className="flex items-center gap-2 text-sm">
                <span className="flex-1 truncate text-white">{p.user.name}</span>
                <button
                  onClick={() => remove(p.userId)}
                  disabled={pending}
                  title="Remover participante"
                  className="inline-flex items-center justify-center h-7 w-7 rounded text-[#8b8fa3] hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <UserMinus className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function AddAwardForm({ campaignId }: { campaignId: string }) {
  const [pending, start] = useTransition();
  const [name, setName] = useState("");
  const [type, setType] = useState("points");
  const [value, setValue] = useState("");
  const [position, setPosition] = useState("");
  const [description, setDescription] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    start(async () => {
      const { error } = await addAwardAction({
        campaignId,
        name: name.trim(),
        description: description.trim() || undefined,
        type: type as any,
        value: value ? Number(value) : undefined,
        position: position ? Number(position) : undefined,
      });
      if (!error) {
        setName("");
        setValue("");
        setPosition("");
        setDescription("");
      }
    });
  }

  return (
    <div className="glass-card p-0 overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
        <AwardIcon className="h-4 w-4 text-amber-300" />
        <h3 className="text-sm font-semibold text-white">Adicionar premiação</h3>
      </div>
      <form onSubmit={submit} className="p-5 space-y-3">
        <div>
          <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Nome *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Ex: 1º lugar - iPad"
            className="w-full h-9 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full h-9 rounded-lg bg-white/5 border border-white/[0.06] px-2 text-sm text-white outline-none focus:border-violet-400/50"
            >
              {AWARD_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Posição</label>
            <input
              type="number"
              min="1"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="1"
              className="w-full h-9 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Valor (opcional)</label>
          <input
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ex: 500 (R$ ou pontos)"
            className="w-full h-9 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8b8fa3] mb-1.5">Descrição</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição curta do prêmio"
            className="w-full h-9 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
          />
        </div>
        <button
          type="submit"
          disabled={pending || !name.trim()}
          className="inline-flex items-center gap-2 w-full h-9 rounded-lg brand-gradient text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50 justify-center"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          Adicionar
        </button>
      </form>
    </div>
  );
}

export function AwardList({ awards, campaignId }: { awards: any[]; campaignId: string }) {
  const [pending, start] = useTransition();
  function remove(awardId: string) {
    if (!confirm("Remover esta premiação?")) return;
    start(async () => {
      await deleteAwardAction(awardId, campaignId);
    });
  }

  const sorted = [...awards].sort((a, b) => (a.position ?? 999) - (b.position ?? 999));

  return (
    <div className="glass-card p-0 overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
        <AwardIcon className="h-4 w-4 text-amber-300" />
        <h3 className="text-sm font-semibold text-white">Premiações</h3>
        <span className="text-xs text-[#6b7280] ml-auto">{awards.length} prêmios</span>
      </div>
      {awards.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-[#8b8fa3]">
          Nenhuma premiação cadastrada. Adicione prêmios pelo formulário ao lado.
        </div>
      ) : (
        <ul className="divide-y divide-white/[0.04]">
          {sorted.map((a) => (
            <li key={a.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-white/[0.02]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-300 font-bold text-sm shrink-0">
                {a.position ?? "🎁"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">{a.name}</div>
                <div className="text-xs text-[#8b8fa3] mt-0.5">
                  {AWARD_TYPES.find((t) => t.value === a.type)?.label ?? a.type}
                  {a.value != null && ` · ${Number(a.value).toLocaleString("pt-BR")}`}
                  {a.position != null && ` · Posição ${a.position}`}
                  {a.description && ` · ${a.description}`}
                </div>
              </div>
              <button
                onClick={() => remove(a.id)}
                disabled={pending}
                title="Remover premiação"
                className="inline-flex items-center justify-center h-8 w-8 rounded text-[#8b8fa3] hover:text-red-300 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
