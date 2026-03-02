import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware OHNE auth()-Wrapper — nutzt Cookie-Pruefung statt NextAuth.
 * Dadurch crasht die Middleware nicht wenn NEXTAUTH_SECRET fehlt oder
 * die Auth-Konfiguration fehlerhaft ist.
 *
 * Die eigentliche JWT-Validierung passiert in den Seiten/API-Routen selbst.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- API-Routen: nur Auth-Pruefung, KEIN CORS-Blocking ---
  // CORS ist bei Same-Origin nicht noetig. Der Browser schuetzt bereits
  // mit der Same-Origin Policy. NextAuth hat eigenen CSRF-Schutz.
  if (pathname.startsWith("/api/")) {
    // Geschuetzte API-Routen — einfache Cookie-Pruefung
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
    const isProtectedApi = protectedApiRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (isProtectedApi) {
      const sessionToken =
        req.cookies.get("__Secure-authjs.session-token") ||
        req.cookies.get("authjs.session-token");
      if (!sessionToken?.value) {
        return NextResponse.json(
          { error: "Nicht authentifiziert" },
          { status: 401 }
        );
      }
    }

    return NextResponse.next();
  }

  // --- Route Protection (Cookie-basiert, kein auth()-Aufruf) ---

  // Session-Cookie pruefen (lightweight — kein JWT-Decode noetig)
  const sessionToken =
    req.cookies.get("__Secure-authjs.session-token") ||
    req.cookies.get("authjs.session-token");
  const isLoggedIn = !!sessionToken?.value;

  // Geschuetzte Routen: Dashboard
  const protectedRoutes = ["/dashboard"];
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Auth-Seiten (Login/Register) — eingeloggte User redirecten
  const authRoutes = ["/login", "/register"];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Nicht eingeloggt → zu Login redirecten
  if (isProtected && !isLoggedIn) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Eingeloggt → von Auth-Seiten zur Homepage redirecten
  if (isAuthRoute && isLoggedIn) {
    const homeUrl = req.nextUrl.clone();
    homeUrl.pathname = "/";
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
    "/api/:path*",
  ],
};
