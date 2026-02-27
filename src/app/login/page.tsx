"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Ungültige E-Mail oder Passwort.");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-up">
          <Link href="/">
            <span className="font-[family-name:var(--font-display)] text-4xl text-[#1A1A2E] tracking-wider">
              SPIELTAG<span className="text-gradient-gold">BAR</span>
            </span>
          </Link>
          <p className="mt-2 text-gray-600">Willkommen zurück!</p>
        </div>

        <Card className="glass-card shadow-lg animate-fade-up delay-100">
          <CardContent className="p-8">
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

              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Dein Passwort"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00D26A] hover:bg-[#00B85C] text-white py-6 text-lg hover:scale-[1.02] transition-transform"
              >
                {loading ? (
                  "Wird angemeldet..."
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Anmelden
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link
                href="/passwort-vergessen"
                className="text-sm text-gray-500 hover:text-[#00D26A] transition-colors"
              >
                Passwort vergessen?
              </Link>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Noch kein Konto?{" "}
                <Link
                  href="/register"
                  className="text-[#00D26A] hover:text-[#00B85C] font-medium"
                >
                  Jetzt registrieren
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-[#1A1A2E]/5 rounded-lg">
          <p className="text-xs text-gray-500 text-center mb-2">
            Demo-Zugangsdaten:
          </p>
          <div className="text-xs text-gray-600 space-y-1 text-center">
            <p>
              Fan: <code className="bg-white px-1 rounded">max@example.com</code> / <code className="bg-white px-1 rounded">test1234</code>
            </p>
            <p>
              Bar-Owner: <code className="bg-white px-1 rounded">tom@sportsbar.de</code> / <code className="bg-white px-1 rounded">test1234</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
