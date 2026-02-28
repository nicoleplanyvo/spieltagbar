import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Building2,
  CalendarDays,
  BookOpen,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  MapPin,
} from "lucide-react";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") redirect("/");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Parallele Abfragen
  const [
    totalUsers,
    totalBars,
    totalSpiele,
    totalReservierungen,
    totalBewertungen,
    usersThisMonth,
    usersLastMonth,
    barsThisMonth,
    reservierungenThisMonth,
    reservierungenLastMonth,
    usersByRole,
    barsByStadt,
    reservierungsStatus,
    recentUsers,
    recentBars,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.bar.count(),
    prisma.spiel.count(),
    prisma.reservierung.count(),
    prisma.bewertung.count(),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.user.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
    prisma.bar.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.reservierung.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.reservierung.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
    prisma.user.groupBy({ by: ["role"], _count: { id: true } }),
    prisma.bar.groupBy({ by: ["stadt"], _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 10 }),
    prisma.reservierung.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.bar.findMany({
      select: {
        id: true, name: true, stadt: true, premiumTier: true, createdAt: true,
        owner: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  // Trend-Berechnung
  const userTrend = usersLastMonth > 0
    ? Math.round(((usersThisMonth - usersLastMonth) / usersLastMonth) * 100)
    : usersThisMonth > 0 ? 100 : 0;
  const resTrend = reservierungenLastMonth > 0
    ? Math.round(((reservierungenThisMonth - reservierungenLastMonth) / reservierungenLastMonth) * 100)
    : reservierungenThisMonth > 0 ? 100 : 0;

  const roleColors: Record<string, string> = {
    FAN: "bg-blue-100 text-blue-800",
    BAR_OWNER: "bg-amber-100 text-amber-800",
    ADMIN: "bg-red-100 text-red-800",
  };

  const roleLabels: Record<string, string> = {
    FAN: "Fan",
    BAR_OWNER: "Bar-Owner",
    ADMIN: "Admin",
  };

  const statusColors: Record<string, string> = {
    AUSSTEHEND: "bg-yellow-100 text-yellow-800",
    BESTAETIGT: "bg-green-100 text-green-800",
    ABGELEHNT: "bg-red-100 text-red-800",
    STORNIERT: "bg-gray-100 text-gray-800",
    NO_SHOW: "bg-orange-100 text-orange-800",
  };

  const statusLabels: Record<string, string> = {
    AUSSTEHEND: "Ausstehend",
    BESTAETIGT: "Bestätigt",
    ABGELEHNT: "Abgelehnt",
    STORNIERT: "Storniert",
    NO_SHOW: "No-Show",
  };

  const tierColors: Record<string, string> = {
    BASIC: "bg-gray-100 text-gray-700",
    PREMIUM: "bg-blue-100 text-blue-700",
    TOP: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          icon={<Users className="h-5 w-5 text-blue-500" />}
          label="Nutzer"
          value={totalUsers}
          bgColor="bg-blue-50"
        />
        <KPICard
          icon={<Building2 className="h-5 w-5 text-amber-500" />}
          label="Bars"
          value={totalBars}
          bgColor="bg-amber-50"
        />
        <KPICard
          icon={<CalendarDays className="h-5 w-5 text-green-500" />}
          label="Spiele"
          value={totalSpiele}
          bgColor="bg-green-50"
        />
        <KPICard
          icon={<BookOpen className="h-5 w-5 text-purple-500" />}
          label="Reservierungen"
          value={totalReservierungen}
          bgColor="bg-purple-50"
        />
        <KPICard
          icon={<Star className="h-5 w-5 text-yellow-500" />}
          label="Bewertungen"
          value={totalBewertungen}
          bgColor="bg-yellow-50"
        />
      </div>

      {/* Trends */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <TrendCard
          label="Neue Nutzer"
          value={usersThisMonth}
          trend={userTrend}
          subtitle="diesen Monat"
        />
        <TrendCard
          label="Neue Bars"
          value={barsThisMonth}
          subtitle="diesen Monat"
        />
        <TrendCard
          label="Reservierungen"
          value={reservierungenThisMonth}
          trend={resTrend}
          subtitle="diesen Monat"
        />
        <TrendCard
          label="Bewertungen"
          value={totalBewertungen}
          subtitle="insgesamt"
        />
      </div>

      {/* Verteilungen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nutzer nach Rolle */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-[#1A1A2E]">
              Nutzer nach Rolle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {usersByRole.map((r) => (
                <div key={r.role} className="flex items-center justify-between">
                  <Badge className={roleColors[r.role] || "bg-gray-100 text-gray-800"}>
                    {roleLabels[r.role] || r.role}
                  </Badge>
                  <span className="font-semibold text-[#1A1A2E]">{r._count.id}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bars nach Stadt */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-[#1A1A2E]">
              Top Städte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {barsByStadt.length > 0 ? barsByStadt.map((s) => (
                <div key={s.stadt} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <MapPin className="h-3.5 w-3.5" />
                    {s.stadt}
                  </span>
                  <span className="font-semibold text-[#1A1A2E]">{s._count.id}</span>
                </div>
              )) : (
                <p className="text-sm text-gray-400">Noch keine Bars</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reservierungs-Status */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-[#1A1A2E]">
              Reservierungsstatus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reservierungsStatus.length > 0 ? reservierungsStatus.map((s) => (
                <div key={s.status} className="flex items-center justify-between">
                  <Badge className={statusColors[s.status] || "bg-gray-100 text-gray-800"}>
                    {statusLabels[s.status] || s.status}
                  </Badge>
                  <span className="font-semibold text-[#1A1A2E]">{s._count.id}</span>
                </div>
              )) : (
                <p className="text-sm text-gray-400">Noch keine Reservierungen</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Neueste Einträge */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Neueste Nutzer */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-[#1A1A2E]">
              Neueste Nutzer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#1A1A2E] truncate">
                      {u.name || "—"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <Badge className={`text-xs ${roleColors[u.role]}`}>
                      {roleLabels[u.role] || u.role}
                    </Badge>
                    <span className="text-xs text-gray-400 flex items-center gap-1 whitespace-nowrap">
                      <Clock className="h-3 w-3" />
                      {formatDate(u.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Neueste Bars */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-[#1A1A2E]">
              Neueste Bars
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentBars.map((b) => (
                <div key={b.id} className="flex items-center justify-between text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#1A1A2E] truncate">
                      {b.name}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {b.stadt}
                      {b.owner?.name && <span className="ml-1">· {b.owner.name}</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <Badge className={`text-xs ${tierColors[b.premiumTier]}`}>
                      {b.premiumTier}
                    </Badge>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatDate(b.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
              {recentBars.length === 0 && (
                <p className="text-sm text-gray-400">Noch keine Bars</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ===== Hilfs-Komponenten =====

function KPICard({
  icon,
  label,
  value,
  bgColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  bgColor: string;
}) {
  return (
    <Card className="bg-white">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center shrink-0`}>
            {icon}
          </div>
          <div>
            <p className="text-2xl font-bold text-[#1A1A2E]">
              {value.toLocaleString("de-DE")}
            </p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TrendCard({
  label,
  value,
  trend,
  subtitle,
}: {
  label: string;
  value: number;
  trend?: number;
  subtitle: string;
}) {
  return (
    <Card className="bg-white">
      <CardContent className="p-4">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-[#1A1A2E]">
            {value.toLocaleString("de-DE")}
          </span>
          {trend !== undefined && (
            <span
              className={`flex items-center gap-0.5 text-xs font-medium ${
                trend > 0
                  ? "text-green-600"
                  : trend < 0
                  ? "text-red-600"
                  : "text-gray-500"
              }`}
            >
              {trend > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : trend < 0 ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
              {trend > 0 && "+"}
              {trend}%
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
