"use client";
import { useState } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";

export function IaClient() {
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Olá! Sou o assistente IA da Orion. Pergunte sobre seus projetos, metas, indicadores ou performance." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: msg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "ai", text: data.text || "Não consegui processar a resposta." }]);
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: "Erro de conexão. Tente novamente." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === "ai" ? "bg-purple-500/15" : "bg-blue-500/15"}`}>
              {m.role === "ai" ? <Sparkles className="w-3.5 h-3.5 text-purple-400" /> : <span className="text-tiny font-bold text-blue-400">U</span>}
            </div>
            <div className={`rounded-lg px-3 py-2 text-sm max-w-[80%] ${m.role === "ai" ? "bg-white/5 text-secondary" : "bg-indigo-500/15 text-white"}`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center bg-purple-500/15"><Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin" /></div>
            <div className="rounded-lg px-3 py-2 text-sm bg-white/5 text-muted">Digitando...</div>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Pergunte algo sobre sua plataforma..."
          className="input-search pl-3"
          style={{ paddingLeft: "0.75rem" }}
          disabled={loading}
        />
        <button onClick={send} disabled={loading || !input.trim()} className="btn-primary px-3 py-2 disabled:opacity-50">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
