"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  LogIn,
} from "lucide-react";

interface Spiel {
  id: string;
  heimTeam: string;
  gastTeam: string;
  liga: string;
  anpfiff: string;
}

interface BarSpiel {
  id: string;
  spielId: string;
  plaetze: number | null;
  spiel: Spiel;
}

interface ReservierungFormProps {
  barId: string;
  barName: string;
  spiele: BarSpiel[];
}

export function ReservierungForm({ barId, barName, spiele }: ReservierungFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [datum, setDatum] = useState("");
  const [personen, setPersonen] = useState("2");
  const [spielId, setSpielId] = useState("");
  const [notiz, setNotiz] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Wenn Spiel ausgewählt, Datum automatisch setzen
  const handleSpielChange = (id: string) => {
    setSpielId(id);
    const spiel = spiele.find((s) => s.spiel.id === id);
    if (spiel) {
      const date = new Date(spiel.spiel.anpfiff);
      // Format: YYYY-MM-DDTHH:MM für datetime-local Input
      const formatted = date.toISOString().slice(0, 16);
      setDatum(formatted);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!datum) {
      setError("Bitte wähle ein Datum aus.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/reservierungen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barId,
          datum: new Date(datum).toISOString(),
          personen,
          notiz: notiz || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Reservierung fehlgeschlagen.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
      setLoading(false);
    }
  };

  // Nicht eingeloggt
  if (!session) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-600 mb-4">
          Melde dich an, um einen Tisch zu reservieren.
        </p>
        <Link href="/login">
          <Button className="w-full bg-[#00D26A] hover:bg-[#00B85C] text-white py-5 text-base">
            <LogIn className="mr-2 h-5 w-5" />
            Anmelden & Reservieren
          </Button>
        </Link>
        <p className="text-xs text-gray-400 mt-3">
          Noch kein Konto?{" "}
          <Link href="/register" className="text-[#00D26A] hover:underline">
            Kostenlos registrieren
          </Link>
        </p>
      </div>
    );
  }

  // Erfolgreich reserviert
  if (success) {
    return (
      <div className="text-center py-4 animate-fade-up">
        <div className="w-16 h-16 rounded-full bg-[#00D26A]/10 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
          <CheckCircle className="h-8 w-8 text-[#00D26A]" />
        </div>
        <h3 className="font-semibold text-lg mb-2 text-gradient-green">
          Reservierung gesendet!
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Deine Anfrage bei <strong>{barName}</strong> wurde gesendet. Du erhältst
          eine Bestätigung per E-Mail.
        </p>
        <Link href="/dashboard">
          <Button variant="outline" className="w-full">
            Zum Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  const formatSpielDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("de-DE", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Spiel auswählen (optional) */}
      {spiele.length > 0 && (
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5 text-sm">
            <CalendarDays className="h-3.5 w-3.5 text-[#00D26A]" />
            Spiel auswählen
          </Label>
          <Select value={spielId} onValueChange={handleSpielChange}>
            <SelectTrigger>
              <SelectValue placeholder="Spiel wählen (optional)" />
            </SelectTrigger>
            <SelectContent>
              {spiele.map((bs) => (
                <SelectItem key={bs.spiel.id} value={bs.spiel.id}>
                  {bs.spiel.heimTeam} vs {bs.spiel.gastTeam} — {formatSpielDate(bs.spiel.anpfiff)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Datum & Uhrzeit */}
      <div className="space-y-2">
        <Label htmlFor="datum" className="flex items-center gap-1.5 text-sm">
          <Clock className="h-3.5 w-3.5 text-[#00D26A]" />
          Datum & Uhrzeit
        </Label>
        <Input
          id="datum"
          type="datetime-local"
          value={datum}
          onChange={(e) => setDatum(e.target.value)}
          required
          min={new Date().toISOString().slice(0, 16)}
        />
      </div>

      {/* Personenzahl */}
      <div className="space-y-2">
        <Label htmlFor="personen" className="flex items-center gap-1.5 text-sm">
          <Users className="h-3.5 w-3.5 text-[#00D26A]" />
          Anzahl Personen
        </Label>
        <Select value={personen} onValueChange={setPersonen}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15].map((n) => (
              <SelectItem key={n} value={n.toString()}>
                {n} {n === 1 ? "Person" : "Personen"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Notiz */}
      <div className="space-y-2">
        <Label htmlFor="notiz" className="text-sm">
          Notiz (optional)
        </Label>
        <Textarea
          id="notiz"
          placeholder="z.B. Wir kommen als Gruppe, brauchen Platz für 2 Rollstuhlfahrer..."
          value={notiz}
          onChange={(e) => setNotiz(e.target.value)}
          rows={2}
          className="resize-none"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-[#00D26A] hover:bg-[#00B85C] text-white py-5 text-base"
      >
        {loading ? (
          "Wird gesendet..."
        ) : (
          <>
            <CheckCircle className="mr-2 h-5 w-5" />
            Tisch reservieren
          </>
        )}
      </Button>

      <p className="text-xs text-gray-400 text-center">
        Kostenlos und unverbindlich. Die Bar bestätigt deine Anfrage.
      </p>
    </form>
  );
}
