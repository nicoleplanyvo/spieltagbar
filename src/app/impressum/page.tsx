import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum und rechtliche Informationen von SpieltagBar.",
  robots: { index: true, follow: true },
};

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-wider text-[#1A1A2E] mb-8">
          IMPRESSUM
        </h1>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-[#1A1A2E] mb-2">
              Angaben gemäß § 5 TMG
            </h2>
            <p className="text-gray-600">
              Philipp Meseck
              <br />
              Bonifatiusstraße 52
              <br />
              40547 Düsseldorf
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1A1A2E] mb-2">
              Kontakt
            </h2>
            <p className="text-gray-600">
              E-Mail:{" "}
              <a
                href="mailto:hello@spieltagbar.de"
                className="text-[#00D26A] hover:underline"
              >
                hello@spieltagbar.de
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1A1A2E] mb-2">
              Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
            </h2>
            <p className="text-gray-600">
              Philipp Meseck
              <br />
              Bonifatiusstraße 52
              <br />
              40547 Düsseldorf
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1A1A2E] mb-2">
              Haftungsausschluss
            </h2>

            <h3 className="text-lg font-medium text-[#1A1A2E] mt-4 mb-1">
              Haftung für Inhalte
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt.
              Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte
              können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter
              sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten
              nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG
              sind wir als Diensteanbieter jedoch nicht verpflichtet,
              übermittelte oder gespeicherte fremde Informationen zu überwachen
              oder nach Umständen zu forschen, die auf eine rechtswidrige
              Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung
              der Nutzung von Informationen nach den allgemeinen Gesetzen
              bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch
              erst ab dem Zeitpunkt der Kenntnis einer konkreten
              Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden
              Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
            </p>

            <h3 className="text-lg font-medium text-[#1A1A2E] mt-4 mb-1">
              Haftung für Links
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Unser Angebot enthält Links zu externen Webseiten Dritter, auf
              deren Inhalte wir keinen Einfluss haben. Deshalb können wir für
              diese fremden Inhalte auch keine Gewähr übernehmen. Für die
              Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter
              oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten
              wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße
              überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der
              Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle
              der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer
              Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von
              Rechtsverletzungen werden wir derartige Links umgehend entfernen.
            </p>

            <h3 className="text-lg font-medium text-[#1A1A2E] mt-4 mb-1">
              Urheberrecht
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
              diesen Seiten unterliegen dem deutschen Urheberrecht. Die
              Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
              Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der
              schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
              Downloads und Kopien dieser Seite sind nur für den privaten, nicht
              kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser
              Seite nicht vom Betreiber erstellt wurden, werden die
              Urheberrechte Dritter beachtet. Insbesondere werden Inhalte
              Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine
              Urheberrechtsverletzung aufmerksam werden, bitten wir um einen
              entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen
              werden wir derartige Inhalte umgehend entfernen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1A1A2E] mb-2">
              Streitschlichtung
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Die Europäische Kommission stellt eine Plattform zur
              Online-Streitbeilegung (OS) bereit. Wir sind nicht bereit oder
              verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
