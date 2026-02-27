"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Star,
  Users,
  Tv,
  Monitor,
  TreePine,
  Search,
  X,
  Loader2,
  Navigation,
} from "lucide-react";
import { getTeamBadge } from "@/lib/teams";

interface Spiel {
  id: string;
  heimTeam: string;
  gastTeam: string;
  liga: string;
  anpfiff: string;
}

interface BarSpiel {
  id: string;
  spiel: Spiel;
}

interface Bar {
  id: string;
  name: string;
  beschreibung: string | null;
  adresse: string;
  stadt: string;
  plz: string;
  hatLeinwand: boolean;
  hatBeamer: boolean;
  biergarten: boolean;
  kapazitaet: number;
  bewertungen: number;
  premiumTier: string;
  spiele: BarSpiel[];
}

export function BarSuche() {
  const [bars, setBars] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(true);
  const [suchbegriff, setSuchbegriff] = useState("");
  const [stadtFilter, setStadtFilter] = useState("Alle");
  const [ausstattungFilter, setAusstattungFilter] = useState<string[]>([]);
  const [nurMitSpielen, setNurMitSpielen] = useState(false);
  const [staedte, setStaedte] = useState<string[]>(["Alle"]);

  // Städteliste dynamisch aus allen Bars laden
  useEffect(() => {
    fetch("/api/bars?alle=1")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const uniqueStaedte = [...new Set(data.map((b: Bar) => b.stadt))].sort() as string[];
          setStaedte(["Alle", ...uniqueStaedte]);
        }
      })
      .catch(() => {});
  }, []);

  const fetchBars = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (stadtFilter !== "Alle") params.set("stadt", stadtFilter);
    if (suchbegriff) params.set("q", suchbegriff);
    if (ausstattungFilter.length > 0) params.set("ausstattung", ausstattungFilter.join(","));

    try {
      const res = await fetch(`/api/bars?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setBars(nurMitSpielen ? data.filter((b: Bar) => b.spiele.length > 0) : data);
      }
    } catch {
      // silent fail
    }
    setLoading(false);
  }, [stadtFilter, suchbegriff, ausstattungFilter, nurMitSpielen]);

  useEffect(() => {
    const timeout = setTimeout(fetchBars, 300);
    return () => clearTimeout(timeout);
  }, [fetchBars]);

  const toggleAusstattung = (feature: string) => {
    setAusstattungFilter((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    );
  };

  return (
    <>
      {/* Such- und Filterbereich */}
      <div className="bg-white border-b shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
          {/* Suchfeld */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Stadt, PLZ oder Barname eingeben..."
              value={suchbegriff}
              onChange={(e) => setSuchbegriff(e.target.value)}
              className="pl-10 pr-10 py-5 text-base"
            />
            {suchbegriff && (
              <button
                onClick={() => setSuchbegriff("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Stadt-Filter */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="flex items-center gap-1 text-sm text-gray-500 mr-1">
              <Navigation className="h-3.5 w-3.5" />
              Stadt:
            </span>
            {staedte.map((stadt) => (
              <Badge
                key={stadt}
                variant={stadtFilter === stadt ? "default" : "outline"}
                className={`cursor-pointer px-3 py-1.5 text-sm transition-colors ${
                  stadtFilter === stadt
                    ? "bg-[#00D26A] hover:bg-[#00B85C] text-white border-[#00D26A]"
                    : "hover:bg-[#00D26A]/10 hover:border-[#00D26A]/30"
                }`}
                onClick={() => setStadtFilter(stadt)}
              >
                {stadt}
              </Badge>
            ))}
          </div>

          {/* Ausstattungs-Filter */}
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1 text-sm text-gray-500 mr-1">
              <Tv className="h-3.5 w-3.5" />
              Ausstattung:
            </span>
            {[
              { key: "leinwand", label: "Leinwand", icon: Monitor },
              { key: "beamer", label: "Beamer", icon: Tv },
              { key: "biergarten", label: "Biergarten", icon: TreePine },
            ].map((item) => (
              <Badge
                key={item.key}
                variant={ausstattungFilter.includes(item.key) ? "default" : "outline"}
                className={`cursor-pointer px-3 py-1.5 text-sm gap-1 transition-colors ${
                  ausstattungFilter.includes(item.key)
                    ? "bg-[#F5A623] hover:bg-[#D4900E] text-white border-[#F5A623]"
                    : "hover:bg-[#F5A623]/10 hover:border-[#F5A623]/30"
                }`}
                onClick={() => toggleAusstattung(item.key)}
              >
                <item.icon className="h-3 w-3" />
                {item.label}
              </Badge>
            ))}

            <label className="flex items-center gap-2 cursor-pointer select-none ml-2">
              <input
                type="checkbox"
                checked={nurMitSpielen}
                onChange={(e) => setNurMitSpielen(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#00D26A] focus:ring-[#00D26A] accent-[#00D26A]"
              />
              <span className="text-sm text-gray-600">Nur Bars mit Spielen</span>
            </label>

            {(stadtFilter !== "Alle" || ausstattungFilter.length > 0 || suchbegriff || nurMitSpielen) && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setStadtFilter("Alle");
                  setAusstattungFilter([]);
                  setSuchbegriff("");
                  setNurMitSpielen(false);
                }}
              >
                <X className="h-3 w-3 mr-1" />
                Filter zurücksetzen
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Bar Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-[#00D26A] animate-spin" />
            <span className="ml-3 text-gray-500">Bars werden geladen...</span>
          </div>
        ) : bars.length > 0 ? (
          <>
            <p className="text-sm text-gray-500 mb-6">
              {bars.length} {bars.length === 1 ? "Bar" : "Bars"} gefunden
              {stadtFilter !== "Alle" && ` in ${stadtFilter}`}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bars.map((bar, index) => (
                <Link key={bar.id} href={`/bars/${bar.id}`}>
                  <Card className="bg-white border card-premium h-full animate-fade-up" style={{ animationDelay: `${index * 80}ms` }}>
                    <CardContent className="p-0">
                      {/* Image Placeholder */}
                      <div className="relative h-48 bg-gradient-to-br from-[#1A1A2E] to-[#242438] rounded-t-lg flex items-center justify-center pitch-pattern">
                        <span className="font-[family-name:var(--font-display)] text-2xl text-white/20 tracking-wider">
                          {bar.name}
                        </span>
                        {bar.premiumTier !== "BASIC" && (
                          <Badge
                            className={`absolute top-3 right-3 animate-shimmer ${
                              bar.premiumTier === "TOP"
                                ? "bg-[#F5A623] text-white"
                                : "bg-[#00D26A] text-white"
                            }`}
                          >
                            {bar.premiumTier}
                          </Badge>
                        )}
                      </div>

                      <div className="p-5">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg text-[#1A1A2E]">
                              {bar.name}
                            </h3>
                            <p className="flex items-center gap-1 text-sm text-gray-500">
                              <MapPin className="h-3.5 w-3.5" />
                              {bar.adresse}, {bar.stadt}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-[#F5A623] text-[#F5A623]" />
                            <span className="font-medium text-sm">
                              {bar.bewertungen.toFixed(1)}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                          {bar.beschreibung}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {bar.hatLeinwand && (
                            <Badge variant="secondary" className="text-xs bg-gray-100 gap-1">
                              <Monitor className="h-3 w-3" />
                              Leinwand
                            </Badge>
                          )}
                          {bar.hatBeamer && (
                            <Badge variant="secondary" className="text-xs bg-gray-100 gap-1">
                              <Tv className="h-3 w-3" />
                              Beamer
                            </Badge>
                          )}
                          {bar.biergarten && (
                            <Badge variant="secondary" className="text-xs bg-gray-100 gap-1">
                              <TreePine className="h-3 w-3" />
                              Biergarten
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs bg-gray-100 gap-1">
                            <Users className="h-3 w-3" />
                            {bar.kapazitaet} Plätze
                          </Badge>
                        </div>

                        {bar.spiele.length > 0 && (
                          <div className="pt-3 border-t">
                            <p className="text-xs text-gray-500 mb-2">
                              Nächste Spiele:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {bar.spiele.slice(0, 3).map((bs) => (
                                <Badge key={bs.id} variant="outline" className="text-xs inline-flex items-center gap-1">
                                  {(() => {
                                    const hb = getTeamBadge(bs.spiel.heimTeam, bs.spiel.liga);
                                    return hb?.type === "flag" ? <span>{hb.emoji}</span> : hb?.type === "logo" ? <img src={hb.url} alt="" className="h-3.5 w-3.5 object-contain" /> : null;
                                  })()}
                                  {bs.spiel.heimTeam.split(" ").pop()} vs{" "}
                                  {bs.spiel.gastTeam.split(" ").pop()}
                                  {(() => {
                                    const gb = getTeamBadge(bs.spiel.gastTeam, bs.spiel.liga);
                                    return gb?.type === "flag" ? <span>{gb.emoji}</span> : gb?.type === "logo" ? <img src={gb.url} alt="" className="h-3.5 w-3.5 object-contain" /> : null;
                                  })()}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-float" />
            <p className="text-gray-500 text-lg mb-2">
              Keine Bars gefunden.
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Probiere andere Filter oder eine andere Stadt!
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setStadtFilter("Alle");
                setAusstattungFilter([]);
                setSuchbegriff("");
              }}
            >
              Filter zurücksetzen
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
