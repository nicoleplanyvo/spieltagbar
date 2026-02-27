import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#1A1A2E] text-gray-400 pitch-pattern">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <span className="font-[family-name:var(--font-display)] text-2xl tracking-wider leading-none text-white">
              SPIELTAG<span className="text-gradient-gold">BAR</span>
            </span>
            <p className="mt-4 text-sm">
              Die Event-Discovery-Plattform für Fußball-Fans in Deutschland.
              Finde die perfekte Bar zum Spieleschauen.
            </p>
          </div>

          {/* Für Fans */}
          <div>
            <h3 className="font-semibold text-white mb-3">Für Fans</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/spiele" className="hover:text-white transition-colors">
                  Spielplan
                </Link>
              </li>
              <li>
                <Link href="/bars" className="hover:text-white transition-colors">
                  Bars finden
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Kostenlos registrieren
                </Link>
              </li>
            </ul>
          </div>

          {/* Für Bars */}
          <div>
            <h3 className="font-semibold text-white mb-3">Für Bars</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Bar eintragen
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Premium-Pakete
                </Link>
              </li>
            </ul>
          </div>

          {/* Rechtliches */}
          <div>
            <h3 className="font-semibold text-white mb-3">Rechtliches</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/impressum" className="hover:text-white transition-colors">
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className="hover:text-white transition-colors">
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  AGB
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} SpieltagBar. Alle Rechte vorbehalten.
          </p>
          <div className="flex gap-4 text-sm">
            <span>Made with passion in Düsseldorf</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
