/**
 * Reject foreign street formats mis-geocoded into US (CA) listings.
 * Keeps valid US streets like "11769 Canton Pl".
 */

const FOREIGN_ADDRESS_PATTERNS = [
  /\bcarretera\b/i,
  /\bcarr\.?\s*#/i,
  /\bdepto\.?\b/i,
  /\bsector la\b/i,
  /\bjicalapa\b/i,
  /\bel salvador\b/i,
  /\bla libertad\b/i,
  /\bperla jicalapa\b/i,
  /\bcomas, sector\b/i,
  /\bpuerto de la\b/i,
  /\brs\s+\d{2,3}\s+km\b/i,
  /\bkm\s+\d{1,3}[ ./]\d/i,
  /\bcosta rica\b/i,
  /\bsan jos[eé],\s*costa\b/i,
  /\bbarrio la\b/i,
  /\bedif[ií]cio del\b/i,
  /\bav maur[ií]lio\b/i,
  /二丁目/,
  /中区/,
  /美沢/,
  /[\u3040-\u30ff\u4e00-\u9fff]/,
];

const VALID_US_STREET_CANTON = /\bcanton\s+(st|street|pl|place|dr|drive|way|ave|avenue|rd|road|blvd|boulevard)\b/i;

const INVALID_CA_ZIP_PATTERNS = [
  /,\s*[^,]+,\s*CA,\s*503(?:[^0-9-]|$)/i,
  /,\s*[^,]+,\s*CA,\s*\d{6,}$/i,
  /,\s*Los Angeles,\s*CA,\s*007\d{2}/i,
];

export function isPlausibleUsAddress(address: string | null | undefined): boolean {
  if (!address?.trim()) return true;

  const normalized = address.trim();

  if (VALID_US_STREET_CANTON.test(normalized)) {
    const withoutCantonStreet = normalized.replace(VALID_US_STREET_CANTON, '');
    if (FOREIGN_ADDRESS_PATTERNS.some((re) => re.test(withoutCantonStreet))) {
      return false;
    }
  } else if (FOREIGN_ADDRESS_PATTERNS.some((re) => re.test(normalized))) {
    return false;
  }

  if (INVALID_CA_ZIP_PATTERNS.some((re) => re.test(normalized))) {
    return false;
  }

  return true;
}

export function filterPlausibleUsRestrooms<T extends { address?: string | null }>(rows: T[]): T[] {
  return rows.filter((row) => isPlausibleUsAddress(row.address));
}
