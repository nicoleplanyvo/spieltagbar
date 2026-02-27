import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Animated Football */}
        <div className="mb-8 relative">
          <span className="text-8xl inline-block animate-float">&#9917;</span>
        </div>

        <h1 className="font-[family-name:var(--font-display)] text-6xl text-[#1A1A2E] tracking-wider mb-2">
          4<span className="text-gradient-gold">0</span>4
        </h1>
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[#1A1A2E] tracking-wider mb-4">
          SEITE NICHT GEFUNDEN
        </h2>
        <p className="text-gray-500 mb-8">
          Dieses Spiel wurde leider abgesagt. Die Seite existiert nicht oder wurde verschoben.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="animate-fade-up delay-100">
            <Button className="bg-[#00D26A] hover:bg-[#00B85C] text-white w-full sm:w-auto hover:scale-105 transition-transform">
              <Home className="h-4 w-4 mr-2" />
              Zur Startseite
            </Button>
          </Link>
          <Link href="/spiele" className="animate-fade-up delay-200">
            <Button variant="outline" className="w-full sm:w-auto hover:scale-105 transition-transform">
              <Search className="h-4 w-4 mr-2" />
              Spielplan
            </Button>
          </Link>
          <Link href="/bars" className="animate-fade-up delay-300">
            <Button variant="outline" className="w-full sm:w-auto hover:scale-105 transition-transform">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Bars entdecken
            </Button>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <Link href="/">
            <span className="font-[family-name:var(--font-display)] text-2xl text-[#1A1A2E]/20 tracking-wider">
              SPIELTAG<span className="text-[#F5A623]/30">BAR</span>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
