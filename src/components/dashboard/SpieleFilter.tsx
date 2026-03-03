"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TeamBadge } from "@/components/spiele/TeamBadge";
import { Clock, MapPin, Tv } from "lucide-react";

interface Spiel {
  id: string;
  heimTeam: string;
  gastTeam: string;
  liga: string;
  anpfiff: string; // serialized Date
  tvSender: string | null;
  bars: { id: string }[];
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function SpieleFilter({ spiele }: { spiele: Spiel[] }) {
  const [selectedLiga, setSelectedLiga] = useState<string>("alle");

  // Einzigartige Ligen extrahieren
  const ligen = Array.from(new Set(spiele.map((s) => s.liga))).sort();

  const filtered = selectedLiga === "alle"
    ? spiele
    : spiele.filter((s) => s.liga === selectedLiga);

  return (
    <div>
      {/* Liga-Filter */}
      {ligen.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            size="sm"
            variant={selectedLiga === "alle" ? "default" : "outline"}
            onClick={() => setSelectedLiga("alle")}
            className={
              selectedLiga === "alle"
                ? "bg-[#00D26A] hover:bg-[#00B85C] text-white text-xs"
                : "text-xs"
            }
          >
            Alle
          </Button>
          {ligen.map((liga) => (
            <Button
              key={liga}
              size="sm"
              variant={selectedLiga === liga ? "default" : "outline"}
              onClick={() => setSelectedLiga(liga)}
              className={
                selectedLiga === liga
                  ? "bg-[#00D26A] hover:bg-[#00B85C] text-white text-xs"
                  : "text-xs"
              }
            >
              {liga}
            </Button>
          ))}
        </div>
      )}

      {/* Spiele-Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((spiel) => {
            const anpfiff = new Date(spiel.anpfiff);
            return (
              <Card key={spiel.id} className="bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs bg-[#1A1A2E]/5 text-[#1A1A2E]">
                      {spiel.liga}
                    </Badge>
                    {spiel.tvSender && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Tv className="h-3 w-3" />
                        {spiel.tvSender}
                      </span>
                    )}
                  </div>
                  <div className="text-center py-1.5 space-y-1">
                    <p className="font-semibold text-[#1A1A2E] text-sm flex items-center justify-center">
                      <TeamBadge team={spiel.heimTeam} liga={spiel.liga} size="sm" nameClass="font-semibold text-[#1A1A2E] text-sm" />
                    </p>
                    <p className="text-xs text-gray-400">vs</p>
                    <p className="font-semibold text-[#1A1A2E] text-sm flex items-center justify-center">
                      <TeamBadge team={spiel.gastTeam} liga={spiel.liga} size="sm" nameClass="font-semibold text-[#1A1A2E] text-sm" />
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t text-xs">
                    <span className="flex items-center gap-1 text-gray-500">
                      <Clock className="h-3 w-3" />
                      {formatDate(anpfiff)}, {formatTime(anpfiff)}
                    </span>
                    <Link
                      href="/bars"
                      className="flex items-center gap-1 text-[#00D26A] font-medium hover:underline"
                    >
                      <MapPin className="h-3 w-3" />
                      {spiel.bars.length} Bars
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-white">
          <CardContent className="p-6 text-center text-gray-500 text-sm">
            Keine Spiele in dieser Liga gefunden.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
