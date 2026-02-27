"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, RefreshCw, AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
        </div>

        <h1 className="font-[family-name:var(--font-display)] text-4xl text-[#1A1A2E] tracking-wider mb-2">
          FOUL!
        </h1>
        <h2 className="text-lg font-semibold text-[#1A1A2E] mb-4">
          Etwas ist schiefgelaufen
        </h2>
        <p className="text-gray-500 mb-8">
          Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut oder gehe zur Startseite.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            className="bg-[#00D26A] hover:bg-[#00B85C] text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Erneut versuchen
          </Button>
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto">
              <Home className="h-4 w-4 mr-2" />
              Zur Startseite
            </Button>
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-xs text-gray-300">
            Fehler-ID: {error.digest}
          </p>
        )}

        <div className="mt-12">
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
