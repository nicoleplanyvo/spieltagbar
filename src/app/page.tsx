import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { TeamBadge } from "@/components/spiele/TeamBadge";
import {
  Search,
  CalendarDays,
  MapPin,
  Users,
  Star,
  Tv,
  ArrowRight,
  Clock,
  Zap,
} from "lucide-react";

async function getUpcomingSpiele() {
  return prisma.spiel.findMany({
    where: {
      anpfiff: { gte: new Date() },
    },
    include: {
      bars: true,
    },
    orderBy: { anpfiff: "asc" },
    take: 6,
  });
}

async function getFeaturedBars() {
  return prisma.bar.findMany({
    where: {
      premiumTier: { in: ["PREMIUM", "TOP"] },
    },
    orderBy: { bewertungen: "desc" },
    take: 3,
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

export default async function Home() {
  const [spiele, bars] = await Promise.all([
    getUpcomingSpiele(),
    getFeaturedBars(),
  ]);

  return (
    <div>
      {/* Hero Section - kompakt */}
      <section className="relative bg-[#1A1A2E] text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A2E] via-[#242438] to-[#1A1A2E]" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#00D26A] rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#F5A623] rounded-full blur-3xl animate-pulse-glow delay-200" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="text-center max-w-3xl mx-auto animate-fade-up">
            <h1 className="font-[family-name:var(--font-display)] text-5xl sm:text-6xl lg:text-8xl tracking-wider leading-none mb-4">
              WO LÄUFT
              <br />
              <span className="text-gradient-green">DEIN SPIEL</span>
              <span className="text-gradient-gold">?</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto mb-8">
              Finde die perfekte Sports-Bar, reserviere deinen Tisch und erlebe Fußball live.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/spiele">
                <Button
                  size="lg"
                  className="bg-[#00D26A] hover:bg-[#00B85C] text-white text-lg px-8 py-6 w-full sm:w-auto hover:scale-105 transition-transform"
                >
                  <CalendarDays className="mr-2 h-5 w-5" />
                  Spielplan ansehen
                </Button>
              </Link>
              <Link href="/bars">
                <Button
                  size="lg"
                  className="bg-white/10 border-2 border-white/30 text-white hover:bg-white/20 text-lg px-8 py-6 w-full sm:w-auto hover:scale-105 transition-transform"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Bar finden
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* So funktioniert's - kompakte Leiste */}
      <section className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { icon: CalendarDays, title: "Spiel wählen", color: "#00D26A" },
              { icon: MapPin, title: "Bar finden", color: "#F5A623" },
              { icon: Users, title: "Tisch reservieren", color: "#00D26A" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-center gap-2 animate-fade-up" style={{ animationDelay: `${(i + 1) * 100}ms` }}>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <item.icon className="h-4 w-4" style={{ color: item.color }} />
                </div>
                <span className="text-sm font-medium text-[#1A1A2E] hidden sm:inline">{item.title}</span>
                <span className="text-xs font-medium text-[#1A1A2E] sm:hidden">{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nächste Spiele - direkt nach Hero */}
      <section className="py-10 sm:py-14 bg-[#F8FAFC]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl tracking-wider text-gradient-green">
              NÄCHSTE SPIELE
            </h2>
            <Link href="/spiele" className="hidden sm:block">
              <Button variant="outline" size="sm" className="group">
                Alle Spiele
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {spiele.map((spiel, i) => (
              <Card
                key={spiel.id}
                className="border card-premium bg-white animate-fade-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      variant="secondary"
                      className="text-xs bg-[#1A1A2E]/5 text-[#1A1A2E]"
                    >
                      {spiel.liga}
                    </Badge>
                    {spiel.tvSender && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Tv className="h-3 w-3" />
                        {spiel.tvSender}
                      </span>
                    )}
                  </div>

                  <div className="text-center py-2 space-y-1">
                    <p className="font-semibold text-[#1A1A2E] text-sm flex items-center justify-center">
                      <TeamBadge team={spiel.heimTeam} liga={spiel.liga} size="sm" nameClass="font-semibold text-[#1A1A2E] text-sm" />
                    </p>
                    <p className="text-xs text-gray-400">vs</p>
                    <p className="font-semibold text-[#1A1A2E] text-sm flex items-center justify-center">
                      <TeamBadge team={spiel.gastTeam} liga={spiel.liga} size="sm" nameClass="font-semibold text-[#1A1A2E] text-sm" />
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {formatDate(spiel.anpfiff)}, {formatTime(spiel.anpfiff)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#00D26A] font-medium">
                      <MapPin className="h-3 w-3" />
                      {spiel.bars.length} Bars
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-4 text-center sm:hidden">
            <Link href="/spiele">
              <Button variant="outline" className="w-full">
                Alle Spiele ansehen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Bars */}
      <section className="py-10 sm:py-14 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl tracking-wider text-gradient-gold">
              TOP BARS
            </h2>
            <Link href="/bars" className="hidden sm:block">
              <Button variant="outline" size="sm" className="group">
                Alle Bars
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bars.map((bar, i) => (
              <Link key={bar.id} href={`/bars/${bar.id}`}>
                <Card className="border card-premium bg-white h-full animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <CardContent className="p-0">
                    <div className="h-40 bg-gradient-to-br from-[#1A1A2E] to-[#242438] rounded-t-lg flex items-center justify-center pitch-pattern">
                      <span className="font-[family-name:var(--font-display)] text-2xl text-white/20 tracking-wider">
                        {bar.name}
                      </span>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-[#1A1A2E]">
                            {bar.name}
                          </h3>
                          <p className="flex items-center gap-1 text-sm text-gray-500">
                            <MapPin className="h-3.5 w-3.5" />
                            {bar.stadt}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-[#F5A623] text-[#F5A623]" />
                          <span className="font-medium text-sm">
                            {bar.bewertungen.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-2">
                        {bar.hatLeinwand && (
                          <Badge variant="secondary" className="text-xs bg-gray-100">
                            Leinwand
                          </Badge>
                        )}
                        {bar.biergarten && (
                          <Badge variant="secondary" className="text-xs bg-gray-100">
                            Biergarten
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - kompakt */}
      <section className="py-14 bg-gradient-to-br from-[#00D26A] to-[#00B85C] text-white animate-gradient">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <Zap className="h-10 w-10 mx-auto mb-4 opacity-80 animate-float" />
          <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl tracking-wider mb-3 animate-fade-up">
            BEREIT FÜR DEN NÄCHSTEN SPIELTAG?
          </h2>
          <p className="text-white/80 mb-6 max-w-md mx-auto">
            Kostenlos registrieren und nie wieder das Spiel verpassen.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-white text-[#00B85C] hover:bg-white/90 px-8 py-6 w-full sm:w-auto font-semibold hover:scale-105 transition-transform"
              >
                Jetzt starten
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="lg"
                className="bg-white/10 border-2 border-white/30 text-white hover:bg-white/20 px-8 py-6 w-full sm:w-auto hover:scale-105 transition-transform"
              >
                Bar eintragen
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
