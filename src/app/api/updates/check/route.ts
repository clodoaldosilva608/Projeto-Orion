import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    latestVersion: "1.0.0",
    downloadUrl: "https://orion-saas-platform.vercel.app/releases/orion-1.0.0.yml",
    releaseNotes: "Versão inicial do Orion Platform Desktop.",
    minVersion: "1.0.0",
    updatedAt: new Date().toISOString(),
  });
}
