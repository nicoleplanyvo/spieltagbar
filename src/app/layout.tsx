import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Bebas_Neue } from "next/font/google";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PWARegister } from "@/components/PWARegister";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "SpieltagBar - Wo läuft dein Spiel?",
    template: "%s | SpieltagBar",
  },
  description:
    "Finde die perfekte Sports-Bar zum Fußball schauen. Echtzeit-Übersicht, Tischreservierung und Community für Fußball-Fans in Deutschland.",
  keywords: [
    "Fußball",
    "Sports Bar",
    "Spieltag",
    "Bundesliga",
    "Bar finden",
    "Fußball schauen",
    "Tischreservierung",
    "Champions League",
    "Public Viewing",
  ],
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "SpieltagBar",
    title: "SpieltagBar - Wo läuft dein Spiel?",
    description: "Finde die perfekte Sports-Bar zum Fußball schauen. Spielplan, Tischreservierung & Promo-Deals.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpieltagBar - Wo läuft dein Spiel?",
    description: "Finde die perfekte Sports-Bar zum Fußball schauen.",
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SpieltagBar",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <head>
        <meta name="theme-color" content="#00D26A" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body
        className={`${plusJakarta.variable} ${bebasNeue.variable} antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <PWARegister />
        </Providers>
      </body>
    </html>
  );
}
