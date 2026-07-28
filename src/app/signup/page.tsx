import { Suspense } from "react";
import { SignupClient } from "./SignupClient";

export const dynamic = "force-dynamic";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f111a]" />}>
      <SignupClient />
    </Suspense>
  );
}
