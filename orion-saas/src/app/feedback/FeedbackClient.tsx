"use client";

import { useState, useTransition } from "react";
import { Star, Award, CheckCircle2, Loader2, ShieldCheck, Send } from "lucide-react";
import { submitFeedbackResponseAction } from "@/lib/feedback-actions";

export function FeedbackCard({
  id,
  title,
  question,
  description,
  type,
  typeLabel,
  pointsReward,
  isAnonymous,
  alreadyResponded,
  options,
  lastResponse,
}: {
  id: string;
  title: string;
  question: string;
  description?: string | null;
  type: string;
  typeLabel: string;
  pointsReward: number;
  isAnonymous: boolean;
  alreadyResponded: boolean;
  options: string[];
  lastResponse: any;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(alreadyResponded);
  const [pointsEarned, setPointsEarned] = useState<number | null>(null);

  // Response state
  const [numericValue, setNumericValue] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [textValue, setTextValue] = useState("");
  const [comment, setComment] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validate based on type
    if (type === "nps" && (numericValue == null || numericValue < 0 || numericValue > 10)) {
      setError("Selecione uma nota de 0 a 10");
      return;
    }
    if ((type === "csat" || type === "rating") && (numericValue == null || numericValue < 1 || numericValue > 5)) {
      setError("Selecione uma avaliação de 1 a 5");
      return;
    }
    if (type === "ces" && (numericValue == null || numericValue < 1 || numericValue > 7)) {
      setError("Selecione uma nota de 1 a 7");
      return;
    }
    if (type === "open" && !textValue.trim()) {
      setError("Escreva sua resposta");
      return;
    }
    if (type === "multiple_choice" && selectedOption == null) {
      setError("Selecione uma opção");
      return;
    }

    start(async () => {
      const { data, error } = await submitFeedbackResponseAction({
        feedbackId: id,
        numericValue: numericValue ?? undefined,
        selectedOption: selectedOption ?? undefined,
        textValue: textValue.trim() || undefined,
        comment: comment.trim() || undefined,
      });
      if (error) {
        setError(error);
        return;
      }
      setDone(true);
      setPointsEarned(data?.pointsAwarded ?? pointsReward);
    });
  }

  if (done && !pending) {
    return (
      <div className="glass-card p-5 flex flex-col gap-3 fade-in-up border-emerald-500/20">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
        <p className="text-xs text-[#8b8fa3]">Obrigado pela sua resposta!</p>
        {pointsEarned != null && pointsEarned > 0 && (
          <div className="inline-flex items-center gap-2 self-start rounded-md bg-violet-500/15 px-3 py-1.5 text-xs font-semibold text-violet-300">
            <Award className="h-3.5 w-3.5" />
            +{pointsEarned} pontos ganhos!
          </div>
        )}
        {lastResponse && type === "rating" && lastResponse.numericValue != null && (
          <div className="text-xs text-[#8b8fa3]">
            Sua última avaliação: {"⭐".repeat(lastResponse.numericValue)}
          </div>
        )}
        {lastResponse && type === "nps" && lastResponse.numericValue != null && (
          <div className="text-xs text-[#8b8fa3]">
            Sua última nota: {lastResponse.numericValue}/10
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="glass-card p-5 flex flex-col gap-3 fade-in-up hover:border-violet-500/30 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {isAnonymous && (
            <span title="Anônima" className="inline-flex items-center gap-1 text-[10px] text-[#6b7280]">
              <ShieldCheck className="h-3 w-3" /> anônima
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-md bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold text-violet-300">
            <Award className="h-3 w-3" /> +{pointsReward} pts
          </span>
        </div>
      </div>

      <p className="text-[10px] uppercase tracking-wide text-[#6b7280]">{typeLabel}</p>

      {description && (
        <p className="text-xs text-[#8b8fa3]">{description}</p>
      )}

      <div className="text-sm font-medium text-white">{question}</div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1.5 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Response input based on type */}
      {type === "nps" && (
        <div>
          <div className="flex gap-1">
            {Array.from({ length: 11 }, (_, i) => i).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNumericValue(n)}
                className={`flex-1 h-10 rounded-md text-sm font-bold transition-colors ${
                  numericValue === n
                    ? n <= 6
                      ? "bg-red-500/30 text-red-300 border border-red-500/50"
                      : n <= 8
                      ? "bg-amber-500/30 text-amber-300 border border-amber-500/50"
                      : "bg-emerald-500/30 text-emerald-300 border border-emerald-500/50"
                    : "bg-white/5 text-[#8b8fa3] hover:bg-white/10 border border-transparent"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-[#6b7280] mt-1">
            <span>Muito improvável</span>
            <span>Muito provável</span>
          </div>
        </div>
      )}

      {(type === "csat" || type === "rating") && (
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setNumericValue(n)}
              className="text-2xl transition-transform hover:scale-110"
              title={`${n} estrela${n > 1 ? "s" : ""}`}
            >
              <Star
                className={`h-7 w-7 ${numericValue != null && n <= numericValue ? "text-amber-400 fill-amber-400" : "text-[#6b7280]"}`}
              />
            </button>
          ))}
        </div>
      )}

      {type === "ces" && (
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setNumericValue(n)}
              className={`flex-1 h-10 rounded-md text-sm font-bold transition-colors ${
                numericValue === n
                  ? "bg-violet-500/30 text-violet-300 border border-violet-500/50"
                  : "bg-white/5 text-[#8b8fa3] hover:bg-white/10 border border-transparent"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {type === "open" && (
        <textarea
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          rows={3}
          placeholder="Escreva sua resposta..."
          className="w-full rounded-lg bg-white/5 border border-white/[0.06] px-3 py-2 text-sm text-white outline-none focus:border-violet-400/50 resize-none"
        />
      )}

      {type === "multiple_choice" && (
        <div className="space-y-1.5">
          {options.map((opt, idx) => (
            <label
              key={idx}
              className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                selectedOption === idx
                  ? "border-violet-500/40 bg-violet-500/10"
                  : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
              }`}
            >
              <input
                type="radio"
                name={`option-${id}`}
                checked={selectedOption === idx}
                onChange={() => setSelectedOption(idx)}
                className="h-4 w-4 text-violet-500"
              />
              <span className="text-sm text-white">{opt}</span>
            </label>
          ))}
        </div>
      )}

      {/* Optional comment */}
      <div>
        <label className="block text-xs text-[#8b8fa3] mb-1">Comentário (opcional)</label>
        <input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Adicione mais detalhes..."
          className="w-full h-9 rounded-lg bg-white/5 border border-white/[0.06] px-3 text-sm text-white outline-none focus:border-violet-400/50"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 h-10 px-4 rounded-lg brand-gradient text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50 self-start"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {alreadyResponded ? "Atualizar resposta" : "Enviar resposta"}
      </button>
    </form>
  );
}
