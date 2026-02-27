import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const bar = await prisma.bar.findUnique({
    where: { id },
    select: { name: true, stadt: true, beschreibung: true, bewertungen: true },
  });

  if (!bar) return { title: "Bar nicht gefunden" };

  return {
    title: `${bar.name} — Sports-Bar in ${bar.stadt}`,
    description: bar.beschreibung || `${bar.name} in ${bar.stadt} — Fußball schauen, Tisch reservieren, Bewertung ${bar.bewertungen.toFixed(1)}/5 Sterne.`,
    openGraph: {
      title: `${bar.name} — SpieltagBar`,
      description: `Sports-Bar in ${bar.stadt} — Jetzt Tisch reservieren!`,
    },
  };
}
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ReservierungForm } from "@/components/reservierung/ReservierungForm";
import { BewertungSection } from "@/components/bewertungen/BewertungSection";
import {
  MapPin,
  Star,
  Users,
  Tv,
  Monitor,
  TreePine,
  Clock,
  Phone,
  Globe,
  CalendarDays,
} from "lucide-react";
import { TeamBadge } from "@/components/spiele/TeamBadge";
import type { Oeffnungszeiten } from "@/types";

async function getBar(id: string) {
  return prisma.bar.findUnique({
    where: { id },
    include: {
      owner: { select: { name: true } },
      spiele: {
        include: { spiel: true },
        where: {
          spiel: {
            anpfiff: { gte: new Date() },
          },
        },
      },
    },
  });
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

const dayLabels: Record<string, string> = {
  mo: "Montag",
  di: "Dienstag",
  mi: "Mittwoch",
  do: "Donnerstag",
  fr: "Freitag",
  sa: "Samstag",
  so: "Sonntag",
};

export default async function BarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bar = await getBar(id);

  if (!bar) notFound();

  let oeffnungszeiten: Oeffnungszeiten | null = null;
  try {
    if (bar.oeffnungszeiten) {
      oeffnungszeiten = JSON.parse(bar.oeffnungszeiten);
    }
  } catch {
    // ignore parse errors
  }

  // Spiele für das Reservierungsformular serialisieren (Date -> string)
  const spieleFuerForm = bar.spiele.map((bs) => ({
    id: bs.id,
    spielId: bs.spielId,
    plaetze: bs.plaetze,
    spiel: {
      id: bs.spiel.id,
      heimTeam: bs.spiel.heimTeam,
      gastTeam: bs.spiel.gastTeam,
      liga: bs.spiel.liga,
      anpfiff: bs.spiel.anpfiff.toISOString(),
    },
  }));

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero */}
      <div className="relative h-64 sm:h-80 bg-gradient-to-br from-[#1A1A2E] to-[#242438] flex items-center justify-center pitch-pattern">
        <span className="font-[family-name:var(--font-display)] text-5xl sm:text-7xl text-white/10 tracking-wider">
          {bar.name}
        </span>
        {bar.premiumTier !== "BASIC" && (
          <Badge
            className={`absolute top-6 right-6 text-sm px-3 py-1 animate-shimmer ${
              bar.premiumTier === "TOP"
                ? "bg-[#F5A623] text-white"
                : "bg-[#00D26A] text-white"
            }`}
          >
            {bar.premiumTier}
          </Badge>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Rating */}
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-wider text-[#1A1A2E]">
                    {bar.name.toUpperCase()}
                  </h1>
                  <p className="flex items-center gap-1.5 mt-1 text-gray-500">
                    <MapPin className="h-4 w-4" />
                    {bar.adresse}, {bar.plz} {bar.stadt}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-[#FFF8E6] px-3 py-1.5 rounded-full">
                  <Star className="h-5 w-5 fill-[#F5A623] text-[#F5A623]" />
                  <span className="font-semibold text-[#D4900E]">
                    {bar.bewertungen.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mt-4">
                {bar.hatLeinwand && (
                  <Badge variant="secondary" className="gap-1 py-1.5 px-3 animate-fade-up">
                    <Monitor className="h-3.5 w-3.5" />
                    Leinwand
                  </Badge>
                )}
                {bar.hatBeamer && (
                  <Badge variant="secondary" className="gap-1 py-1.5 px-3 animate-fade-up delay-100">
                    <Tv className="h-3.5 w-3.5" />
                    Beamer
                  </Badge>
                )}
                {bar.biergarten && (
                  <Badge variant="secondary" className="gap-1 py-1.5 px-3 animate-fade-up delay-200">
                    <TreePine className="h-3.5 w-3.5" />
                    Biergarten
                  </Badge>
                )}
                <Badge variant="secondary" className="gap-1 py-1.5 px-3 animate-fade-up delay-300">
                  <Users className="h-3.5 w-3.5" />
                  {bar.kapazitaet} Plätze
                </Badge>
              </div>
            </div>

            {/* Description */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg text-[#1A1A2E] mb-3">
                  Über diese Bar
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {bar.beschreibung}
                </p>
              </CardContent>
            </Card>

            {/* Upcoming Games */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg text-[#1A1A2E] mb-4 flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-[#00D26A]" />
                  Nächste Spiele hier
                </h2>

                {bar.spiele.length > 0 ? (
                  <div className="space-y-3">
                    {bar.spiele.map((bs) => (
                      <div
                        key={bs.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="font-[family-name:var(--font-display)] text-lg text-[#1A1A2E]">
                              {formatTime(bs.spiel.anpfiff)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(bs.spiel.anpfiff)}
                            </p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 font-medium text-[#1A1A2E]">
                              <TeamBadge team={bs.spiel.heimTeam} liga={bs.spiel.liga} size="sm" nameClass="font-medium" />
                              <span className="text-xs text-gray-400">vs</span>
                              <TeamBadge team={bs.spiel.gastTeam} liga={bs.spiel.liga} size="sm" nameClass="font-medium" />
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="secondary" className="text-xs">
                                {bs.spiel.liga}
                              </Badge>
                              {bs.hatTon && (
                                <span className="text-xs text-gray-500">
                                  Mit Ton
                                </span>
                              )}
                              {bs.plaetze && (
                                <span className="text-xs text-[#00D26A]">
                                  {bs.plaetze} Plätze frei
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-6">
                    Aktuell keine geplanten Spiele.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Bewertungen */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg text-[#1A1A2E] mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-[#F5A623]" />
                  Bewertungen
                </h2>
                <BewertungSection
                  barId={bar.id}
                  initialDurchschnitt={bar.bewertungen}
                  initialAnzahl={bar.bewertungAnzahl}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Reservation Form */}
            <Card className="bg-white border-2 border-[#00D26A]/20 glass-card">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg text-[#1A1A2E] mb-4 flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-[#00D26A]" />
                  Tisch reservieren
                </h3>
                <Separator className="mb-4" />
                <ReservierungForm
                  barId={bar.id}
                  barName={bar.name}
                  spiele={spieleFuerForm}
                />
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg text-[#1A1A2E] mb-4">
                  Kontakt
                </h3>
                <div className="space-y-3">
                  <p className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {bar.adresse}, {bar.plz} {bar.stadt}
                  </p>
                  {bar.telefon && (
                    <p className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400" />
                      {bar.telefon}
                    </p>
                  )}
                  {bar.website && (
                    <p className="flex items-center gap-2 text-sm text-gray-600">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span className="truncate">{bar.website}</span>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Opening Hours */}
            {oeffnungszeiten && (
              <Card className="bg-white">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-[#1A1A2E] mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-[#00D26A]" />
                    Öffnungszeiten
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(oeffnungszeiten).map(([day, hours]) => (
                      <div
                        key={day}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-gray-600">
                          {dayLabels[day] || day}
                        </span>
                        <span
                          className={`font-medium ${
                            hours === "geschlossen"
                              ? "text-red-500"
                              : "text-[#1A1A2E]"
                          }`}
                        >
                          {hours}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
