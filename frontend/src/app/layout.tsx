import "./globals.css";
import type { Metadata } from "next";
import { Electrolize } from "next/font/google";
import Header from "@/components/Header";

const font = Electrolize({ weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ReadLaterAI",
  description: "Save + Understand + Learn from content with AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={font.className} suppressHydrationWarning>
      <head>
        <meta httpEquiv="Cache-Control" content="no-store" />
      </head>
      <body className="bg-neutral-950 text-white">
        <Header />
        <main className="max-w-4xl mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}
