"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, CheckCircle, AlertCircle, Loader2, LogIn } from "lucide-react";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!token) {
    return (
      <div className="text-center py-4">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-[#1A1A2E] mb-2">Ungültiger Link</h2>
        <p className="text-gray-500 text-sm mb-6">
          Der Reset-Link ist ungültig oder abgelaufen.
        </p>
        <Link href="/passwort-vergessen">
          <Button className="bg-[#00D26A] hover:bg-[#00B85C] text-white">
            Neuen Link anfordern
          </Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== passwordConfirm) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    if (password.length < 8) {
      setError("Passwort muss mindestens 8 Zeichen haben.");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError("Passwort muss mindestens einen Grossbuchstaben enthalten.");
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError("Passwort muss mindestens eine Zahl enthalten.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();

    if (res.ok) {
      setSuccess(true);
    } else {
      setError(data.error || "Fehler beim Zurücksetzen.");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 rounded-full bg-[#00D26A]/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-[#00D26A]" />
        </div>
        <h2 className="text-xl font-semibold text-[#1A1A2E] mb-2">
          Passwort geändert!
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Du kannst dich jetzt mit deinem neuen Passwort anmelden.
        </p>
        <Link href="/login">
          <Button className="bg-[#00D26A] hover:bg-[#00B85C] text-white w-full">
            <LogIn className="h-4 w-4 mr-2" />
            Zum Login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-xl font-semibold text-[#1A1A2E] text-center mb-2">
        Neues Passwort setzen
      </h2>
      <p className="text-center text-sm text-gray-500 mb-6">
        Wähle ein neues sicheres Passwort.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="password">Neues Passwort</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              type="password"
              placeholder="Min. 8 Zeichen, 1 Grossbuchstabe, 1 Zahl"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              required
              minLength={8}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="passwordConfirm">Passwort bestätigen</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="passwordConfirm"
              type="password"
              placeholder="Passwort wiederholen"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#00D26A] hover:bg-[#00B85C] text-white py-6 text-lg"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Passwort ändern"
          )}
        </Button>
      </form>
    </>
  );
}

export default function PasswortResetPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <span className="font-[family-name:var(--font-display)] text-4xl text-[#1A1A2E] tracking-wider">
              SPIELTAG<span className="text-[#F5A623]">BAR</span>
            </span>
          </Link>
        </div>

        <Card className="bg-white shadow-lg">
          <CardContent className="p-8">
            <Suspense fallback={<div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin mx-auto text-[#00D26A]" /></div>}>
              <ResetForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
