"use client";
import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("orion-cookie-consent");
    if (!consent) setShow(true);
  }, []);

  function accept() {
    localStorage.setItem("orion-cookie-consent", "accepted");
    setShow(false);
  }

  function reject() {
    localStorage.setItem("orion-cookie-consent", "rejected");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-4 md:right-auto md:max-w-md z-50 animate-fade-in">
      <div className="glass-card p-5 shadow-2xl" style={{ border: "1px solid var(--border-default)" }}>
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(139,92,246,0.15)" }}>
            <Cookie className="w-5 h-5" style={{ color: "#a78bfa" }} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white mb-1">Consentimento de Cookies</h3>
            <p className="text-xs text-secondary leading-relaxed">
              Usamos cookies para melhorar sua experiência e estar em conformidade com a LGPD (Lei nº 13.709/2018).
              Você pode aceitar ou recusar. <a href="/privacidade" className="text-indigo-400 hover:text-indigo-300">Política de Privacidade</a>
            </p>
          </div>
          <button onClick={reject} className="text-muted hover:text-primary transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex gap-2">
          <button onClick={accept} className="btn-primary flex-1 text-xs">Aceitar todos</button>
          <button onClick={reject} className="btn-ghost flex-1 text-xs">Recusar</button>
        </div>
      </div>
    </div>
  );
}
