import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  MapPin,
  Users,
  Clock,
  ArrowRight,
  User,
  Tv,
  Search,
} from "lucide-react";
import { TeamBadge } from "@/components/spiele/TeamBadge";

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

function formatDateFull(date: Date) {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

const statusColors: Record<string, string> = {
  AUSSTEHEND: "bg-yellow-100 text-yellow-800",
  BESTAETIGT: "bg-green-100 text-green-800",
  ABGELEHNT: "bg-red-100 text-red-800",
  STORNIERT: "bg-gray-100 text-gray-800",
};

const statusLabels: Record<string, string> = {
  AUSSTEHEND: "Ausstehend",
  BESTAETIGT: "Bestätigt",
  ABGELEHNT: "Abgelehnt",
  STORNIERT: "Storniert",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) redirect("/login");

  if (user.role === "BAR_OWNER") {
    redirect("/dashboard/bar");
  }

  const [reservierungen, spiele] = await Promise.all([
    prisma.reservierung.findMany({
      where: { userId: user.id },
      include: { bar: true },
      orderBy: { datum: "desc" },
    }),
    prisma.spiel.findMany({
      where: { anpfiff: { gte: new Date() } },
      include: { bars: true },
      orderBy: { anpfiff: "asc" },
      take: 6,
    }),
  ]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Kompakter Header */}
      <div className="bg-[#1A1A2E] text-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#00D26A]/20 flex items-center justify-center">
                <User className="h-5 w-5 text-[#00D26A]" />
              </div>
              <div>
                <h1 className="font-semibold text-lg">
                  Hallo, {user.name || "Fan"}!
                </h1>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/spiele">
                <Button size="sm" className="bg-[#00D26A] hover:bg-[#00B85C] text-white">
                  <CalendarDays className="h-4 w-4 mr-1.5" />
                  Spielplan
                </Button>
              </Link>
              <Link href="/bars">
                <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Search className="h-4 w-4 mr-1.5" />
                  Bars
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Nächste Spiele - prominent oben */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-wider text-[#1A1A2E]">
              NÄCHSTE SPIELE
            </h2>
            <Link href="/spiele">
              <Button variant="ghost" size="sm" className="text-[#00D26A]">
                Alle
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {spiele.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {spiele.map((spiel) => (
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
                        {formatDate(spiel.anpfiff)}, {formatTime(spiel.anpfiff)}
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
              ))}
            </div>
          ) : (
            <Card className="bg-white">
              <CardContent className="p-6 text-center text-gray-500 text-sm">
                Aktuell keine kommenden Spiele im System.
              </CardContent>
            </Card>
          )}
        </div>

        {/* Meine Reservierungen */}
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-wider text-[#1A1A2E] mb-4">
            MEINE RESERVIERUNGEN
          </h2>

          {reservierungen.length > 0 ? (
            <div className="space-y-3">
              {reservierungen.map((res) => (
                <Card key={res.id} className="bg-white">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-[#1A1A2E] text-sm">
                            {res.bar.name}
                          </h3>
                          <Badge className={`text-xs ${statusColors[res.status]}`}>
                            {statusLabels[res.status]}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDateFull(res.datum)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {res.personen} Pers.
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {res.bar.stadt}
                          </span>
                        </div>
                      </div>
                      <Link href={`/bars/${res.bar.id}`}>
                        <Button variant="outline" size="sm" className="text-xs">
                          Bar ansehen
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white">
              <CardContent className="p-8 text-center">
                <CalendarDays className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm mb-3">
                  Noch keine Reservierungen.
                </p>
                <Link href="/bars">
                  <Button size="sm" className="bg-[#00D26A] hover:bg-[#00B85C] text-white">
                    Bar finden
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
