"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Star,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

interface BewertungRow {
  id: string;
  sterne: number;
  kommentar: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  bar: { id: string; name: string; slug: string };
}

export default function AdminBewertungenPage() {
  const [bewertungen, setBewertungen] = useState<BewertungRow[]>([]);
  const [total, setTotal] = useState(0);
  const [sterneFilter, setSterneFilter] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const limit = 20;

  const fetchBewertungen = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (sterneFilter) {
        params.set("minSterne", sterneFilter);
        params.set("maxSterne", sterneFilter);
      }
      params.set("limit", String(limit));
      params.set("offset", String(page * limit));

      const res = await fetch(`/api/admin/bewertungen?${params}`);
      if (res.ok) {
        const data = await res.json();
        setBewertungen(data.bewertungen);
        setTotal(data.total);
      }
    } catch {
      console.error("Fehler beim Laden der Bewertungen");
    }
    setLoading(false);
  }, [sterneFilter, page]);

  useEffect(() => {
    fetchBewertungen();
  }, [fetchBewertungen]);

  async function deleteBewertung(id: string) {
    if (!confirm("Bewertung wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.")) {
      return;
    }

    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/bewertungen?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchBewertungen();
      } else {
        const data = await res.json();
        alert(data.error || "Fehler beim Löschen");
      }
    } catch {
      alert("Netzwerkfehler");
    }
    setDeleting(null);
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
            <Star className="h-5 w-5 text-yellow-500" />
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-wider text-[#1A1A2E]">
              BEWERTUNGEN
            </h2>
            <p className="text-sm text-gray-500">{total} Bewertungen insgesamt</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <Card className="bg-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Sterne:</span>
            <div className="flex gap-1">
              <button
                onClick={() => { setSterneFilter(""); setPage(0); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  !sterneFilter
                    ? "bg-[#1A1A2E] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Alle
              </button>
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => { setSterneFilter(String(s)); setPage(0); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                    sterneFilter === String(s)
                      ? "bg-[#1A1A2E] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {s} <Star className="h-3 w-3 fill-current" />
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bewertungen Liste */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-[#1A1A2E]">
            Bewertungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Laden...</div>
          ) : bewertungen.length === 0 ? (
            <div className="text-center py-8 text-gray-400">Keine Bewertungen gefunden</div>
          ) : (
            <div className="space-y-3">
              {bewertungen.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-col sm:flex-row gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-4 w-4 ${
                              s <= b.sterne
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {b.bar.name}
                      </Badge>
                    </div>
                    {b.kommentar ? (
                      <p className="text-sm text-gray-700 mb-1">{b.kommentar}</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic mb-1">Kein Kommentar</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{b.user.name || b.user.email}</span>
                      <span>·</span>
                      <span>{new Date(b.createdAt).toLocaleDateString("de-DE")}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteBewertung(b.id)}
                      disabled={deleting === b.id}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      {deleting === b.id ? (
                        <span className="text-xs">...</span>
                      ) : (
                        <>
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          <span className="text-xs">Löschen</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Spam-Hinweis */}
          {bewertungen.some((b) => b.sterne <= 1 && !b.kommentar) && (
            <div className="mt-4 p-3 bg-orange-50 rounded-lg flex items-start gap-2 text-sm text-orange-700">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                Bewertungen mit 1 Stern ohne Kommentar könnten Spam sein.
              </span>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 mt-4 border-t">
              <p className="text-xs text-gray-500">
                Seite {page + 1} von {totalPages} ({total} Bewertungen)
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
