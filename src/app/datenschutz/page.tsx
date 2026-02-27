import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutz",
  description: "Datenschutzerklärung von SpieltagBar. Informationen zur Verarbeitung personenbezogener Daten.",
  robots: { index: true, follow: true },
};

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-wider text-[#1A1A2E] mb-8">
          DATENSCHUTZERKLÄRUNG
        </h1>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-[#1A1A2E] mb-2">
              1. Datenschutz auf einen Blick
            </h2>

            <h3 className="text-lg font-medium text-[#1A1A2E] mt-4 mb-1">
              Allgemeine Hinweise
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Die folgenden Hinweise geben einen einfachen Überblick darüber,
              was mit Ihren personenbezogenen Daten passiert, wenn Sie diese
              Website besuchen. Personenbezogene Daten sind alle Daten, mit
              denen Sie persönlich identifiziert werden können. Ausführliche
              Informationen zum Thema Datenschutz entnehmen Sie unserer unter
              diesem Text aufgeführten Datenschutzerklärung.
            </p>

            <h3 className="text-lg font-medium text-[#1A1A2E] mt-4 mb-1">
              Datenerfassung auf dieser Website
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              <strong>
                Wer ist verantwortlich für die Datenerfassung auf dieser
                Website?
              </strong>
              <br />
              Die Datenverarbeitung auf dieser Website erfolgt durch den
              Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum
              dieser Website entnehmen.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mt-2">
              <strong>Wie erfassen wir Ihre Daten?</strong>
              <br />
              Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese
              mitteilen. Hierbei kann es sich z.B. um Daten handeln, die Sie in
              ein Kontaktformular eingeben oder bei der Registrierung angeben.
              Andere Daten werden automatisch beim Besuch der Website durch
              unsere IT-Systeme erfasst. Das sind vor allem technische Daten
              (z.B. Internetbrowser, Betriebssystem oder Uhrzeit des
              Seitenaufrufs). Die Erfassung dieser Daten erfolgt automatisch,
              sobald Sie diese Website betreten.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mt-2">
              <strong>Wofür nutzen wir Ihre Daten?</strong>
              <br />
              Ein Teil der Daten wird erhoben, um eine fehlerfreie
              Bereitstellung der Website zu gewährleisten. Andere Daten können
              zur Analyse Ihres Nutzerverhaltens verwendet werden.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mt-2">
              <strong>
                Welche Rechte haben Sie bezüglich Ihrer Daten?
              </strong>
              <br />
              Sie haben jederzeit das Recht, unentgeltlich Auskunft über
              Herkunft, Empfänger und Zweck Ihrer gespeicherten
              personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht,
              die Berichtigung oder Löschung dieser Daten zu verlangen. Hierzu
              sowie zu weiteren Fragen zum Thema Datenschutz können Sie sich
              jederzeit an uns wenden.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1A1A2E] mb-2">
              2. Verantwortliche Stelle
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Die verantwortliche Stelle für die Datenverarbeitung auf dieser
              Website ist:
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mt-2">
              Philipp Meseck
              <br />
              Bonifatiusstraße 52
              <br />
              40547 Düsseldorf
              <br />
              <br />
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
              3. Datenerfassung auf dieser Website
            </h2>

            <h3 className="text-lg font-medium text-[#1A1A2E] mt-4 mb-1">
              Cookies
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Unsere Internetseiten verwenden sogenannte „Cookies". Cookies sind
              kleine Textdateien und richten auf Ihrem Endgerät keinen Schaden
              an. Sie werden entweder vorübergehend für die Dauer einer Sitzung
              (Session-Cookies) oder dauerhaft (permanente Cookies) auf Ihrem
              Endgerät gespeichert. Session-Cookies werden nach Ende Ihres
              Besuchs automatisch gelöscht. Permanente Cookies bleiben auf Ihrem
              Endgerät gespeichert, bis Sie diese selbst löschen oder eine
              automatische Löschung durch Ihren Webbrowser erfolgt. Wir
              verwenden Cookies für die Authentifizierung (Login-Session).
            </p>

            <h3 className="text-lg font-medium text-[#1A1A2E] mt-4 mb-1">
              Server-Log-Dateien
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Der Provider der Seiten erhebt und speichert automatisch
              Informationen in sogenannten Server-Log-Dateien, die Ihr Browser
              automatisch an uns übermittelt. Dies sind: Browsertyp und
              Browserversion, verwendetes Betriebssystem, Referrer URL, Hostname
              des zugreifenden Rechners, Uhrzeit der Serveranfrage und
              IP-Adresse. Eine Zusammenführung dieser Daten mit anderen
              Datenquellen wird nicht vorgenommen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1A1A2E] mb-2">
              4. Registrierung und Nutzerkonto
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Sie können sich auf unserer Website registrieren, um zusätzliche
              Funktionen wie Tischreservierungen und Bewertungen nutzen zu
              können. Die dazu eingegebenen Daten verwenden wir nur zum Zwecke
              der Nutzung des jeweiligen Angebotes oder Dienstes, für den Sie
              sich registriert haben. Die bei der Registrierung abgefragten
              Pflichtangaben müssen vollständig angegeben werden. Anderenfalls
              werden wir die Registrierung ablehnen.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mt-2">
              Wir speichern folgende Daten bei der Registrierung:
            </p>
            <ul className="text-gray-600 text-sm leading-relaxed mt-1 list-disc list-inside space-y-1">
              <li>Name</li>
              <li>E-Mail-Adresse</li>
              <li>Passwort (verschlüsselt gespeichert)</li>
              <li>Lieblingsteam (optional)</li>
              <li>Stadt (optional)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1A1A2E] mb-2">
              5. Reservierungen
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Wenn Sie eine Tischreservierung vornehmen, speichern wir die
              Reservierungsdaten (Datum, Personenzahl, ggf. Notiz) zusammen mit
              Ihrem Nutzerkonto. Diese Daten werden an den jeweiligen
              Bar-Betreiber weitergegeben, damit dieser Ihre Reservierung
              bearbeiten kann. Die Rechtsgrundlage hierfür ist Art. 6 Abs. 1
              lit. b DSGVO (Vertragserfüllung).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1A1A2E] mb-2">
              6. Zahlungsabwicklung
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Für die Zahlungsabwicklung von Promo-Deals nutzen wir den
              Zahlungsdienstleister Stripe (Stripe, Inc., 510 Townsend Street,
              San Francisco, CA 94103, USA). Ihre Zahlungsdaten werden direkt
              von Stripe verarbeitet und nicht auf unseren Servern gespeichert.
              Die Datenschutzerklärung von Stripe finden Sie unter:
              https://stripe.com/de/privacy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1A1A2E] mb-2">
              7. Ihre Rechte
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Sie haben folgende Rechte hinsichtlich Ihrer personenbezogenen
              Daten:
            </p>
            <ul className="text-gray-600 text-sm leading-relaxed mt-1 list-disc list-inside space-y-1">
              <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
              <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
              <li>Recht auf Löschung (Art. 17 DSGVO)</li>
              <li>
                Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)
              </li>
              <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruchsrecht (Art. 21 DSGVO)</li>
            </ul>
            <p className="text-gray-600 text-sm leading-relaxed mt-2">
              Zur Ausübung Ihrer Rechte wenden Sie sich bitte an:{" "}
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
              8. Aktualität und Änderung dieser Datenschutzerklärung
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Diese Datenschutzerklärung ist aktuell gültig und hat den Stand
              Februar 2026. Durch die Weiterentwicklung unserer Website oder
              aufgrund geänderter gesetzlicher bzw. behördlicher Vorgaben kann
              es notwendig werden, diese Datenschutzerklärung zu ändern.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
