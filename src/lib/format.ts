/**
 * Para, tarih ve sayı formatlama yardımcı fonksiyonları (Türkçe yerel ayarlar).
 */

/**
 * Bir sayıyı Türk Lirası para birimi olarak biçimlendirir. Örn: 1234.56 -> "₺1.234,56"
 */
export function formatCurrencyTRY(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(amount);
}

/**
 * ISO tarih dizesini (veya Date uyumlu bir dizeyi) "GG.AA.YYYY" biçimine çevirir.
 */
export function formatDateTR(dateIso: string): string {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) {
    return dateIso;
  }
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/**
 * "1.234,56" gibi Türkçe biçimli bir sayı dizesini JS number değerine çevirir.
 */
export function parseTurkishNumber(input: string): number {
  if (!input) return 0;
  const normalized = input
    .trim()
    .replace(/\./g, "")
    .replace(",", ".");
  const value = Number(normalized);
  return Number.isNaN(value) ? 0 : value;
}
