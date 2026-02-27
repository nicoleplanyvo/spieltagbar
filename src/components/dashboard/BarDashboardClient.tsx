"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Store,
  Users,
  CalendarDays,
  Clock,
  Star,
  Plus,
  CheckCircle,
  XCircle,
  Trash2,
  Tag,
  Euro,
  Loader2,
  AlertCircle,
  BarChart3,
  TrendingUp,
  UserX,
  Percent,
  Target,
  Trophy,
  Camera,
  Upload,
  Save,
  MapPin,
  Phone,
  Globe,
  Tv,
  Beer,
  Sun,
  Image,
  Pencil,
  X,
} from "lucide-react";
import { getTeamBadge } from "@/lib/teams";

interface Spiel {
  id: string;
  heimTeam: string;
  gastTeam: string;
  liga: string;
  anpfiff: string;
  tvSender: string | null;
}

interface BarSpiel {
  id: string;
  spielId: string;
  hatTon: boolean;
  plaetze: number | null;
  spiel: Spiel;
}

interface Reservierung {
  id: string;
  datum: string;
  personen: number;
  status: string;
  notiz: string | null;
  gastName: string | null;
  gastTelefon: string | null;
  quelle: string;
  user: { name: string | null; email: string } | null;
}

interface PromoDeal {
  id: string;
  titel: string;
  beschreibung: string | null;
  preis: number;
  originalPreis: number | null;
  maxPlaetze: number;
  gebuchtePlaetze: number;
  spielTag: string | null;
  gueltigVon: string;
  gueltigBis: string;
  aktiv: boolean;
}

interface TopTeam {
  team: string;
  gaeste: number;
  spiele: number;
  durchschnitt: number;
}

interface KPIs {
  totalReservierungen: number;
  bestaetigteReservierungen: number;
  noShowRate: number;
  bestaetigungsRate: number;
  stornierungsRate: number;
  durchschnGruppe: number;
  totalGaeste: number;
  kapazitaetsRate: number;
  resProSpieltag: number;
  promoUmsatz: number;
  umsatzProBuchung: number;
  kapazitaet: number;
  letzteSpieleTage: number;
  noShowCount: number;
  topTeams: TopTeam[];
}

interface BarFoto {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
}

interface BarData {
  id: string;
  name: string;
  slug: string;
  beschreibung: string | null;
  adresse: string;
  stadt: string;
  plz: string;
  telefon: string | null;
  website: string | null;
  bildUrl: string | null;
  hatReservierung: boolean;
  hatLeinwand: boolean;
  hatBeamer: boolean;
  biergarten: boolean;
  oeffnungszeiten: string | null;
  bewertungen: number;
  premiumTier: string;
  kapazitaet: number;
  fotos: BarFoto[];
  spiele: BarSpiel[];
  reservierungen: Reservierung[];
  promoDeals: PromoDeal[];
}

const statusColors: Record<string, string> = {
  AUSSTEHEND: "bg-yellow-100 text-yellow-800",
  BESTAETIGT: "bg-green-100 text-green-800",
  ABGELEHNT: "bg-red-100 text-red-800",
  STORNIERT: "bg-gray-100 text-gray-800",
  NO_SHOW: "bg-red-100 text-red-600",
};

const statusLabels: Record<string, string> = {
  AUSSTEHEND: "Ausstehend",
  BESTAETIGT: "Bestätigt",
  ABGELEHNT: "Abgelehnt",
  STORNIERT: "Storniert",
  NO_SHOW: "No-Show",
};

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

