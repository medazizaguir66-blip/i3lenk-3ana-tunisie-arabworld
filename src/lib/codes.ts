// Shared, browser-safe business rules for activation codes and free tries.
export const FREE_DAILY_LIMIT = 3;
export const PRO_DAYS = 30;
export const PRO_PRICE_DT = 15;
export const PAYMENT_NUMBER = "52535555";
export const INSTAGRAM_USERNAME = "aguir._.mohamed_aziz";

const DAY_MS = 24 * 60 * 60 * 1000;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
export const CODE_PATTERN = /^TN-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

export function generateActivationCode(random: (n: number) => Uint8Array = defaultRandom): string {
  const bytes = random(8);
  let chars = "";
  for (let i = 0; i < 8; i++) {
    // 252 = 36 * 7 → rejection-free mapping is close enough; use modulo on a byte.
    chars += ALPHABET[(bytes[i] ?? 0) % ALPHABET.length];
  }
  return `TN-${chars.slice(0, 4)}-${chars.slice(4, 8)}`;
}

function defaultRandom(n: number): Uint8Array {
  const arr = new Uint8Array(n);
  crypto.getRandomValues(arr);
  return arr;
}

/** Normalizes user input like "tn abcd 1234" into "TN-ABCD-1234". */
export function normalizeCode(input: string): string {
  const raw = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const body = raw.startsWith("TN") ? raw.slice(2) : raw;
  const b = body.slice(0, 8);
  if (b.length <= 4) return b.length ? `TN-${b}` : "";
  return `TN-${b.slice(0, 4)}-${b.slice(4)}`;
}

export function isValidCode(code: string): boolean {
  return CODE_PATTERN.test(code);
}

/**
 * New expiry when a fresh code is activated on a device: 30 days are added on top of
 * the device's current subscription when it is still running, otherwise from now.
 */
export function computeNewExpiry(currentExpiry: Date | null, now: Date): Date {
  const base = currentExpiry && currentExpiry.getTime() > now.getTime() ? currentExpiry : now;
  return new Date(base.getTime() + PRO_DAYS * DAY_MS);
}

export type CodeStatus = "unused" | "active" | "expired" | "unbound" | "revoked";

export function codeStatus(
  row: { revoked: boolean; device_id: string | null; activated_at: string | null; expires_at: string | null },
  now: Date,
): CodeStatus {
  if (row.revoked) return "revoked";
  if (!row.activated_at) return "unused";
  if (row.expires_at && new Date(row.expires_at).getTime() <= now.getTime()) return "expired";
  if (!row.device_id) return "unbound";
  return "active";
}

export function daysLeft(expiresAt: string | null, now: Date): number {
  if (!expiresAt) return 0;
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - now.getTime()) / DAY_MS));
}

export const DIALECTS = {
  tn: "الدارجة التونسية",
  msa: "العربية الفصحى",
  fr: "Français",
} as const;
export type Dialect = keyof typeof DIALECTS;
