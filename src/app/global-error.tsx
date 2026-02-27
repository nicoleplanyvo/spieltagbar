"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error:", error);
  }, [error]);

  return (
    <html lang="de">
      <body style={{ margin: 0, fontFamily: "Arial, sans-serif", backgroundColor: "#F8FAFC" }}>
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
        }}>
          <div style={{ textAlign: "center", maxWidth: "400px" }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>&#9888;&#65039;</div>
            <h1 style={{
              fontSize: "32px",
              color: "#1A1A2E",
              letterSpacing: "3px",
              marginBottom: "8px",
            }}>
              KRITISCHER FEHLER
            </h1>
            <p style={{ color: "#6B7280", marginBottom: "24px" }}>
              Ein schwerwiegender Fehler ist aufgetreten. Bitte lade die Seite neu.
            </p>
            <button
              onClick={reset}
              style={{
                padding: "12px 28px",
                backgroundColor: "#00D26A",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
                marginRight: "8px",
              }}
            >
              Erneut versuchen
            </button>
            <a
              href="/"
              style={{
                display: "inline-block",
                padding: "12px 28px",
                backgroundColor: "white",
                color: "#1A1A2E",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "14px",
                textDecoration: "none",
              }}
            >
              Startseite
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
