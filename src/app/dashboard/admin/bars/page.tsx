"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Building2,
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
  Users,
  CalendarDays,
} from "lucide-react";

interface BarRow {
  id: string;
  name: string;
  slug: string;
  stadt: string;
  adresse: string;
  bewertungen: number;
  bewertungAnzahl: number;
  premiumTier: string;
  kapazitaet: number;
  createdAt: string;
  owner: { id: string; name: string | null; email: string } | null;
  _count: { reservierungen: number; spiele: number };
}

const tierColors: Record<string, string> = {
  BASIC: "bg-gray-100 text-gray-700",
  PREMIUM: "bg-blue-100 text-blue-700",
  TOP: "bg-amber-100 text-amber-700",
};

export default function AdminBarsPage() {
  const [bars, setBars] = useState<BarRow[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [changingTier, setChangingTier] = useState<string | null>(null);
  const limit = 20;

  const fetchBars = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (tierFilter) params.set("premiumTier", tierFilter);
      params.set("limit", String(limit));
      params.set("offset", String(page * limit));

      const res = await fetch(`/api/admin/bars?${params}`);
      if (res.ok) {
        const data = await res.json();
        setBars(data.bars);
        setTotal(data.total);
      }
    } catch {
      console.error("Fehler beim Laden der Bars");
    }
    setLoading(false);
  }, [search, tierFilter, page]);

  useEffect(() => {
    fetchBars();
  }, [fetchBars]);

  async function changeTier(barId: string, newTier: string) {
    setChangingTier(barId);
    try {
      const res = await fetch("/api/admin/bars", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barId, premiumTier: newTier }),
      });

      if (res.ok) {
        await fetchBars();
      } else {
        const data = await res.json();
        alert(data.error || "Fehler beim Ändern des Tiers");
      }
    } catch {
      alert("Netzwerkfehler");
    }
    setChangingTier(null);
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-wider text-[#1A1A2E]">
              BAR-VERWALTUNG
            </h2>
            <p className="text-sm text-gray-500">{total} Bars insgesamt</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <Card className="bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Name oder Stadt suchen..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="pl-10"
              />
            </div>
            <select
              value={tierFilter}
              onChange={(e) => { setTierFilter(e.target.value); setPage(0); }}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Alle Tiers</option>
              <option value="BASIC">Basic</option>
              <option value="PREMIUM">Premium</option>
              <option value="TOP">Top</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Bars */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-[#1A1A2E]">
            Bars
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Laden...</div>
          ) : bars.length === 0 ? (
            <div className="text-center py-8 text-gray-400">Keine Bars gefunden</div>
          ) : (
            <div className="space-y-3">
              {bars.map((bar) => (
                <div
                  key={bar.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[#1A1A2E] text-sm truncate">
                        {bar.name}
                      </h3>
                      <Badge className={`text-xs ${tierColors[bar.premiumTier]}`}>
                        {bar.premiumTier}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {bar.stadt}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {bar.bewertungen.toFixed(1)} ({bar.bewertungAnzahl})
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Kap. {bar.kapazitaet}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {bar._count.spiele} Spiele
                      </span>
                    </div>
                    {bar.owner && (
                      <p className="text-xs text-gray-400 mt-1">
                        Owner: {bar.owner.name || bar.owner.email}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={bar.premiumTier}
                      onChange={(e) => changeTier(bar.id, e.target.value)}
                      disabled={changingTier === bar.id}
                      className="h-8 rounded border border-gray-200 bg-white px-2 text-xs disabled:opacity-50"
                    >
                      <option value="BASIC">Basic</option>
                      <option value="PREMIUM">Premium</option>
                      <option value="TOP">Top</option>
                    </select>
                    <a
                      href={`/bars/${bar.slug || bar.id}`}
                      target="_blank"
                      rel="noopener"
                      className="text-xs text-[#00D26A] hover:underline whitespace-nowrap"
                    >
                      Ansehen
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 mt-4 border-t">
              <p className="text-xs text-gray-500">
                Seite {page + 1} von {totalPages} ({total} Bars)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
