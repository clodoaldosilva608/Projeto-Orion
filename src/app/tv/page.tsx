import Link from "next/link";
import { getTvDataAction } from "@/lib/painel-tv-actions";
import { TvDashboard } from "./TvDashboard";

export const dynamic = "force-dynamic";

export default async function TvPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const tvToken = (params.key as string) || "";
  const { data, error } = await getTvDataAction(tvToken);

  if (error || !data) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-3xl font-bold text-white mb-2">Acesso restrito</h2>
          <p className="text-lg text-[#8b8fa3] mb-6">
            {error ?? "Faça login para visualizar o painel TV."}
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-lg brand-gradient text-lg font-semibold text-white"
          >
            Fazer login →
          </Link>
          <p className="text-xs text-[#6b7280] mt-6">
            Ou acesse com token de TV: <code className="text-violet-300">/tv?key=tv_xxx</code>
          </p>
        </div>
      </div>
    );
  }

  return <TvDashboard data={data} />;
}
