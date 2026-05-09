/**
 * All monetary values are stored as integers (kobo = smallest NGN unit, 1 NGN = 100 kobo).
 * NEVER store money as a float. NEVER do arithmetic on display values.
 * NEVER divide directly — always use these functions.
 */

export function koboToNaira(kobo: number): number {
  return Math.round(kobo) / 100;
}

export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100);
}

export function formatNaira(kobo: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(koboToNaira(kobo));
}

export function formatNairaCompact(kobo: number): string {
  const naira = koboToNaira(kobo);
  if (naira >= 1_000_000) return `₦${(naira / 1_000_000).toFixed(1)}M`;
  if (naira >= 1_000) return `₦${(naira / 1_000).toFixed(0)}K`;
  return formatNaira(kobo);
}
