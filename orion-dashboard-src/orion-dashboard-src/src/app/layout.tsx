import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orion — SaaS Platform",
  description: "Plataforma SaaS de desenvolvimento, entrega e licenciamento de aplicações",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
