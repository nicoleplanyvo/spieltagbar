"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Star, Send, LogIn } from "lucide-react";
import Link from "next/link";

interface BewertungUser {
  id: string;
  name: string | null;
  image: string | null;
}

interface Bewertung {
  id: string;
  userId: string;
  barId: string;
  sterne: number;
  kommentar: string | null;
  createdAt: string;
  user: BewertungUser;
}

interface BewertungSectionProps {
  barId: string;
  initialDurchschnitt: number;
  initialAnzahl: number;
}

function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const [hover, setHover] = useState(0);
  const sizeClass = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-7 w-7" : "h-5 w-5";

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={readonly ? "cursor-default" : "cursor-pointer transition-transform hover:scale-110"}
        >
          <Star
            className={`${sizeClass} ${
              star <= (hover || value)
                ? "fill-[#F5A623] text-[#F5A623]"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function BewertungSection({ barId, initialDurchschnitt, initialAnzahl }: BewertungSectionProps) {
  const { data: session } = useSession();
  const [bewertungen, setBewertungen] = useState<Bewertung[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sterne, setSterne] = useState(0);
  const [kommentar, setKommentar] = useState("");
  const [durchschnitt, setDurchschnitt] = useState(initialDurchschnitt);
  const [anzahl, setAnzahl] = useState(initialAnzahl);
  const [meineBewertung, setMeineBewertung] = useState<Bewertung | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch(`/api/bewertungen?barId=${barId}`)
      .then((res) => res.json())
      .then((data) => {
        const liste = Array.isArray(data) ? data : [];
        setBewertungen(liste);
        if (session?.user?.id) {
          const meine = liste.find((b: Bewertung) => b.userId === session.user?.id);
          if (meine) {
            setMeineBewertung(meine);
            setSterne(meine.sterne);
            setKommentar(meine.kommentar || "");
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [barId, session?.user?.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sterne === 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/bewertungen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barId, sterne, kommentar }),
      });

      if (res.ok) {
        const neue = await res.json();
        if (meineBewertung) {
          setBewertungen((prev) =>
            prev.map((b) => (b.id === meineBewertung.id ? neue : b))
          );
        } else {
          setBewertungen((prev) => [neue, ...prev]);
        }
        setMeineBewertung(neue);
        setShowForm(false);

        // Durchschnitt lokal neu berechnen
        const alleBewertungen = meineBewertung
          ? bewertungen.map((b) => (b.id === meineBewertung.id ? neue : b))
          : [neue, ...bewertungen];
        const neuerDurchschnitt =
          alleBewertungen.reduce((sum: number, b: Bewertung) => sum + b.sterne, 0) /
          alleBewertungen.length;
        setDurchschnitt(neuerDurchschnitt);
        setAnzahl(alleBewertungen.length);
      }
    } catch {
      // Fehler still ignorieren
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Zusammenfassung */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Star className="h-6 w-6 fill-[#F5A623] text-[#F5A623]" />
            <span className="text-2xl font-bold text-[#1A1A2E]">
              {durchschnitt > 0 ? durchschnitt.toFixed(1) : "–"}
            </span>
          </div>
          <span className="text-gray-500 text-sm">
            {anzahl === 0
              ? "Noch keine Bewertungen"
              : `${anzahl} Bewertung${anzahl !== 1 ? "en" : ""}`}
          </span>
        </div>

        {session ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(!showForm)}
            className="text-[#00D26A] border-[#00D26A]/30 hover:bg-[#00D26A]/10"
          >
            {meineBewertung ? "Bewertung ändern" : "Bewertung abgeben"}
          </Button>
        ) : (
          <Link href="/login">
            <Button variant="outline" size="sm">
              <LogIn className="h-4 w-4 mr-1.5" />
              Anmelden zum Bewerten
            </Button>
          </Link>
        )}
      </div>

      {/* Bewertungsformular */}
      {showForm && session && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 rounded-xl p-5 space-y-4 border"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deine Bewertung
            </label>
            <StarRating value={sterne} onChange={setSterne} size="lg" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kommentar (optional)
            </label>
            <textarea
              value={kommentar}
              onChange={(e) => setKommentar(e.target.value)}
              placeholder="Wie war dein Erlebnis?"
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00D26A] focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={sterne === 0 || submitting}
              className="bg-[#00D26A] hover:bg-[#00B85C] text-white"
            >
              <Send className="h-4 w-4 mr-1.5" />
              {submitting
                ? "Wird gespeichert..."
                : meineBewertung
                  ? "Aktualisieren"
                  : "Absenden"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowForm(false)}
            >
              Abbrechen
            </Button>
          </div>
        </form>
      )}

      {/* Bewertungsliste */}
      {loading ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          Bewertungen werden geladen...
        </div>
      ) : bewertungen.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          Noch keine Bewertungen. Sei der Erste!
        </div>
      ) : (
        <div className="space-y-4">
          {bewertungen.map((bewertung) => (
            <div
              key={bewertung.id}
              className="bg-white border rounded-xl p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1A1A2E]/10 flex items-center justify-center text-sm font-medium text-[#1A1A2E]">
                    {bewertung.user.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1A1A2E]">
                      {bewertung.user.name || "Anonym"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(bewertung.createdAt)}
                    </p>
                  </div>
                </div>
                <StarRating value={bewertung.sterne} readonly size="sm" />
              </div>
              {bewertung.kommentar && (
                <p className="text-sm text-gray-600 pl-11">
                  {bewertung.kommentar}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
