export type UserRole = "FAN" | "BAR_OWNER" | "ADMIN";
export type PremiumTier = "BASIC" | "PREMIUM" | "TOP";
export type SpielStatus = "GEPLANT" | "LIVE" | "BEENDET" | "ABGESAGT";
export type ReservierungStatus = "AUSSTEHEND" | "BESTAETIGT" | "ABGELEHNT" | "STORNIERT";

export interface Oeffnungszeiten {
  mo: string;
  di: string;
  mi: string;
  do: string;
  fr: string;
  sa: string;
  so: string;
}
