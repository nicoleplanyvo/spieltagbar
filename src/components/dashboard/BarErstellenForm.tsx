"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Store,
  MapPin,
  Phone,
  Globe,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Tv,
  Sun,
  CalendarDays,
  PartyPopper,
} from "lucide-react";

export function BarErstellenForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    beschreibung: "",
    adresse: "",
    stadt: "",
    plz: "",
    telefon: "",
    website: "",
    kapazitaet: "50",
  });

  const [ausstattung, setAusstattung] = useState({
    hatLeinwand: true,
    hatBeamer: false,
    biergarten: false,
    hatReservierung: true,
  });

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    const res = await fetch("/api/bars/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, ...ausstattung }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Fehler beim Erstellen der Bar.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.refresh();
    }, 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="bg-[#1A1A2E] text-white py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl tracking-wider">
              BAR ERSTELLT!
            </h1>
          </div>
        </div>
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-[#00D26A]/10 flex items-center justify-center mx-auto mb-6">
            <PartyPopper className="h-10 w-10 text-[#00D26A]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1A1A2E] mb-3">
            Willkommen bei SpieltagBar!
          </h2>
          <p className="text-gray-500 mb-2">
            Deine Bar <strong>{form.name}</strong> wurde erfolgreich eingetragen.
          </p>
          <p className="text-sm text-gray-400">
            Du wirst gleich zu deinem Dashboard weitergeleitet...
          </p>
          <div className="mt-6">
            <Loader2 className="h-6 w-6 animate-spin text-[#00D26A] mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-[#1A1A2E] text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl tracking-wider">
            BAR EINTRAGEN
          </h1>
          <p className="text-gray-400 mt-2">
            Erstelle dein Bar-Profil in wenigen Schritten
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
        {/* Stepper */}
        <div className="flex items-center justify-center mb-8 gap-3">
          {[
            { num: 1, label: "Grunddaten" },
            { num: 2, label: "Adresse" },
            { num: 3, label: "Ausstattung" },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step === s.num
                    ? "bg-[#00D26A] text-white"
                    : step > s.num
                    ? "bg-[#00D26A]/20 text-[#00D26A]"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {step > s.num ? <CheckCircle className="h-4 w-4" /> : s.num}
              </div>
              <span
                className={`text-sm hidden sm:inline ${
                  step === s.num ? "text-[#1A1A2E] font-medium" : "text-gray-400"
                }`}
              >
                {s.label}
              </span>
              {s.num < 3 && (
                <div className={`w-8 h-0.5 ${step > s.num ? "bg-[#00D26A]" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-6">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Step 1: Grunddaten */}
        {step === 1 && (
          <Card className="bg-white">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#00D26A]/10 flex items-center justify-center">
                  <Store className="h-5 w-5 text-[#00D26A]" />
                </div>
                <div>
                  <h2 className="font-semibold text-[#1A1A2E] text-lg">Grunddaten</h2>
                  <p className="text-sm text-gray-500">Wie heißt deine Bar?</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>Name der Bar *</Label>
                  <Input
                    placeholder="z.B. Champions Corner"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Beschreibung</Label>
                  <Textarea
                    placeholder="Erzähle etwas über deine Bar — Atmosphäre, Besonderheiten, Highlights..."
                    rows={4}
                    value={form.beschreibung}
                    onChange={(e) => update("beschreibung", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kapazität (Plätze) *</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="number"
                        placeholder="50"
                        value={form.kapazitaet}
                        onChange={(e) => update("kapazitaet", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Telefon</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="tel"
                        placeholder="0211-1234567"
                        value={form.telefon}
                        onChange={(e) => update("telefon", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="url"
                      placeholder="https://meine-bar.de"
                      value={form.website}
                      onChange={(e) => update("website", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <Button
                  onClick={() => {
                    if (!form.name) {
                      setError("Bitte gib einen Namen ein.");
                      return;
                    }
                    setError("");
                    setStep(2);
                  }}
                  className="bg-[#00D26A] hover:bg-[#00B85C] text-white"
                >
                  Weiter
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Adresse */}
        {step === 2 && (
          <Card className="bg-white">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#00D26A]/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-[#00D26A]" />
                </div>
                <div>
                  <h2 className="font-semibold text-[#1A1A2E] text-lg">Adresse</h2>
                  <p className="text-sm text-gray-500">Wo finden dich deine Gäste?</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>Straße & Hausnummer *</Label>
                  <Input
                    placeholder="z.B. Bolkerstraße 42"
                    value={form.adresse}
                    onChange={(e) => update("adresse", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>PLZ *</Label>
                    <Input
                      placeholder="40213"
                      value={form.plz}
                      onChange={(e) => update("plz", e.target.value)}
                      maxLength={5}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Stadt *</Label>
                    <Input
                      placeholder="Düsseldorf"
                      value={form.stadt}
                      onChange={(e) => update("stadt", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Zurück
                </Button>
                <Button
                  onClick={() => {
                    if (!form.adresse || !form.stadt || !form.plz) {
                      setError("Bitte Adresse, PLZ und Stadt angeben.");
                      return;
                    }
                    setError("");
                    setStep(3);
                  }}
                  className="bg-[#00D26A] hover:bg-[#00B85C] text-white"
                >
                  Weiter
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Ausstattung */}
        {step === 3 && (
          <Card className="bg-white">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#00D26A]/10 flex items-center justify-center">
                  <Tv className="h-5 w-5 text-[#00D26A]" />
                </div>
                <div>
                  <h2 className="font-semibold text-[#1A1A2E] text-lg">Ausstattung</h2>
                  <p className="text-sm text-gray-500">Was bietet deine Bar?</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  { key: "hatLeinwand" as const, label: "Leinwand", icon: Tv, desc: "Große Leinwand" },
                  { key: "hatBeamer" as const, label: "Beamer", icon: Tv, desc: "Beamer-Projektion" },
                  { key: "biergarten" as const, label: "Biergarten", icon: Sun, desc: "Außenbereich" },
                  { key: "hatReservierung" as const, label: "Reservierung", icon: CalendarDays, desc: "Tischreservierung" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() =>
                      setAusstattung((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                    }
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      ausstattung[item.key]
                        ? "border-[#00D26A] bg-[#00D26A]/5 text-[#00D26A]"
                        : "border-gray-200 text-gray-400 hover:border-gray-300"
                    }`}
                  >
                    <item.icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-xs opacity-60">{item.desc}</span>
                  </button>
                ))}
              </div>

              {/* Zusammenfassung */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-semibold text-[#1A1A2E] mb-3">Zusammenfassung</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Name</span>
                    <span className="font-medium text-[#1A1A2E]">{form.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Adresse</span>
                    <span className="font-medium text-[#1A1A2E]">{form.adresse}, {form.plz} {form.stadt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Kapazität</span>
                    <span className="font-medium text-[#1A1A2E]">{form.kapazitaet} Plätze</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Zurück
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-[#00D26A] hover:bg-[#00B85C] text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Wird erstellt...
                    </>
                  ) : (
                    <>
                      <Store className="h-4 w-4 mr-2" />
                      Bar eintragen
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
