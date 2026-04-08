// ─── Utilitaires IBAN ────────────────────────────────────────────────────────

export const formatIban = (value: string): string => {
  const cleaned = value.replace(/\s/g, "").toUpperCase();
  return cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
};

export const validateIban = (iban: string): boolean => {
  const cleaned = iban.replace(/\s/g, "").toUpperCase();
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{4,}$/.test(cleaned)) return false;
  if (cleaned.startsWith("FR") && cleaned.length !== 27) return false;
  // Modulo 97
  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);
  const numeric = rearranged
    .split("")
    .map((c) => (isNaN(Number(c)) ? (c.charCodeAt(0) - 55).toString() : c))
    .join("");
  let remainder = 0;
  for (let i = 0; i < numeric.length; i += 7) {
    remainder = parseInt(remainder.toString() + numeric.slice(i, i + 7)) % 97;
  }
  return remainder === 1;
};

export const maskIban = (iban: string): string => {
  const cleaned = iban.replace(/\s/g, "");
  if (cleaned.length < 8) return iban;
  const first = cleaned.slice(0, 4);
  const last = cleaned.slice(-4);
  const masked = "*".repeat(cleaned.length - 8);
  return formatIban(first + masked + last);
};
