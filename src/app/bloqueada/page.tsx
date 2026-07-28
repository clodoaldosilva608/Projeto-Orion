import { Suspense } from "react";
import { BlockedClient } from "./BlockedClient";

export const dynamic = "force-dynamic";

export default function BloqueadaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0b14]" />}>
      <BlockedClient />
    </Suspense>
  );
}
