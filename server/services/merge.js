import { normalizeCompanyName } from './schema.js';
import { scoreIPO } from './scoring.js';

/**
 * Combine IPO lists from multiple sources into one canonical, deduped
 * array. Matching is by normalized company name (strip Ltd/Limited/Pvt,
 * lowercase, trim) rather than the old substring-`includes` heuristic,
 * which produced false matches between unrelated companies that happened
 * to share a common first word.
 */
export function mergeSources(...sourceLists) {
  const bySlug = new Map();

  for (const list of sourceLists) {
    for (const ipo of list) {
      const key = normalizeCompanyName(ipo.name);
      if (!key) continue;

      const existing = bySlug.get(key);
      if (!existing) {
        bySlug.set(key, ipo);
        continue;
      }

      // Prefer whichever record has richer structured data; fill any
      // gaps in the winner from the other rather than discarding it.
      const winner = richness(ipo) >= richness(existing) ? ipo : existing;
      const loser = winner === ipo ? existing : ipo;
      const merged = fillGaps(winner, loser);
      // isSme is a fact, not a "preference" — if either source says a
      // company is SME, that's true regardless of which record won.
      merged.isSme = Boolean(winner.isSme || loser.isSme);
      bySlug.set(key, merged);
    }
  }

  return Array.from(bySlug.values()).map(ipo => ({
    ...ipo,
    vittaScore: ipo.vittaScore || scoreIPO(ipo),
  }));
}

function richness(ipo) {
  let score = 0;
  if (ipo.financials) score += 3;
  if (ipo.snapshot?.founded) score += 1;
  if (ipo.promoters?.length) score += 1;
  if (ipo.shareholding?.length) score += 1;
  if (ipo.gmp?.current) score += 1;
  if (ipo.subscription?.overall) score += 1;
  if (ipo.priceBand?.high) score += 1;
  if (ipo.documentUrl) score += 1;
  if (ipo.listingPrice != null) score += 1;
  return score;
}

function fillGaps(winner, loser) {
  const merged = { ...winner };
  for (const key of Object.keys(loser)) {
    const val = merged[key];
    const isEmpty = val === null || val === undefined ||
      (Array.isArray(val) && val.length === 0) ||
      (typeof val === 'object' && val !== null && !Array.isArray(val) && Object.values(val).every(v => v === null || v === undefined || v === 0));
    if (isEmpty && loser[key] !== null && loser[key] !== undefined) {
      merged[key] = loser[key];
    }
  }
  return merged;
}
