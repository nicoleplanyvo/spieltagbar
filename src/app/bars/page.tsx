import type { Metadata } from "next";
import { BarSuche } from "@/components/bars/BarSuche";

export const metadata: Metadata = {
  title: "Sports-Bars finden",
  description: "Entdecke die besten Sports-Bars zum Fußball schauen in deiner Nähe. Leinwand, Beamer, Biergarten — jetzt Bar finden und Tisch reservieren.",
};

export default function BarsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-[#1A1A2E] text-white py-12 pitch-pattern">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl tracking-wider text-gradient-green">
            BARS FINDEN
          </h1>
          <p className="mt-2 text-gray-400">
            Entdecke die besten Sports-Bars in deiner Nähe
          </p>
        </div>
      </div>

      <BarSuche />
    </div>
  );
}
