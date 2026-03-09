import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RankScope — SEO Rank Checker per Google.it",
  description: "Verifica il posizionamento del tuo sito su Google.it per le tue parole chiave",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
