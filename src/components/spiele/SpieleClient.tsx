"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tv,
  Clock,
  MapPin,
  ArrowRight,
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Loader2,
  Calendar,
  X,
  Shield,
  Trophy,
  Radio,
  CheckCircle2,
  CalendarDays,
  SlidersHorizontal,
} from "lucide-react";
import { getTeamBadge } from "@/lib/teams";

interface SpielBar {
  id: string;
  barId: string;
  barName: string;
  barStadt: string;
}

interface Spiel {
  id: string;
  heimTeam: string;
  gastTeam: string;
  liga: string;
  saison: string | null;
  spieltag: number | null;
  anpfiff: string;
  tvSender: string | null;
  status: string;
  ergebnis: string | null;
  bars: SpielBar[];
}

interface Liga {
  name: string;
  count: number;
}

// Liga-Kategorien für Gruppierung im Filter
const LIGA_KATEGORIEN: Record<string, string[]> = {
  Deutschland: ["Bundesliga", "2. Bundesliga", "3. Liga", "DFB-Pokal"],
  International: [
    "Champions League",
    "Europa League",
    "Conference League",
    "Nations League",
  ],
  England: ["Premier League"],
  Spanien: ["La Liga"],
  Italien: ["Serie A"],
  Frankreich: ["Ligue 1"],
  Niederlande: ["Eredivisie"],
  "\u00d6sterreich": ["\u00d6sterr. Bundesliga"],
  Schweiz: ["Schweizer Super League"],
};

// Liga-Icons (Flaggen/Emojis)
const LIGA_ICONS: Record<string, string> = {
  Bundesliga: "\ud83c\udde9\ud83c\uddea",
  "2. Bundesliga": "\ud83c\udde9\ud83c\uddea",
  "3. Liga": "\ud83c\udde9\ud83c\uddea",
  "DFB-Pokal": "\ud83c\udfc6",
  "Champions League": "\u2b50",
  "Europa League": "\ud83c\uddf2\ud83c\uddf1",
  "Conference League": "\ud83c\uddf2\ud83c\uddf1",
  "Nations League": "\ud83c\udf0d",
  "Premier League": "\ud83c\udff4\udb40\udc67\udb40\udc62\udb40\udc65\udb40\udc6e\udb40\udc67\udb40\udc7f",
  "La Liga": "\ud83c\uddea\ud83c\uddf8",
  "Serie A": "\ud83c\uddee\ud83c\uddf9",
  "Ligue 1": "\ud83c\uddeb\ud83c\uddf7",
  Eredivisie: "\ud83c\uddf3\ud83c\uddf1",
  "\u00d6sterr. Bundesliga": "\ud83c\udde6\ud83c\uddf9",
  "Schweizer Super League": "\ud83c\udde8\ud83c\udded",
};

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(dateStr));
}

function formatTime(dateStr: string) {
  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

function getDateKey(dateStr: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
}

function formatDateShort(dateStr: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateStr));
}

function TeamBadgeInline({ team, liga }: { team: string; liga: string }) {
  const badge = getTeamBadge(team, liga);
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
        {badge?.type === "logo" ? (
          <img src={badge.url} alt="" className="h-5 w-5 object-contain" />
        ) : badge?.type === "flag" ? (
          <span className="text-base">{badge.emoji}</span>
        ) : (
          <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
            {team.charAt(0)}
          </div>
        )}
      </div>
      <span className="font-semibold text-[#1A1A2E] text-sm">{team}</span>
    </div>
  );
}

