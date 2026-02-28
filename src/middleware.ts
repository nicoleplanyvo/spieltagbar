import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const origin = req.nextUrl.origin;

  // --- CORS-Schutz fuer API-Routen ---
  if (pathname.startsWith("/api/")) {
    const requestOrigin = req.headers.get("origin");
    const response = NextResponse.next();

    // Nur Same-Origin-Requests erlauben (plus Stripe Webhooks)
    if (requestOrigin && requestOrigin !== origin) {
      // Stripe Webhook darf von extern kommen
      if (pathname === "/api/webhook/stripe") {
        // Stripe-Anfragen passieren lassen — Signatur wird im Handler geprueft
      } else {
        return NextResponse.json(
          { error: "Nicht erlaubt (CORS)" },
          { status: 403 }
        );
      }
    }

    // CORS-Header fuer erlaubte Anfragen
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.headers.set("Access-Control-Max-Age", "86400");

    // OPTIONS Pre-flight Requests sofort beantworten
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: response.headers,
      });
    }
  }

  // --- Route Protection ---

  // Geschuetzte Routen: Dashboard
  const protectedRoutes = ["/dashboard"];
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  // Auth-Seiten (Login/Register) — eingeloggte User redirecten
  const authRoutes = ["/login", "/register"];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Geschuetzte API-Routen
  const protectedApiRoutes = [
    "/api/bars/profil",
    "/api/bars/fotos",
    "/api/bars/spiele",
    "/api/bars/promos",
    "/api/bars/reservierungen",
    "/api/bars/create",
    "/api/reservierungen",
    "/api/bewertungen",
    "/api/checkout",
  ];
  const isProtectedApi = protectedApiRoutes.some((route) => pathname.startsWith(route));

  // Nicht eingeloggt → zu Login redirecten
  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Eingeloggt → von Auth-Seiten zur Homepage redirecten
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", origin));
  }

  // Geschuetzte API ohne Auth → 401
  if (isProtectedApi && !isLoggedIn) {
    return NextResponse.json(
      { error: "Nicht authentifiziert" },
      { status: 401 }
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
    "/api/:path*",
  ],
};
