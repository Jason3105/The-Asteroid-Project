import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/layout/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PROSPECTOR — Asteroid Mining Feasibility Engine",
  description:
    "Which asteroid should humanity mine first? PROSPECTOR uses live NASA data, orbital mechanics, and economic modeling to rank Near-Earth Asteroids by mining viability.",
  keywords: [
    "asteroid mining",
    "space resources",
    "near-earth asteroids",
    "orbital mechanics",
    "EVS score",
    "NASA",
    "space economy",
  ],
  openGraph: {
    title: "PROSPECTOR — Asteroid Mining Feasibility Engine",
    description: "Real-time asteroid mining feasibility rankings powered by NASA data.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-space-950 text-white antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