// Active-Filter Chip
function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#00D26A]/10 text-[#00D26A] text-xs font-medium border border-[#00D26A]/20">
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-[#00D26A]/20 rounded-full p-0.5 transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

export function SpieleClient({
  spiele: initialSpiele,
  ligen,
}: {
  spiele: Spiel[];
  ligen: Liga[];
}) {
  const [spiele, setSpiele] = useState(initialSpiele);
  const [selectedLigen, setSelectedLigen] = useState<string[]>([]);
  const [zeitFilter, setZeitFilter] = useState<
    "alle" | "heute" | "woche" | "kommend" | "vergangen" | "datum"
  >("alle");
  const [suchBegriff, setSuchBegriff] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [liveRefreshing, setLiveRefreshing] = useState(false);

  // Erweiterte Filter
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [teamSuche, setTeamSuche] = useState("");
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [datumVon, setDatumVon] = useState("");
  const [datumBis, setDatumBis] = useState("");
  const [nurMitBars, setNurMitBars] = useState(false);

  const teamDropdownRef = useRef<HTMLDivElement>(null);

  // Close team dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        teamDropdownRef.current &&
        !teamDropdownRef.current.contains(e.target as Node)
      ) {
        setTeamDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Alle einzigartigen Teams extrahieren
  const alleTeams = useMemo(() => {
    const teams = new Set<string>();
    spiele.forEach((s) => {
      teams.add(s.heimTeam);
      teams.add(s.gastTeam);
    });
    return Array.from(teams).sort((a, b) => a.localeCompare(b, "de"));
  }, [spiele]);

  // Gefilterte Teams für Dropdown
  const gefilterteTeams = useMemo(() => {
    if (!teamSuche) return alleTeams.slice(0, 30);
    const term = teamSuche.toLowerCase();
    return alleTeams
      .filter((t) => t.toLowerCase().includes(term))
      .slice(0, 30);
  }, [alleTeams, teamSuche]);

  // Live-Ergebnisse automatisch aktualisieren
  const hasLiveSpiele = spiele.some((s) => s.status === "LIVE");

  const refreshLiveScores = useCallback(async () => {
    setLiveRefreshing(true);
    try {
      const res = await fetch("/api/spiele?includeAll=true");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setSpiele(data);
        }
      }
    } catch {
      // Stille Fehlerbehandlung
    }
    setLiveRefreshing(false);
  }, []);

  useEffect(() => {
    if (!hasLiveSpiele) return;
    const interval = setInterval(refreshLiveScores, 60000);
    return () => clearInterval(interval);
  }, [hasLiveSpiele, refreshLiveScores]);

  // Spielplan-Sync triggern
  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/spielplan-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "openliga" }),
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch {
      // Stille Fehlerbehandlung
    }
    setSyncing(false);
  };

  // Filtern
  const now = new Date();
  const heute = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const wochenEnde = new Date(heute.getTime() + 7 * 24 * 60 * 60 * 1000);

  const filteredSpiele = spiele.filter((s) => {
    // Liga-Filter
    if (selectedLigen.length > 0 && !selectedLigen.includes(s.liga))
      return false;

    // Team-Filter
    if (selectedTeams.length > 0) {
      if (
        !selectedTeams.includes(s.heimTeam) &&
        !selectedTeams.includes(s.gastTeam)
      )
        return false;
    }

    // Status-Filter
    if (statusFilter.length > 0) {
      const spielStatus =
        s.status === "LIVE"
          ? "LIVE"
          : s.status === "BEENDET" ||
              (new Date(s.anpfiff) < now && s.status !== "LIVE")
            ? "BEENDET"
            : "GEPLANT";
      if (!statusFilter.includes(spielStatus)) return false;
    }

    // Nur mit Bars
    if (nurMitBars && s.bars.length === 0) return false;

    // Zeit-Filter
    const anpfiff = new Date(s.anpfiff);
    switch (zeitFilter) {
      case "heute":
        if (anpfiff.toDateString() !== now.toDateString()) return false;
        break;
      case "woche":
        if (anpfiff < heute || anpfiff > wochenEnde) return false;
        break;
      case "kommend":
        if (anpfiff < now && s.status !== "LIVE") return false;
        break;
      case "vergangen":
        if (anpfiff > now || s.status === "LIVE") return false;
        break;
      case "datum":
        if (datumVon) {
          const von = new Date(datumVon);
          von.setHours(0, 0, 0, 0);
          if (anpfiff < von) return false;
        }
        if (datumBis) {
          const bis = new Date(datumBis);
          bis.setHours(23, 59, 59, 999);
          if (anpfiff > bis) return false;
        }
        break;
    }

    // Suchbegriff
    if (suchBegriff) {
      const term = suchBegriff.toLowerCase();
      if (
        !s.heimTeam.toLowerCase().includes(term) &&
        !s.gastTeam.toLowerCase().includes(term) &&
        !s.liga.toLowerCase().includes(term)
      )
        return false;
    }

    return true;
  });

  // Nach Datum gruppieren
  const grouped = filteredSpiele.reduce(
    (acc, spiel) => {
      const key = getDateKey(spiel.anpfiff);
      if (!acc[key]) acc[key] = [];
      acc[key].push(spiel);
      return acc;
    },
    {} as Record<string, Spiel[]>
  );

  const toggleLiga = (liga: string) => {
    setSelectedLigen((prev) =>
      prev.includes(liga) ? prev.filter((l) => l !== liga) : [...prev, liga]
    );
  };

  const toggleTeam = (team: string) => {
    setSelectedTeams((prev) =>
      prev.includes(team) ? prev.filter((t) => t !== team) : [...prev, team]
    );
  };

  const toggleStatus = (status: string) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const toggleLigaKategorie = (katLigen: string[]) => {
    const alleAusgewaehlt = katLigen.every((l) => selectedLigen.includes(l));
    if (alleAusgewaehlt) {
      setSelectedLigen((prev) => prev.filter((l) => !katLigen.includes(l)));
    } else {
      setSelectedLigen((prev) => [...new Set([...prev, ...katLigen])]);
    }
  };

  // Vorhandene Ligen nach Kategorien gruppieren
  const vorhandeneLigenNamen = ligen.map((l) => l.name);
  const kategorienMitLigen = Object.entries(LIGA_KATEGORIEN)
    .map(([kat, ligenList]) => ({
      kategorie: kat,
      ligen: ligenList.filter((l) => vorhandeneLigenNamen.includes(l)),
    }))
    .filter((k) => k.ligen.length > 0);

  // Ligen die in keiner Kategorie sind
  const kategorisiert = Object.values(LIGA_KATEGORIEN).flat();
  const sonstigeLigen = vorhandeneLigenNamen.filter(
    (l) => !kategorisiert.includes(l)
  );

  // Zähle aktive Filter
  const activeFilterCount =
    selectedLigen.length +
    selectedTeams.length +
    statusFilter.length +
    (nurMitBars ? 1 : 0) +
    (datumVon ? 1 : 0) +
    (datumBis ? 1 : 0);

  // Alle Filter zurücksetzen
  const resetAlleFilter = () => {
    setSelectedLigen([]);
    setSelectedTeams([]);
    setStatusFilter([]);
    setNurMitBars(false);
    setDatumVon("");
    setDatumBis("");
    setSuchBegriff("");
    setZeitFilter("kommend");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-[#1A1A2E] text-white py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-5xl tracking-wider text-gradient-green">
                SPIELPLAN
              </h1>
              <p className="mt-2 text-gray-400 text-sm sm:text-base">
                {spiele.length} Spiele aus {ligen.length} Ligen
                {hasLiveSpiele && (
                  <span className="ml-2 inline-flex items-center gap-1 text-red-400">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-live" />
                    LIVE
                  </span>
                )}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={syncing}
              className="border-gray-600 text-gray-300 hover:text-white hover:bg-white/10"
            >
              {syncing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              <span className="hidden sm:inline">Aktualisieren</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* =================== FILTER-BEREICH =================== */}
        <div className="bg-white rounded-2xl border shadow-sm mb-6 overflow-hidden">
          {/* Suchleiste + Filter-Toggle */}
          <div className="p-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Verein oder Liga suchen..."
                className="pl-10 bg-gray-50 border-gray-200"
                value={suchBegriff}
                onChange={(e) => setSuchBegriff(e.target.value)}
              />
              {suchBegriff && (
                <button
                  onClick={() => setSuchBegriff("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant={filterOpen ? "default" : "outline"}
              onClick={() => setFilterOpen(!filterOpen)}
              className={
                filterOpen
                  ? "bg-[#1A1A2E] hover:bg-[#1A1A2E]/90 text-white"
                  : ""
              }
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filter
              {activeFilterCount > 0 && (
                <Badge className="ml-2 bg-[#00D26A] text-white text-xs h-5 w-5 p-0 flex items-center justify-center rounded-full animate-pulse-glow">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Zeitfilter-Leiste (immer sichtbar) */}
          <div className="px-4 pb-3 flex gap-2 overflow-x-auto">
            {(
              [
                { key: "kommend", label: "Kommend", icon: Clock },
                { key: "heute", label: "Heute", icon: Calendar },
                { key: "woche", label: "Diese Woche", icon: CalendarDays },
                { key: "datum", label: "Zeitraum", icon: CalendarDays },
                { key: "vergangen", label: "Vergangen", icon: Clock },
                { key: "alle", label: "Alle", icon: null },
              ] as const
            ).map((z) => (
              <Button
                key={z.key}
                size="sm"
                variant={zeitFilter === z.key ? "default" : "outline"}
                className={`whitespace-nowrap text-xs sm:text-sm ${
                  zeitFilter === z.key
                    ? "bg-[#00D26A] hover:bg-[#00B85C] text-white"
                    : "text-gray-600"
                }`}
                onClick={() => setZeitFilter(z.key)}
              >
                {z.icon && <z.icon className="h-3 w-3 mr-1" />}
                {z.label}
              </Button>
            ))}
          </div>

          {/* Datum Von-Bis (wenn Zeitraum ausgewählt) */}
          {zeitFilter === "datum" && (
            <div className="px-4 pb-3 flex flex-col sm:flex-row gap-3 bg-gray-50/50 border-t pt-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Von
                </label>
                <Input
                  type="date"
                  value={datumVon}
                  onChange={(e) => setDatumVon(e.target.value)}
                  className="bg-white text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Bis
                </label>
                <Input
                  type="date"
                  value={datumBis}
                  onChange={(e) => setDatumBis(e.target.value)}
                  className="bg-white text-sm"
                />
              </div>
              {(datumVon || datumBis) && (
                <div className="flex items-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setDatumVon("");
                      setDatumBis("");
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ===== Erweiterter Filter (aufklappbar) ===== */}
          {filterOpen && (
            <div className="border-t bg-gray-50/50">
              <div className="p-4 space-y-5">
                {/* Zeile 1: Verein-Filter + Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ---- Verein-Filter ---- */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-[#1A1A2E] mb-2">
                      <Shield className="h-4 w-4 text-[#00D26A]" />
                      Verein
                    </label>
                    <div className="relative" ref={teamDropdownRef}>
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <Input
                        placeholder="Verein suchen..."
                        className="pl-9 bg-white text-sm"
                        value={teamSuche}
                        onChange={(e) => {
                          setTeamSuche(e.target.value);
                          setTeamDropdownOpen(true);
                        }}
                        onFocus={() => setTeamDropdownOpen(true)}
                      />
                      {teamSuche && (
                        <button
                          onClick={() => {
                            setTeamSuche("");
                            setTeamDropdownOpen(false);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {/* Team Dropdown */}
                      {teamDropdownOpen && gefilterteTeams.length > 0 && (
                        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border rounded-xl shadow-lg max-h-52 overflow-y-auto">
                          {gefilterteTeams.map((team) => {
                            const isSelected = selectedTeams.includes(team);
                            const badge = getTeamBadge(team, "");
                            return (
                              <button
                                key={team}
                                onClick={() => {
                                  toggleTeam(team);
                                  setTeamSuche("");
                                }}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                                  isSelected
                                    ? "bg-[#00D26A]/5 text-[#00D26A]"
                                    : "text-gray-700"
                                }`}
                              >
                                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                                  {badge?.type === "logo" ? (
                                    <img
                                      src={badge.url}
                                      alt=""
                                      className="h-4 w-4 object-contain"
                                    />
                                  ) : badge?.type === "flag" ? (
                                    <span className="text-sm">
                                      {badge.emoji}
                                    </span>
                                  ) : (
                                    <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-500">
                                      {team.charAt(0)}
                                    </div>
                                  )}
                                </div>
                                <span className="flex-1">{team}</span>
                                {isSelected && (
                                  <CheckCircle2 className="h-4 w-4 text-[#00D26A]" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Ausgewählte Teams Chips */}
                    {selectedTeams.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {selectedTeams.map((team) => {
                          const badge = getTeamBadge(team, "");
                          return (
                            <span
                              key={team}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00D26A]/10 text-[#00D26A] text-xs font-medium border border-[#00D26A]/20"
                            >
                              <span className="w-3.5 h-3.5 flex items-center justify-center">
                                {badge?.type === "logo" ? (
                                  <img
                                    src={badge.url}
                                    alt=""
                                    className="h-3 w-3 object-contain"
                                  />
                                ) : (
                                  <span className="text-[10px]">
                                    {badge?.emoji || team.charAt(0)}
                                  </span>
                                )}
                              </span>
                              {team}
                              <button
                                onClick={() => toggleTeam(team)}
                                className="hover:bg-[#00D26A]/20 rounded-full p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* ---- Status-Filter ---- */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-[#1A1A2E] mb-2">
                      <Radio className="h-4 w-4 text-[#00D26A]" />
                      Status
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        {
                          key: "LIVE",
                          label: "Live",
                          color:
                            "bg-red-50 text-red-600 border-red-200 hover:bg-red-100",
                          activeColor: "bg-red-500 text-white border-red-500",
                          icon: "animate-pulse",
                        },
                        {
                          key: "GEPLANT",
                          label: "Geplant",
                          color:
                            "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100",
                          activeColor: "bg-blue-500 text-white border-blue-500",
                          icon: "",
                        },
                        {
                          key: "BEENDET",
                          label: "Beendet",
                          color:
                            "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100",
                          activeColor: "bg-gray-600 text-white border-gray-600",
                          icon: "",
                        },
                      ].map((st) => (
                        <button
                          key={st.key}
                          onClick={() => toggleStatus(st.key)}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                            statusFilter.includes(st.key)
                              ? st.activeColor
                              : st.color
                          }`}
                        >
                          {st.key === "LIVE" && (
                            <span
                              className={`w-2 h-2 rounded-full ${statusFilter.includes("LIVE") ? "bg-white" : "bg-red-500"} ${st.icon}`}
                            />
                          )}
                          {st.key === "GEPLANT" && (
                            <Clock className="h-3.5 w-3.5" />
                          )}
                          {st.key === "BEENDET" && (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}
                          {st.label}
                        </button>
                      ))}
                    </div>

                    {/* Nur mit Bars */}
                    <div className="mt-3">
                      <button
                        onClick={() => setNurMitBars(!nurMitBars)}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                          nurMitBars
                            ? "bg-[#00D26A] text-white border-[#00D26A]"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        Nur Spiele mit Bars
                      </button>
                    </div>
                  </div>
                </div>

                {/* Zeile 2: Liga-Filter */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#1A1A2E] mb-3">
                    <Trophy className="h-4 w-4 text-[#00D26A]" />
                    Liga
                  </label>

                  <div className="space-y-3">
                    {kategorienMitLigen.map(
                      ({ kategorie, ligen: katLigen }) => {
                        const alleAusgewaehlt = katLigen.every((l) =>
                          selectedLigen.includes(l)
                        );
                        return (
                          <div key={kategorie}>
                            <div className="flex items-center gap-2 mb-1.5">
                              <button
                                onClick={() =>
                                  toggleLigaKategorie(katLigen)
                                }
                                className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                                  alleAusgewaehlt
                                    ? "text-[#00D26A]"
                                    : "text-gray-400 hover:text-gray-600"
                                }`}
                              >
                                {kategorie}
                              </button>
                              <button
                                onClick={() =>
                                  toggleLigaKategorie(katLigen)
                                }
                                className="text-[10px] text-gray-400 hover:text-[#00D26A]"
                              >
                                {alleAusgewaehlt
                                  ? "Alle abw\u00e4hlen"
                                  : "Alle w\u00e4hlen"}
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {katLigen.map((l) => {
                                const ligaInfo = ligen.find(
                                  (li) => li.name === l
                                );
                                const icon = LIGA_ICONS[l];
                                return (
                                  <button
                                    key={l}
                                    onClick={() => toggleLiga(l)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                                      selectedLigen.includes(l)
                                        ? "bg-[#00D26A] text-white border-[#00D26A] shadow-sm"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                    }`}
                                  >
                                    {icon && (
                                      <span className="text-xs">{icon}</span>
                                    )}
                                    {l}
                                    {ligaInfo && (
                                      <span
                                        className={`${selectedLigen.includes(l) ? "text-white/70" : "text-gray-400"}`}
                                      >
                                        ({ligaInfo.count})
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                    )}

                    {sonstigeLigen.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                          Sonstige
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {sonstigeLigen.map((l) => {
                            const ligaInfo = ligen.find(
                              (li) => li.name === l
                            );
                            return (
                              <button
                                key={l}
                                onClick={() => toggleLiga(l)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                                  selectedLigen.includes(l)
                                    ? "bg-[#00D26A] text-white border-[#00D26A] shadow-sm"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                {l}
                                {ligaInfo && (
                                  <span
                                    className={`${selectedLigen.includes(l) ? "text-white/70" : "text-gray-400"}`}
                                  >
                                    ({ligaInfo.count})
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Alle Filter zurücksetzen */}
                {activeFilterCount > 0 && (
                  <div className="pt-3 border-t flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {activeFilterCount} Filter aktiv
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={resetAlleFilter}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Alle zur\u00fccksetzen
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ===== Aktive Filter Chips ===== */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 items-center">
            <span className="text-xs text-gray-400 mr-1">
              <Filter className="h-3 w-3 inline mr-1" />
              Aktive Filter:
            </span>
            {selectedLigen.map((l) => (
              <FilterChip key={l} label={l} onRemove={() => toggleLiga(l)} />
            ))}
            {selectedTeams.map((t) => (
              <FilterChip
                key={t}
                label={t}
                onRemove={() => toggleTeam(t)}
              />
            ))}
            {statusFilter.map((s) => (
              <FilterChip
                key={s}
                label={
                  s === "LIVE"
                    ? "Live"
                    : s === "GEPLANT"
                      ? "Geplant"
                      : "Beendet"
                }
                onRemove={() => toggleStatus(s)}
              />
            ))}
            {nurMitBars && (
              <FilterChip
                label="Mit Bars"
                onRemove={() => setNurMitBars(false)}
              />
            )}
            {datumVon && (
              <FilterChip
                label={`Ab ${formatDateShort(datumVon)}`}
                onRemove={() => setDatumVon("")}
              />
            )}
            {datumBis && (
              <FilterChip
                label={`Bis ${formatDateShort(datumBis)}`}
                onRemove={() => setDatumBis("")}
              />
            )}
            <button
              onClick={resetAlleFilter}
              className="text-xs text-gray-400 hover:text-red-500 ml-1"
            >
              Alle entfernen
            </button>
          </div>
        )}

        {/* Live-Refresh Indikator */}
        {hasLiveSpiele && (
          <div className="mb-4 flex items-center gap-2 text-xs text-gray-500">
            {liveRefreshing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-live" />
            )}
            Live-Ergebnisse werden alle 60 Sekunden aktualisiert
            <button
              onClick={refreshLiveScores}
              className="text-[#00D26A] hover:underline ml-1"
            >
              Jetzt aktualisieren
            </button>
          </div>
        )}

        {/* Ergebnisse-Zähler */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {filteredSpiele.length} Spiel
            {filteredSpiele.length !== 1 ? "e" : ""} gefunden
            {selectedLigen.length > 0 &&
              ` in ${selectedLigen.slice(0, 3).join(", ")}${selectedLigen.length > 3 ? ` +${selectedLigen.length - 3}` : ""}`}
            {selectedTeams.length > 0 &&
              ` mit ${selectedTeams.slice(0, 2).join(", ")}${selectedTeams.length > 2 ? ` +${selectedTeams.length - 2}` : ""}`}
          </p>
        </div>

        {/* Spiele nach Datum gruppiert */}
        {Object.entries(grouped).map(([dateKey, daySpiele]) => (
          <div key={dateKey} className="mb-10">
            <h2 className="font-semibold text-lg text-[#1A1A2E] mb-4 flex items-center gap-2 sticky top-0 bg-[#F8FAFC] py-2 z-10">
              <Clock className="h-5 w-5 text-[#00D26A]" />
              {formatDate(daySpiele[0].anpfiff)}
              <Badge variant="secondary" className="text-xs">
                {daySpiele.length} Spiel{daySpiele.length !== 1 ? "e" : ""}
              </Badge>
            </h2>

            <div className="space-y-3">
              {daySpiele.map((spiel) => {
                const isLive = spiel.status === "LIVE";
                const isBeendet =
                  spiel.status === "BEENDET" ||
                  (new Date(spiel.anpfiff) < now && spiel.status !== "LIVE");

                return (
                  <Card
                    key={spiel.id}
                    className={`bg-white border card-premium ${
                      isLive ? "border-red-300 ring-1 ring-red-200" : ""
                    }`}
                  >
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        {/* Zeit & Status */}
                        <div className="flex items-center gap-2 sm:w-36 flex-shrink-0">
                          <span className="font-[family-name:var(--font-display)] text-xl text-[#1A1A2E]">
                            {formatTime(spiel.anpfiff)}
                          </span>
                          {isLive && (
                            <Badge className="bg-red-500 text-white animate-live text-xs">
                              LIVE
                            </Badge>
                          )}
                          {isBeendet && !isLive && (
                            <Badge variant="secondary" className="text-xs">
                              Beendet
                            </Badge>
                          )}
                        </div>

                        {/* Match */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <TeamBadgeInline
                              team={spiel.heimTeam}
                              liga={spiel.liga}
                            />

                            {/* Ergebnis oder vs */}
                            {spiel.ergebnis ? (
                              <span
                                className={`font-[family-name:var(--font-display)] text-lg px-2 ${
                                  isLive ? "text-red-500" : "text-[#1A1A2E]"
                                }`}
                              >
                                {spiel.ergebnis}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400 font-medium px-1">
                                vs
                              </span>
                            )}

                            <TeamBadgeInline
                              team={spiel.gastTeam}
                              liga={spiel.liga}
                            />
                          </div>

                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge
                              variant="secondary"
                              className="text-xs bg-[#1A1A2E]/5"
                            >
                              {LIGA_ICONS[spiel.liga] && (
                                <span className="mr-1">
                                  {LIGA_ICONS[spiel.liga]}
                                </span>
                              )}
                              {spiel.liga}
                            </Badge>
                            {spiel.spieltag && (
                              <span className="text-xs text-gray-400">
                                {spiel.spieltag}. Spieltag
                              </span>
                            )}
                            {spiel.tvSender && (
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <Tv className="h-3 w-3" />
                                {spiel.tvSender}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Bars */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {spiel.bars.length > 0 ? (
                            <>
                              <span className="flex items-center gap-1 text-sm text-[#00D26A] font-medium">
                                <MapPin className="h-4 w-4" />
                                {spiel.bars.length} Bar
                                {spiel.bars.length !== 1 ? "s" : ""}
                              </span>
                              <Link href={`/bars?spiel=${spiel.id}`}>
                                <Button
                                  size="sm"
                                  className="bg-[#00D26A] hover:bg-[#00B85C] text-white"
                                >
                                  Bars finden
                                  <ArrowRight className="ml-1 h-3 w-3" />
                                </Button>
                              </Link>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400">
                              Noch keine Bar
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bar Chips */}
                      {spiel.bars.length > 0 && (
                        <div className="mt-3 pt-3 border-t flex flex-wrap gap-2">
                          {spiel.bars.map((bs) => (
                            <Link key={bs.id} href={`/bars/${bs.barId}`}>
                              <Badge
                                variant="outline"
                                className="cursor-pointer hover:bg-[#00D26A]/10 hover:border-[#00D26A]/30 transition-colors text-xs"
                              >
                                {bs.barName} - {bs.barStadt}
                              </Badge>
                            </Link>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}

        {filteredSpiele.length === 0 && (
          <div className="text-center py-20">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4 animate-float" />
            <p className="text-gray-500 text-lg mb-2">
              Keine Spiele gefunden.
            </p>
            <p className="text-sm text-gray-400 mb-4">
              {activeFilterCount > 0
                ? "Versuche andere Filter oder setze die Filter zur\u00fcck."
                : "Klicke auf \u2018Aktualisieren\u2019 um die neuesten Spielpl\u00e4ne zu laden."}
            </p>
            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetAlleFilter}
                className="text-[#00D26A] border-[#00D26A]/30 hover:bg-[#00D26A]/10"
              >
                Filter zur\u00fccksetzen
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
