/**
 * Einfaches In-Memory Rate Limiting (ohne externe Dependencies)
 * Fuer Produktion: Kann spaeter durch Redis-basiertes Rate Limiting ersetzt werden
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Aufraeum-Intervall: Alle 5 Minuten abgelaufene Eintraege loeschen
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetAt < now) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

interface RateLimitOptions {
  /** Maximale Anfragen im Zeitfenster */
  maxRequests: number;
  /** Zeitfenster in Sekunden */
  windowSec: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Prueft ob eine Anfrage das Rate Limit ueberschreitet
 * @param identifier - Eindeutiger Identifier (z.B. IP + Route)
 * @param options - Rate Limit Konfiguration
 */
export function rateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // Neuer Eintrag oder Zeitfenster abgelaufen
  if (!entry || entry.resetAt < now) {
    const resetAt = now + options.windowSec * 1000;
    rateLimitStore.set(identifier, { count: 1, resetAt });
    return {
      success: true,
      remaining: options.maxRequests - 1,
      resetAt,
    };
  }

  // Innerhalb des Zeitfensters
  entry.count += 1;

  if (entry.count > options.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  return {
    success: true,
    remaining: options.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * IP-Adresse aus dem Request extrahieren
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return "unknown";
}

/** Vordefinierte Rate Limits */
export const RATE_LIMITS = {
  /** Login: 5 Versuche pro Minute */
  auth: { maxRequests: 5, windowSec: 60 },
  /** Registrierung: 3 pro 10 Minuten */
  register: { maxRequests: 3, windowSec: 600 },
  /** Passwort vergessen: 3 pro 15 Minuten */
  forgotPassword: { maxRequests: 3, windowSec: 900 },
  /** Passwort reset: 5 pro 15 Minuten */
  resetPassword: { maxRequests: 5, windowSec: 900 },
  /** API allgemein: 60 pro Minute */
  api: { maxRequests: 60, windowSec: 60 },
} as const;
