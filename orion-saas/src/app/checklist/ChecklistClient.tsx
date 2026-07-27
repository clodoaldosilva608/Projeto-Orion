"use client";

import { useTransition, useState } from "react";
import { CheckCircle2, Circle, SkipForward, RotateCcw, Clock, Award, Loader2, X } from "lucide-react";
import {
  completeTaskAction,
  uncompleteTaskAction,
  skipTaskAction,
} from "@/lib/checklist-actions";

export function TaskItem({
  id,
  title,
  description,
  points,
  status,
  completedAt,
  isRequired,
  estimatedMin,
  notes,
}: {
  id: string;
  title: string;
  description?: string | null;
  points: number;
  status: "pending" | "done" | "skipped" | "overdue";
  completedAt: string | null;
  isRequired: boolean;
  estimatedMin?: number | null;
  notes?: string | null;
}) {
  const [pending, start] = useTransition();
  const [showSkip, setShowSkip] = useState(false);
  const [skipNotes, setSkipNotes] = useState("");

  const isDone = status === "done";
  const isSkipped = status === "skipped";

  function toggle() {
    start(async () => {
      if (isDone) {
        await uncompleteTaskAction(id);
      } else {
        await completeTaskAction(id);
      }
    });
  }

  function confirmSkip() {
    start(async () => {
      await skipTaskAction(id, skipNotes || undefined);
      setShowSkip(false);
      setSkipNotes("");
    });
  }

  return (
    <li className={`px-5 py-4 ${isDone ? "bg-emerald-500/[0.03]" : isSkipped ? "bg-amber-500/[0.03] opacity-60" : ""}`}>
      <div className="flex items-start gap-3">
        {/* Checkbox / status icon */}
        <button
          onClick={toggle}
          disabled={pending || isSkipped}
          className="mt-0.5 shrink-0"
          title={isDone ? "Desmarcar" : isSkipped ? "Pulada" : "Marcar como concluída"}
        >
          {pending ? (
            <Loader2 className="h-5 w-5 animate-spin text-violet-300" />
          ) : isDone ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          ) : isSkipped ? (
            <SkipForward className="h-5 w-5 text-amber-400" />
          ) : (
            <Circle className="h-5 w-5 text-[#6b7280] hover:text-violet-300 transition-colors" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-medium ${isDone ? "text-emerald-300 line-through" : "text-white"}`}>
            {title}
            {isRequired && (
              <span className="ml-2 text-[10px] text-[#6b7280] uppercase tracking-wide">obrigatória</span>
            )}
          </div>
          {description && (
            <p className="text-xs text-[#8b8fa3] mt-0.5 line-clamp-2">{description}</p>
          )}
          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[#6b7280]">
            <span className="inline-flex items-center gap-1">
              <Award className="h-3 w-3 text-violet-300" />
              {points} pts
            </span>
            {estimatedMin && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                ~{estimatedMin}min
              </span>
            )}
            {completedAt && (
              <span className="text-emerald-400">
                ✓ {new Date(completedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            {notes && isSkipped && (
              <span className="text-amber-400">motivo: {notes}</span>
            )}
          </div>

          {/* Skip form */}
          {showSkip && (
            <div className="mt-2 flex gap-2">
              <input
                value={skipNotes}
                onChange={(e) => setSkipNotes(e.target.value)}
                placeholder="Motivo (opcional)"
                className="flex-1 h-8 rounded-lg bg-white/5 border border-white/[0.06] px-2 text-xs text-white outline-none focus:border-violet-400/50"
              />
              <button
                onClick={confirmSkip}
                disabled={pending}
                className="inline-flex items-center gap-1 h-8 px-2 rounded-lg bg-amber-500/15 text-amber-300 text-xs font-medium hover:bg-amber-500/20 disabled:opacity-50"
              >
                <SkipForward className="h-3 w-3" /> Pular
              </button>
              <button
                onClick={() => { setShowSkip(false); setSkipNotes(""); }}
                className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-[#8b8fa3] hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Skip button (only if pending) */}
        {status === "pending" && !showSkip && (
          <button
            onClick={() => setShowSkip(true)}
            disabled={pending}
            title="Pular tarefa"
            className="text-[#6b7280] hover:text-amber-300 transition-colors text-xs"
          >
            Pular
          </button>
        )}
        {isSkipped && (
          <button
            onClick={toggle}
            disabled={pending}
            title="Reabrir tarefa"
            className="inline-flex items-center justify-center h-7 w-7 rounded text-[#8b8fa3] hover:text-violet-300"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </li>
  );
}

// StreakInfo — could be used in the future to show current streak
export function StreakInfo({ days }: { days: number }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/15 px-2 py-1 text-xs font-semibold text-amber-300">
      <span>🔥</span>
      {days} {days === 1 ? "dia" : "dias"} de streak
    </div>
  );
}
