import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f111a] text-white p-4">
      <div className="text-center max-w-md">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl brand-gradient shadow-lg shadow-violet-500/25 mx-auto mb-6">
          <span className="text-2xl font-bold text-white">O</span>
        </div>
        <h1 className="text-6xl font-bold text-violet-300 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-white mb-2">Página não encontrada</h2>
        <p className="text-sm text-[#8b8fa3] mb-6">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg brand-gradient text-sm font-semibold text-white"
          >
            Voltar ao início
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-white hover:bg-white/10"
          >
            Fazer login
          </Link>
        </div>
      </div>
    </div>
  );
}
