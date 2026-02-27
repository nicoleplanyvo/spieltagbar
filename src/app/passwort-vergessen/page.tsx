"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function PasswortVergessenPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      setSent(true);
    } else {
      const data = await res.json();
      setError(data.error || "Fehler beim Senden.");
    }
    setLoading(false);
  };

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
            {sent ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-[#00D26A]/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-[#00D26A]" />
                </div>
                <h2 className="text-xl font-semibold text-[#1A1A2E] mb-2">E-Mail gesendet!</h2>
                <p className="text-gray-500 text-sm mb-6">
                  Falls ein Konto mit <strong>{email}</strong> existiert, haben wir dir einen Link zum Zurücksetzen gesendet.
                </p>
                <p className="text-xs text-gray-400 mb-6">
                  Prüfe auch deinen Spam-Ordner. Der Link ist 1 Stunde gültig.
                </p>
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Zurück zum Login
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-[#1A1A2E] text-center mb-2">
                  Passwort vergessen?
                </h2>
                <p className="text-center text-sm text-gray-500 mb-6">
                  Gib deine E-Mail-Adresse ein und wir senden dir einen Link zum Zurücksetzen.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">E-Mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="deine@email.de"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                      "Link senden"
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1">
                    <ArrowLeft className="h-3 w-3" />
                    Zurück zum Login
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
