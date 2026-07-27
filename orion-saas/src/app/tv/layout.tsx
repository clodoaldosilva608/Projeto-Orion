/**
 * TV layout — full-screen, no sidebar, no header, dark mode forced.
 * Designed for smart TVs (Tizen, webOS) in sales rooms.
 *
 * The layout includes:
 *   - Top bar: company name + clock (auto-updating)
 *   - Bottom bar: branding + page indicator + refresh countdown
 *   - Children area takes the full viewport
 */
import { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default function TvLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="force-dark min-h-screen flex flex-col bg-[#0a0b14] text-white overflow-hidden"
      style={{
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Top bar — company + clock */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-white/[0.06] bg-black/30">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl brand-gradient shadow-lg shadow-violet-500/30">
            <span className="text-2xl font-bold text-white">O</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold brand-text">ORION</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-2">
              Painel TV · Sales Command Center
            </p>
          </div>
        </div>
        <TvClock />
      </header>

      {/* Children area */}
      <main className="flex-1 overflow-hidden">{children}</main>

      {/* Bottom bar — branding + auto-refresh notice */}
      <footer className="flex items-center justify-between px-8 py-3 border-t border-white/[0.06] bg-black/30 text-xs text-[#6b7280]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 pulse-dot" />
          <span>Ao vivo · atualização automática a cada 30s</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/tv" className="hover:text-white">Dashboard</a>
          <a href="/tv/ranking" className="hover:text-white">Ranking</a>
          <a href="/tv/campanhas" className="hover:text-white">Campanhas</a>
          <a href="/dashboard" className="hover:text-white">Sair do modo TV →</a>
        </div>
      </footer>
    </div>
  );
}

function TvClock() {
  return (
    <div className="text-right">
      <div
        id="tv-clock"
        className="text-3xl font-bold tabular-nums"
        // eslint-disable-next-line react/no-dangerouslySetInnerHTML
        dangerouslySetInnerHTML={{
          __html: "",
        }}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const el = document.getElementById('tv-clock');
              if (!el) return;
              function update() {
                const now = new Date();
                const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const date = now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
                el.innerHTML = '<div class="text-3xl font-bold tabular-nums">' + time + '</div><div class="text-xs text-[#8b8fa3] capitalize">' + date + '</div>';
              }
              update();
              setInterval(update, 1000);
            })();
          `,
        }}
      />
    </div>
  );
}
