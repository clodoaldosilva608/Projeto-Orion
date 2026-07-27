import { getTvDataAction } from "@/lib/painel-tv-actions";
import { TvCampanhas } from "./TvCampanhasClient";

export const dynamic = "force-dynamic";

export default async function TvCampanhasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const tvToken = (params.key as string) || "";
  const { data, error } = await getTvDataAction(tvToken);

  if (error || !data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-2xl text-[#8b8fa3]">{error ?? "Acesso restrito"}</div>
      </div>
    );
  }

  return <TvCampanhas data={data} />;
}