export function BarDashboardClient({ bar: initialBar, kpis }: { bar: BarData; kpis: KPIs }) {
  const [bar, setBar] = useState(initialBar);
  const [activeTab, setActiveTab] = useState<"meinebar" | "kpis" | "spiele" | "reservierungen" | "promos">("meinebar");

  // --- Spiel hinzufügen ---
  const [spieleVerfuegbar, setSpieleVerfuegbar] = useState<Spiel[]>([]);
  const [spielDialogOpen, setSpielDialogOpen] = useState(false);
  const [selectedSpielId, setSelectedSpielId] = useState("");
  const [spielPlaetze, setSpielPlaetze] = useState("");
  const [spielLoading, setSpielLoading] = useState(false);
  const [spielSuche, setSpielSuche] = useState("");
  const [spielLigaFilter, setSpielLigaFilter] = useState("");

  const loadVerfuegbareSpiele = async () => {
    const res = await fetch("/api/spiele");
    const data = await res.json();
    if (Array.isArray(data)) {
      const existingIds = bar.spiele.map((bs) => bs.spielId);
      setSpieleVerfuegbar(data.filter((s: Spiel) => !existingIds.includes(s.id)));
    }
  };

  // Gefilterte verfügbare Spiele
  const gefilterteSpiele = spieleVerfuegbar.filter((s) => {
    if (spielLigaFilter && s.liga !== spielLigaFilter) return false;
    if (spielSuche) {
      const term = spielSuche.toLowerCase();
      if (
        !s.heimTeam.toLowerCase().includes(term) &&
        !s.gastTeam.toLowerCase().includes(term)
      )
        return false;
    }
    return true;
  });

  // Verfügbare Ligen aus den Spielen extrahieren
  const verfuegbareLigen = [...new Set(spieleVerfuegbar.map((s) => s.liga))].sort();

  const handleAddSpiel = async () => {
    if (!selectedSpielId) return;
    setSpielLoading(true);
    const res = await fetch("/api/bars/spiele", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        spielId: selectedSpielId,
        plaetze: spielPlaetze || null,
        hatTon: true,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setBar((prev) => ({ ...prev, spiele: [...prev.spiele, data] }));
      setSpielDialogOpen(false);
      setSelectedSpielId("");
      setSpielPlaetze("");
    }
    setSpielLoading(false);
  };

  const handleRemoveSpiel = async (barSpielId: string) => {
    const res = await fetch(`/api/bars/spiele?id=${barSpielId}`, { method: "DELETE" });
    if (res.ok) {
      setBar((prev) => ({
        ...prev,
        spiele: prev.spiele.filter((s) => s.id !== barSpielId),
      }));
    }
  };

  const handleUpdatePlaetze = async (barSpielId: string, plaetze: string) => {
    await fetch("/api/bars/spiele", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ barSpielId, plaetze: plaetze || null }),
    });
    setBar((prev) => ({
      ...prev,
      spiele: prev.spiele.map((s) =>
        s.id === barSpielId ? { ...s, plaetze: plaetze ? parseInt(plaetze) : null } : s
      ),
    }));
  };

  // --- Reservierungen verwalten ---
  const handleReservierungStatus = async (resId: string, status: string) => {
    const res = await fetch(`/api/reservierungen/${resId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setBar((prev) => ({
        ...prev,
        reservierungen: prev.reservierungen.map((r) =>
          r.id === resId ? { ...r, status } : r
        ),
      }));
    }
  };

  // --- Promo-Deals ---
  const [promoDialogOpen, setPromoDialogOpen] = useState(false);
  const [promoForm, setPromoForm] = useState({
    titel: "",
    beschreibung: "",
    preis: "",
    originalPreis: "",
    maxPlaetze: "",
    gueltigVon: "",
    gueltigBis: "",
  });
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");

  const handleCreatePromo = async () => {
    setPromoError("");
    if (!promoForm.titel || !promoForm.preis || !promoForm.maxPlaetze || !promoForm.gueltigVon || !promoForm.gueltigBis) {
      setPromoError("Bitte alle Pflichtfelder ausfüllen.");
      return;
    }
    setPromoLoading(true);
    const res = await fetch("/api/bars/promos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(promoForm),
    });
    const data = await res.json();
    if (res.ok) {
      setBar((prev) => ({
        ...prev,
        promoDeals: [{ ...data, buchungen: [] }, ...prev.promoDeals],
      }));
      setPromoDialogOpen(false);
      setPromoForm({ titel: "", beschreibung: "", preis: "", originalPreis: "", maxPlaetze: "", gueltigVon: "", gueltigBis: "" });
    } else {
      setPromoError(data.error || "Fehler beim Erstellen.");
    }
    setPromoLoading(false);
  };

  const handleTogglePromo = async (id: string, aktiv: boolean) => {
    const res = await fetch("/api/bars/promos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, aktiv }),
    });
    if (res.ok) {
      setBar((prev) => ({
        ...prev,
        promoDeals: prev.promoDeals.map((p) => (p.id === id ? { ...p, aktiv } : p)),
      }));
    }
  };

  // --- Manuelle Reservierung ---
  const [manuelDialogOpen, setManuelDialogOpen] = useState(false);
  const [manuelForm, setManuelForm] = useState({
    gastName: "",
    gastTelefon: "",
    datum: "",
    personen: "",
    notiz: "",
  });
  const [manuelLoading, setManuelLoading] = useState(false);
  const [manuelError, setManuelError] = useState("");

  const handleManuelleReservierung = async () => {
    setManuelError("");
    if (!manuelForm.gastName || !manuelForm.datum || !manuelForm.personen) {
      setManuelError("Name, Datum und Personenzahl sind Pflichtfelder.");
      return;
    }
    setManuelLoading(true);
    const res = await fetch("/api/bars/reservierungen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(manuelForm),
    });
    const data = await res.json();
    if (res.ok) {
      setBar((prev) => ({
        ...prev,
        reservierungen: [data, ...prev.reservierungen],
      }));
      setManuelDialogOpen(false);
      setManuelForm({ gastName: "", gastTelefon: "", datum: "", personen: "", notiz: "" });
    } else {
      setManuelError(data.error || "Fehler beim Erstellen.");
    }
    setManuelLoading(false);
  };

  // --- Meine Bar Profil bearbeiten ---
  const [profilEditing, setProfilEditing] = useState(false);
  const [profilSaving, setProfilSaving] = useState(false);
  const [profilSuccess, setProfilSuccess] = useState(false);
  const [profilForm, setProfilForm] = useState({
    name: initialBar.name,
    beschreibung: initialBar.beschreibung || "",
    adresse: initialBar.adresse,
    stadt: initialBar.stadt,
    plz: initialBar.plz,
    telefon: initialBar.telefon || "",
    website: initialBar.website || "",
    kapazitaet: initialBar.kapazitaet.toString(),
    hatLeinwand: initialBar.hatLeinwand,
    hatBeamer: initialBar.hatBeamer,
    biergarten: initialBar.biergarten,
    hatReservierung: initialBar.hatReservierung,
    oeffnungszeiten: initialBar.oeffnungszeiten || "",
  });

  const [oeffnungszeiten, setOeffnungszeiten] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(initialBar.oeffnungszeiten || "{}");
    } catch {
      return {};
    }
  });

  const handleProfilSave = async () => {
    setProfilSaving(true);
    setProfilSuccess(false);
    const res = await fetch("/api/bars/profil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...profilForm,
        kapazitaet: parseInt(profilForm.kapazitaet) || bar.kapazitaet,
        oeffnungszeiten: JSON.stringify(oeffnungszeiten),
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setBar((prev) => ({
        ...prev,
        name: data.name,
        beschreibung: data.beschreibung,
        adresse: data.adresse,
        stadt: data.stadt,
        plz: data.plz,
        telefon: data.telefon,
        website: data.website,
        kapazitaet: data.kapazitaet,
        hatLeinwand: data.hatLeinwand,
        hatBeamer: data.hatBeamer,
        biergarten: data.biergarten,
        hatReservierung: data.hatReservierung,
        oeffnungszeiten: data.oeffnungszeiten,
      }));
      setProfilEditing(false);
      setProfilSuccess(true);
      setTimeout(() => setProfilSuccess(false), 3000);
    }
    setProfilSaving(false);
  };

  // --- Fotos verwalten ---
  const [fotoUploading, setFotoUploading] = useState(false);

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("alt", file.name);
    const res = await fetch("/api/bars/fotos", {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      const foto = await res.json();
      setBar((prev) => ({ ...prev, fotos: [...prev.fotos, foto] }));
    }
    setFotoUploading(false);
    e.target.value = "";
  };

  const handleFotoDelete = async (fotoId: string) => {
    const res = await fetch(`/api/bars/fotos?id=${fotoId}`, { method: "DELETE" });
    if (res.ok) {
      setBar((prev) => ({ ...prev, fotos: prev.fotos.filter((f) => f.id !== fotoId) }));
    }
  };

  const handleHauptbildSetzen = async (url: string) => {
    const res = await fetch("/api/bars/profil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bildUrl: url }),
    });
    if (res.ok) {
      setBar((prev) => ({ ...prev, bildUrl: url }));
    }
  };

  const pendingRes = bar.reservierungen.filter((r) => r.status === "AUSSTEHEND").length;
  const confirmedGuests = bar.reservierungen
    .filter((r) => r.status === "BESTAETIGT")
    .reduce((sum, r) => sum + r.personen, 0);

  // Heutige bestätigte Gäste (für Kapazitätsanzeige)
  const today = new Date().toDateString();
  const heuteGaeste = bar.reservierungen
    .filter((r) => r.status === "BESTAETIGT" && new Date(r.datum).toDateString() === today)
    .reduce((sum, r) => sum + r.personen, 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-[#1A1A2E] text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#F5A623]/20 flex items-center justify-center">
              <Store className="h-6 w-6 text-[#F5A623]" />
            </div>
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl tracking-wider">
                {bar.name.toUpperCase()}
              </h1>
              <p className="text-gray-400 text-sm">Bar Dashboard</p>
            </div>
            <Badge
              className={`ml-auto ${
                bar.premiumTier === "TOP"
                  ? "bg-[#F5A623] text-white"
                  : bar.premiumTier === "PREMIUM"
                  ? "bg-[#00D26A] text-white"
                  : "bg-gray-600 text-white"
              }`}
            >
              {bar.premiumTier}
            </Badge>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Bewertung", value: bar.bewertungen.toFixed(1), icon: Star, color: "#F5A623" },
            { label: "Nächste Spiele", value: bar.spiele.length.toString(), icon: CalendarDays, color: "#00D26A" },
            { label: "Offene Anfragen", value: pendingRes.toString(), icon: Clock, color: "#F5A623" },
            { label: "Bestätigte Gäste", value: confirmedGuests.toString(), icon: Users, color: "#00D26A" },
          ].map((stat) => (
            <Card key={stat.label} className="bg-white">
              <CardContent className="p-5 flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="font-[family-name:var(--font-display)] text-2xl text-[#1A1A2E]">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b overflow-x-auto">
          {[
            { key: "meinebar" as const, label: "Meine Bar", icon: Store },
            { key: "kpis" as const, label: "KPIs", icon: BarChart3 },
            { key: "spiele" as const, label: "Spiele", icon: CalendarDays },
            { key: "reservierungen" as const, label: "Reservierungen", icon: Users },
            { key: "promos" as const, label: "Promo-Deals", icon: Tag },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-[#00D26A] text-[#00D26A]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.key === "reservierungen" && pendingRes > 0 && (
                <Badge className="bg-[#F5A623] text-white text-xs ml-1">{pendingRes}</Badge>
              )}
            </button>
          ))}
        </div>

        {/* Meine Bar Tab */}
        {activeTab === "meinebar" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-wider text-[#1A1A2E]">
                MEINE BAR
              </h2>
              {!profilEditing ? (
                <Button
                  onClick={() => setProfilEditing(true)}
                  className="bg-[#00D26A] hover:bg-[#00B85C] text-white"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Bearbeiten
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setProfilEditing(false)}
                  >
                    Abbrechen
                  </Button>
                  <Button
                    onClick={handleProfilSave}
                    disabled={profilSaving}
                    className="bg-[#00D26A] hover:bg-[#00B85C] text-white"
                  >
                    {profilSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Speichern
                  </Button>
                </div>
              )}
            </div>

            {profilSuccess && (
              <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                <CheckCircle className="h-4 w-4" />
                Profil erfolgreich gespeichert!
              </div>
            )}

            {/* Hauptbild */}
            <Card className="bg-white overflow-hidden">
              <div className="relative h-48 sm:h-64 bg-gray-100">
                {bar.bildUrl ? (
                  <img
                    src={bar.bildUrl}
                    alt={bar.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Camera className="h-16 w-16" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-[family-name:var(--font-display)] text-2xl tracking-wider">
                    {bar.name}
                  </h3>
                  <p className="text-white/80 text-sm mt-1">
                    {bar.adresse}, {bar.plz} {bar.stadt}
                  </p>
                </div>
              </div>
            </Card>

            {/* Profil-Infos / Bearbeitungsformular */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Linke Spalte: Grundinfos */}
              <Card className="bg-white">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-[#1A1A2E] mb-4 flex items-center gap-2">
                    <Store className="h-4 w-4 text-[#00D26A]" />
                    Grundinformationen
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-gray-500">Name</Label>
                      {profilEditing ? (
                        <Input
                          value={profilForm.name}
                          onChange={(e) => setProfilForm({ ...profilForm, name: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                        <p className="font-medium text-[#1A1A2E]">{bar.name}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Beschreibung</Label>
                      {profilEditing ? (
                        <Textarea
                          value={profilForm.beschreibung}
                          onChange={(e) => setProfilForm({ ...profilForm, beschreibung: e.target.value })}
                          rows={4}
                          className="mt-1"
                          placeholder="Beschreibe deine Bar..."
                        />
                      ) : (
                        <p className="text-sm text-gray-600 mt-1">
                          {bar.beschreibung || <span className="text-gray-400 italic">Keine Beschreibung</span>}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-gray-500">Kapazität</Label>
                        {profilEditing ? (
                          <Input
                            type="number"
                            value={profilForm.kapazitaet}
                            onChange={(e) => setProfilForm({ ...profilForm, kapazitaet: e.target.value })}
                            className="mt-1"
                          />
                        ) : (
                          <p className="font-medium text-[#1A1A2E]">{bar.kapazitaet} Plätze</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Premium-Tier</Label>
                        <p className="font-medium text-[#1A1A2E]">
                          <Badge
                            className={
                              bar.premiumTier === "TOP"
                                ? "bg-[#F5A623] text-white"
                                : bar.premiumTier === "PREMIUM"
                                ? "bg-[#00D26A] text-white"
                                : "bg-gray-200 text-gray-700"
                            }
                          >
                            {bar.premiumTier}
                          </Badge>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rechte Spalte: Kontakt & Adresse */}
              <Card className="bg-white">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-[#1A1A2E] mb-4 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#00D26A]" />
                    Kontakt & Adresse
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-gray-500">Adresse</Label>
                      {profilEditing ? (
                        <Input
                          value={profilForm.adresse}
                          onChange={(e) => setProfilForm({ ...profilForm, adresse: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                        <p className="font-medium text-[#1A1A2E] flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-gray-400" />
                          {bar.adresse}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-gray-500">Stadt</Label>
                        {profilEditing ? (
                          <Input
                            value={profilForm.stadt}
                            onChange={(e) => setProfilForm({ ...profilForm, stadt: e.target.value })}
                            className="mt-1"
                          />
                        ) : (
                          <p className="font-medium text-[#1A1A2E]">{bar.stadt}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">PLZ</Label>
                        {profilEditing ? (
                          <Input
                            value={profilForm.plz}
                            onChange={(e) => setProfilForm({ ...profilForm, plz: e.target.value })}
                            className="mt-1"
                          />
                        ) : (
                          <p className="font-medium text-[#1A1A2E]">{bar.plz}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Telefon</Label>
                      {profilEditing ? (
                        <Input
                          type="tel"
                          value={profilForm.telefon}
                          onChange={(e) => setProfilForm({ ...profilForm, telefon: e.target.value })}
                          className="mt-1"
                          placeholder="z.B. 0211-1234567"
                        />
                      ) : (
                        <p className="font-medium text-[#1A1A2E] flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-gray-400" />
                          {bar.telefon || <span className="text-gray-400 italic">Nicht angegeben</span>}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Website</Label>
                      {profilEditing ? (
                        <Input
                          type="url"
                          value={profilForm.website}
                          onChange={(e) => setProfilForm({ ...profilForm, website: e.target.value })}
                          className="mt-1"
                          placeholder="https://..."
                        />
                      ) : (
                        <p className="font-medium text-[#1A1A2E] flex items-center gap-1.5">
                          <Globe className="h-3.5 w-3.5 text-gray-400" />
                          {bar.website ? (
                            <a href={bar.website} target="_blank" rel="noopener noreferrer" className="text-[#00D26A] hover:underline">
                              {bar.website}
                            </a>
                          ) : (
                            <span className="text-gray-400 italic">Nicht angegeben</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ausstattung */}
            <Card className="bg-white">
              <CardContent className="p-5">
                <h3 className="font-semibold text-[#1A1A2E] mb-4 flex items-center gap-2">
                  <Tv className="h-4 w-4 text-[#00D26A]" />
                  Ausstattung
                </h3>
                {profilEditing ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { key: "hatLeinwand" as const, label: "Leinwand", icon: Tv },
                      { key: "hatBeamer" as const, label: "Beamer", icon: Tv },
                      { key: "biergarten" as const, label: "Biergarten", icon: Sun },
                      { key: "hatReservierung" as const, label: "Reservierung", icon: CalendarDays },
                    ].map((item) => (
                      <button
                        key={item.key}
                        onClick={() => setProfilForm({ ...profilForm, [item.key]: !profilForm[item.key] })}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                          profilForm[item.key]
                            ? "border-[#00D26A] bg-[#00D26A]/5 text-[#00D26A]"
                            : "border-gray-200 text-gray-400 hover:border-gray-300"
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {bar.hatLeinwand && (
                      <Badge className="bg-[#00D26A]/10 text-[#00D26A] border border-[#00D26A]/20">
                        <Tv className="h-3 w-3 mr-1" /> Leinwand
                      </Badge>
                    )}
                    {bar.hatBeamer && (
                      <Badge className="bg-[#00D26A]/10 text-[#00D26A] border border-[#00D26A]/20">
                        <Tv className="h-3 w-3 mr-1" /> Beamer
                      </Badge>
                    )}
                    {bar.biergarten && (
                      <Badge className="bg-[#00D26A]/10 text-[#00D26A] border border-[#00D26A]/20">
                        <Sun className="h-3 w-3 mr-1" /> Biergarten
                      </Badge>
                    )}
                    {bar.hatReservierung && (
                      <Badge className="bg-[#00D26A]/10 text-[#00D26A] border border-[#00D26A]/20">
                        <CalendarDays className="h-3 w-3 mr-1" /> Reservierung
                      </Badge>
                    )}
                    {!bar.hatLeinwand && !bar.hatBeamer && !bar.biergarten && !bar.hatReservierung && (
                      <span className="text-sm text-gray-400 italic">Keine Ausstattung angegeben</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Öffnungszeiten */}
            <Card className="bg-white">
              <CardContent className="p-5">
                <h3 className="font-semibold text-[#1A1A2E] mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#00D26A]" />
                  Öffnungszeiten
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { key: "mo", label: "Montag" },
                    { key: "di", label: "Dienstag" },
                    { key: "mi", label: "Mittwoch" },
                    { key: "do", label: "Donnerstag" },
                    { key: "fr", label: "Freitag" },
                    { key: "sa", label: "Samstag" },
                    { key: "so", label: "Sonntag" },
                  ].map((tag) => (
                    <div
                      key={tag.key}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50"
                    >
                      <span className="text-sm font-medium text-[#1A1A2E] w-24">
                        {tag.label}
                      </span>
                      {profilEditing ? (
                        <Input
                          className="w-40 h-8 text-sm"
                          placeholder="z.B. 16:00-01:00"
                          value={oeffnungszeiten[tag.key] || ""}
                          onChange={(e) =>
                            setOeffnungszeiten({
                              ...oeffnungszeiten,
                              [tag.key]: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <span
                          className={`text-sm ${
                            oeffnungszeiten[tag.key] === "geschlossen"
                              ? "text-red-400"
                              : "text-gray-600"
                          }`}
                        >
                          {oeffnungszeiten[tag.key] || (
                            <span className="text-gray-300">—</span>
                          )}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Fotos / Galerie */}
            <Card className="bg-white">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[#1A1A2E] flex items-center gap-2">
                    <Image className="h-4 w-4 text-[#00D26A]" />
                    Fotos ({bar.fotos.length}/10)
                  </h3>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFotoUpload}
                      disabled={fotoUploading || bar.fotos.length >= 10}
                    />
                    <span
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        fotoUploading || bar.fotos.length >= 10
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-[#00D26A] text-white hover:bg-[#00B85C] cursor-pointer"
                      }`}
                    >
                      {fotoUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      Foto hochladen
                    </span>
                  </label>
                </div>

                {bar.fotos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {bar.fotos.map((foto) => (
                      <div
                        key={foto.id}
                        className="relative group rounded-xl overflow-hidden border aspect-square"
                      >
                        <img
                          src={foto.url}
                          alt={foto.alt || "Bar-Foto"}
                          className="w-full h-full object-cover"
                        />
                        {/* Overlay mit Aktionen */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => handleHauptbildSetzen(foto.url)}
                            className={`p-2 rounded-full transition-colors ${
                              bar.bildUrl === foto.url
                                ? "bg-[#00D26A] text-white"
                                : "bg-white/90 text-gray-700 hover:bg-white"
                            }`}
                            title="Als Hauptbild setzen"
                          >
                            <Star className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleFotoDelete(foto.id)}
                            className="p-2 bg-white/90 text-red-500 rounded-full hover:bg-white transition-colors"
                            title="Löschen"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        {/* Hauptbild Badge */}
                        {bar.bildUrl === foto.url && (
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-[#00D26A] text-white text-[10px]">
                              <Star className="h-2.5 w-2.5 mr-0.5" /> Hauptbild
                            </Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border-2 border-dashed rounded-xl">
                    <Camera className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-1">Noch keine Fotos hochgeladen</p>
                    <p className="text-sm text-gray-400">
                      Lade bis zu 10 Fotos hoch, um deine Bar zu präsentieren.
                    </p>
                    <p className="text-xs text-gray-300 mt-2">Max. 5 MB pro Bild · JPG, PNG, WebP</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* KPIs Tab */}
        {activeTab === "kpis" && (
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-wider text-[#1A1A2E] mb-6">
              KENNZAHLEN
            </h2>

            {/* Haupt-KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <Card className="bg-white">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                      <UserX className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">No-Show-Rate</p>
                      <p className="font-[family-name:var(--font-display)] text-2xl text-[#1A1A2E]">
                        {kpis.noShowRate}%
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    {kpis.noShowCount} von {kpis.bestaetigteReservierungen + kpis.noShowCount} bestätigten Reservierungen
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#00D26A]/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-[#00D26A]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Res. pro Spieltag</p>
                      <p className="font-[family-name:var(--font-display)] text-2xl text-[#1A1A2E]">
                        {kpis.resProSpieltag}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    Letzte 30 Tage ({kpis.letzteSpieleTage} Spieltage)
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <Target className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Kapazitätsauslastung</p>
                      <p className="font-[family-name:var(--font-display)] text-2xl text-[#1A1A2E]">
                        {kpis.kapazitaetsRate}%
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    {kpis.kapazitaet} Plätze Kapazität
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#F5A623]/10 flex items-center justify-center">
                      <Euro className="h-5 w-5 text-[#F5A623]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Umsatz pro Buchung</p>
                      <p className="font-[family-name:var(--font-display)] text-2xl text-[#1A1A2E]">
                        {kpis.umsatzProBuchung.toFixed(2)} €
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    Gesamt-Promo-Umsatz: {kpis.promoUmsatz.toFixed(2)} €
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                      <Percent className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Bestätigungsrate</p>
                      <p className="font-[family-name:var(--font-display)] text-2xl text-[#1A1A2E]">
                        {kpis.bestaetigungsRate}%
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    {kpis.bestaetigteReservierungen} von {kpis.totalReservierungen} Reservierungen
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                      <Users className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Ø Gruppengröße</p>
                      <p className="font-[family-name:var(--font-display)] text-2xl text-[#1A1A2E]">
                        {kpis.durchschnGruppe} Pers.
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    {kpis.totalGaeste} Gäste insgesamt (bestätigt)
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Stornierungsrate als extra Info */}
            <Card className="bg-white">
              <CardContent className="p-5">
                <h3 className="font-semibold text-[#1A1A2E] mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-gray-400" />
                  Reservierungs-Übersicht
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-3 rounded-lg bg-gray-50">
                    <p className="text-2xl font-bold text-[#1A1A2E]">{kpis.totalReservierungen}</p>
                    <p className="text-xs text-gray-500 mt-1">Gesamt</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-green-50">
                    <p className="text-2xl font-bold text-green-600">{kpis.bestaetigteReservierungen}</p>
                    <p className="text-xs text-gray-500 mt-1">Bestätigt</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-red-50">
                    <p className="text-2xl font-bold text-red-500">{kpis.noShowCount}</p>
                    <p className="text-xs text-gray-500 mt-1">No-Shows</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-yellow-50">
                    <p className="text-2xl font-bold text-yellow-600">{kpis.stornierungsRate}%</p>
                    <p className="text-xs text-gray-500 mt-1">Storniert</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top-Teams nach Gästen */}
            <Card className="bg-white mt-6">
              <CardContent className="p-5">
                <h3 className="font-semibold text-[#1A1A2E] mb-4 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-[#F5A623]" />
                  Top-Vereine nach Gästezahl
                </h3>
                {kpis.topTeams.length > 0 ? (
                  <div className="space-y-3">
                    {kpis.topTeams.map((entry, idx) => {
                      const badge = getTeamBadge(entry.team);
                      const maxGaeste = kpis.topTeams[0].gaeste;
                      const barWidth = maxGaeste > 0 ? (entry.gaeste / maxGaeste) * 100 : 0;
                      return (
                        <div key={entry.team} className="flex items-center gap-3">
                          <span className={`w-6 text-center font-[family-name:var(--font-display)] text-lg ${
                            idx === 0 ? "text-[#F5A623]" : idx === 1 ? "text-gray-400" : idx === 2 ? "text-amber-700" : "text-gray-300"
                          }`}>
                            {idx + 1}
                          </span>
                          <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                            {badge?.type === "logo" ? (
                              <img src={badge.url} alt="" className="h-5 w-5 object-contain" />
                            ) : badge?.type === "flag" ? (
                              <span className="text-base">{badge.emoji}</span>
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                {entry.team.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-[#1A1A2E] truncate">{entry.team}</span>
                              <span className="text-sm font-[family-name:var(--font-display)] text-[#1A1A2E] ml-2">
                                {entry.gaeste} Gäste
                              </span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full">
                              <div
                                className="h-2 rounded-full bg-[#00D26A] transition-all"
                                style={{ width: `${barWidth}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {entry.spiele} Spiele · Ø {entry.durchschnitt} Gäste/Spiel
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">
                    Noch keine vergangenen Spieltage — Daten werden nach den ersten Spielen angezeigt.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Spiele Tab */}
        {activeTab === "spiele" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-wider text-[#1A1A2E]">
                NÄCHSTE SPIELE
              </h2>
              <Dialog open={spielDialogOpen} onOpenChange={(open) => {
                setSpielDialogOpen(open);
                if (open) {
                  loadVerfuegbareSpiele();
                  setSpielSuche("");
                  setSpielLigaFilter("");
                  setSelectedSpielId("");
                }
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-[#00D26A] hover:bg-[#00B85C] text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Spiel hinzufügen
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Spiel hinzufügen</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 mt-2 flex-1 overflow-hidden flex flex-col">
                    {/* Such- und Liga-Filter */}
                    <div className="space-y-2">
                      <Input
                        placeholder="Team suchen..."
                        value={spielSuche}
                        onChange={(e) => setSpielSuche(e.target.value)}
                      />
                      <div className="flex gap-1 flex-wrap">
                        <button
                          onClick={() => setSpielLigaFilter("")}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                            !spielLigaFilter ? "bg-[#00D26A] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          Alle ({spieleVerfuegbar.length})
                        </button>
                        {verfuegbareLigen.map((l) => (
                          <button
                            key={l}
                            onClick={() => setSpielLigaFilter(l === spielLigaFilter ? "" : l)}
                            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                              spielLigaFilter === l ? "bg-[#00D26A] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {l} ({spieleVerfuegbar.filter((s) => s.liga === l).length})
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Spiel-Liste (scrollbar) */}
                    <div className="flex-1 overflow-y-auto space-y-1 min-h-0 max-h-[300px] border rounded-lg p-1">
                      {gefilterteSpiele.length > 0 ? (
                        gefilterteSpiele.map((s) => {
                          const hb = getTeamBadge(s.heimTeam, s.liga);
                          const gb = getTeamBadge(s.gastTeam, s.liga);
                          const isSelected = selectedSpielId === s.id;
                          return (
                            <button
                              key={s.id}
                              onClick={() => setSelectedSpielId(isSelected ? "" : s.id)}
                              className={`w-full text-left p-2.5 rounded-lg transition-colors ${
                                isSelected ? "bg-[#00D26A]/10 border border-[#00D26A]" : "hover:bg-gray-50 border border-transparent"
                              }`}
                            >
                              <div className="flex items-center gap-2 text-sm">
                                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                                  {hb?.type === "logo" ? <img src={hb.url} alt="" className="h-4 w-4 object-contain" /> : hb?.type === "flag" ? <span className="text-xs">{hb.emoji}</span> : null}
                                </div>
                                <span className="font-medium text-[#1A1A2E] truncate">{s.heimTeam}</span>
                                <span className="text-xs text-gray-400">vs</span>
                                <span className="font-medium text-[#1A1A2E] truncate">{s.gastTeam}</span>
                                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                                  {gb?.type === "logo" ? <img src={gb.url} alt="" className="h-4 w-4 object-contain" /> : gb?.type === "flag" ? <span className="text-xs">{gb.emoji}</span> : null}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{s.liga}</span>
                                <span className="text-[10px] text-gray-500">{formatDate(s.anpfiff)}</span>
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <p className="text-center text-sm text-gray-400 py-8">
                          {spieleVerfuegbar.length === 0
                            ? "Lade Spiele..."
                            : "Keine Spiele für diesen Filter gefunden."}
                        </p>
                      )}
                    </div>

                    {/* Plätze und Hinzufügen */}
                    {selectedSpielId && (
                      <div className="space-y-2 pt-2 border-t">
                        <div className="space-y-1">
                          <Label className="text-xs">Verfügbare Plätze (optional)</Label>
                          <Input
                            type="number"
                            placeholder="z.B. 30"
                            value={spielPlaetze}
                            onChange={(e) => setSpielPlaetze(e.target.value)}
                            className="h-8"
                          />
                        </div>
                        <Button
                          onClick={handleAddSpiel}
                          disabled={spielLoading}
                          className="w-full bg-[#00D26A] hover:bg-[#00B85C] text-white"
                        >
                          {spielLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                          Spiel übernehmen
                        </Button>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {bar.spiele.length > 0 ? (
              <div className="space-y-3">
                {bar.spiele.map((bs) => (
                  <Card key={bs.id} className="bg-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 font-medium text-[#1A1A2E] text-sm">
                            {(() => {
                              const hb = getTeamBadge(bs.spiel.heimTeam, bs.spiel.liga);
                              return hb?.type === "flag" ? <span>{hb.emoji}</span> : hb?.type === "logo" ? <img src={hb.url} alt="" className="h-4 w-4 object-contain" /> : null;
                            })()}
                            {bs.spiel.heimTeam} vs {bs.spiel.gastTeam}
                            {(() => {
                              const gb = getTeamBadge(bs.spiel.gastTeam, bs.spiel.liga);
                              return gb?.type === "flag" ? <span>{gb.emoji}</span> : gb?.type === "logo" ? <img src={gb.url} alt="" className="h-4 w-4 object-contain" /> : null;
                            })()}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {bs.spiel.liga}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {formatDate(bs.spiel.anpfiff)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              className="w-20 h-8 text-sm"
                              placeholder="Plätze"
                              defaultValue={bs.plaetze || ""}
                              onBlur={(e) => handleUpdatePlaetze(bs.id, e.target.value)}
                            />
                            <span className="text-xs text-gray-400">Plätze</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRemoveSpiel(bs.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white">
                <CardContent className="p-6 text-center text-gray-500">
                  Keine kommenden Spiele eingetragen. Füge dein erstes Spiel hinzu!
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Reservierungen Tab */}
        {activeTab === "reservierungen" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-wider text-[#1A1A2E]">
                RESERVIERUNGEN
              </h2>
              <Dialog open={manuelDialogOpen} onOpenChange={setManuelDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#00D26A] hover:bg-[#00B85C] text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Telefon-Reservierung
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reservierung manuell eintragen</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    {manuelError && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {manuelError}
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Name des Gastes *</Label>
                      <Input
                        placeholder="z.B. Thomas Müller"
                        value={manuelForm.gastName}
                        onChange={(e) => setManuelForm({ ...manuelForm, gastName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefonnummer</Label>
                      <Input
                        type="tel"
                        placeholder="z.B. 0211 1234567"
                        value={manuelForm.gastTelefon}
                        onChange={(e) => setManuelForm({ ...manuelForm, gastTelefon: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Datum & Uhrzeit *</Label>
                        <Input
                          type="datetime-local"
                          value={manuelForm.datum}
                          onChange={(e) => setManuelForm({ ...manuelForm, datum: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Personen *</Label>
                        <Input
                          type="number"
                          min="1"
                          placeholder="z.B. 4"
                          value={manuelForm.personen}
                          onChange={(e) => setManuelForm({ ...manuelForm, personen: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Notiz (optional)</Label>
                      <Input
                        placeholder="z.B. Tisch am Fenster gewünscht"
                        value={manuelForm.notiz}
                        onChange={(e) => setManuelForm({ ...manuelForm, notiz: e.target.value })}
                      />
                    </div>
                    <p className="text-xs text-gray-400">
                      Wird automatisch als bestätigt eingetragen.
                    </p>
                    <Button
                      onClick={handleManuelleReservierung}
                      disabled={manuelLoading}
                      className="w-full bg-[#00D26A] hover:bg-[#00B85C] text-white"
                    >
                      {manuelLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                      Reservierung eintragen
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Kapazitätsanzeige heute */}
            <Card className="bg-white mb-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <Target className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1A1A2E]">Heute bestätigt</p>
                      <p className="text-xs text-gray-500">Kapazität: {bar.kapazitaet} Plätze</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-[family-name:var(--font-display)] text-2xl text-[#1A1A2E]">
                      {heuteGaeste} <span className="text-sm text-gray-400 font-sans">/ {bar.kapazitaet}</span>
                    </p>
                    <div className="w-32 h-2 bg-gray-100 rounded-full mt-1">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          heuteGaeste / bar.kapazitaet > 0.9
                            ? "bg-red-500"
                            : heuteGaeste / bar.kapazitaet > 0.7
                            ? "bg-yellow-500"
                            : "bg-[#00D26A]"
                        }`}
                        style={{ width: `${Math.min(100, (heuteGaeste / bar.kapazitaet) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {bar.reservierungen.length > 0 ? (
              <div className="space-y-3">
                {bar.reservierungen.map((res) => (
                  <Card key={res.id} className="bg-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-[#1A1A2E] text-sm">
                              {res.user ? (res.user.name || res.user.email) : res.gastName || "Unbekannt"}
                            </p>
                            <Badge className={`text-xs ${statusColors[res.status]}`}>
                              {statusLabels[res.status]}
                            </Badge>
                            {res.quelle === "TELEFON" && (
                              <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                                Telefon
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(res.datum)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {res.personen} Pers.
                            </span>
                            {res.gastTelefon && (
                              <span className="text-gray-400">
                                Tel: {res.gastTelefon}
                              </span>
                            )}
                          </div>
                          {res.notiz && (
                            <p className="mt-1 text-xs text-gray-500 italic">{res.notiz}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {res.status === "AUSSTEHEND" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => handleReservierungStatus(res.id, "BESTAETIGT")}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleReservierungStatus(res.id, "ABGELEHNT")}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {res.status === "BESTAETIGT" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-500 border-red-200 hover:bg-red-50 text-xs"
                              onClick={() => handleReservierungStatus(res.id, "NO_SHOW")}
                            >
                              <UserX className="h-3.5 w-3.5 mr-1" />
                              No-Show
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white">
                <CardContent className="p-6 text-center text-gray-500">
                  Noch keine Reservierungen.
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Promo-Deals Tab */}
        {activeTab === "promos" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-wider text-[#1A1A2E]">
                PROMO-DEALS
              </h2>
              <Dialog open={promoDialogOpen} onOpenChange={setPromoDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#F5A623] hover:bg-[#D4900E] text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Neuer Deal
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Neuen Promo-Deal erstellen</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    {promoError && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {promoError}
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Titel *</Label>
                      <Input
                        placeholder="z.B. BVB vs Bayern - VIP Paket"
                        value={promoForm.titel}
                        onChange={(e) => setPromoForm({ ...promoForm, titel: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Beschreibung</Label>
                      <Textarea
                        placeholder="Was ist im Deal enthalten?"
                        value={promoForm.beschreibung}
                        onChange={(e) => setPromoForm({ ...promoForm, beschreibung: e.target.value })}
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Preis (EUR) *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="19.90"
                          value={promoForm.preis}
                          onChange={(e) => setPromoForm({ ...promoForm, preis: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Original-Preis (optional)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="29.90"
                          value={promoForm.originalPreis}
                          onChange={(e) => setPromoForm({ ...promoForm, originalPreis: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Max. Plätze *</Label>
                      <Input
                        type="number"
                        placeholder="20"
                        value={promoForm.maxPlaetze}
                        onChange={(e) => setPromoForm({ ...promoForm, maxPlaetze: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Gültig ab *</Label>
                        <Input
                          type="datetime-local"
                          value={promoForm.gueltigVon}
                          onChange={(e) => setPromoForm({ ...promoForm, gueltigVon: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Gültig bis *</Label>
                        <Input
                          type="datetime-local"
                          value={promoForm.gueltigBis}
                          onChange={(e) => setPromoForm({ ...promoForm, gueltigBis: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                      <strong>Hinweis:</strong> SpieltagBar erhält 10% Vermittlungsprovision pro Buchung.
                      {promoForm.preis && (
                        <span className="block mt-1">
                          Bei {parseFloat(promoForm.preis).toFixed(2)} EUR/Person: Du erhältst{" "}
                          <strong>{(parseFloat(promoForm.preis) * 0.9).toFixed(2)} EUR</strong> pro Person.
                        </span>
                      )}
                    </div>
                    <Button
                      onClick={handleCreatePromo}
                      disabled={promoLoading}
                      className="w-full bg-[#F5A623] hover:bg-[#D4900E] text-white"
                    >
                      {promoLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Tag className="h-4 w-4 mr-2" />}
                      Deal erstellen
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {bar.promoDeals.length > 0 ? (
              <div className="space-y-4">
                {bar.promoDeals.map((deal) => (
                  <Card key={deal.id} className={`bg-white ${!deal.aktiv ? "opacity-60" : ""}`}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-[#1A1A2E]">{deal.titel}</h3>
                            <Badge className={deal.aktiv ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}>
                              {deal.aktiv ? "Aktiv" : "Inaktiv"}
                            </Badge>
                          </div>
                          {deal.beschreibung && (
                            <p className="text-sm text-gray-600 mb-2">{deal.beschreibung}</p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm">
                            <span className="flex items-center gap-1 font-semibold text-[#00D26A]">
                              <Euro className="h-3.5 w-3.5" />
                              {deal.preis.toFixed(2)}
                              {deal.originalPreis && (
                                <span className="text-gray-400 line-through font-normal ml-1">
                                  {deal.originalPreis.toFixed(2)}
                                </span>
                              )}
                            </span>
                            <span className="flex items-center gap-1 text-gray-500">
                              <Users className="h-3.5 w-3.5" />
                              {deal.gebuchtePlaetze}/{deal.maxPlaetze} gebucht
                            </span>
                            {deal.gebuchtePlaetze > 0 && (
                              <span className="text-xs text-gray-500">
                                Umsatz: {(deal.preis * deal.gebuchtePlaetze).toFixed(2)} EUR
                                (dein Anteil: {(deal.preis * deal.gebuchtePlaetze * 0.9).toFixed(2)} EUR)
                              </span>
                            )}
                            <span className="text-xs text-gray-400">
                              Bis {formatDate(deal.gueltigBis)}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTogglePromo(deal.id, !deal.aktiv)}
                          className={deal.aktiv ? "text-red-600 border-red-200" : "text-green-600 border-green-200"}
                        >
                          {deal.aktiv ? "Deaktivieren" : "Aktivieren"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white">
                <CardContent className="p-10 text-center">
                  <Tag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Noch keine Promo-Deals erstellt.</p>
                  <p className="text-sm text-gray-400">
                    Erstelle Deals mit Vorab-Bezahlung über Stripe für mehr Planungssicherheit.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
