/**
 * Structured IPO data from IndianAPI.in. This runs server-side now — the
 * key never reaches the browser (it used to be injected client-side via
 * the old Vite dev proxy, which leaked it into the production bundle).
 *
 * The real response shape (verified against a live key, not guessed) is:
 *   { upcoming: [...], listed: [...], active: [...], closed: [...], pre_apply: [...] }
 * where each item has: symbol, name, status, is_sme, additional_text,
 * min_price, max_price, issue_price, listing_gains, listing_price,
 * bidding_start_date, bidding_end_date, listing_date, allotment_date,
 * lot_size, min_bid_quantity, total_subscription_rate, document_url.
 * (An earlier version of this file guessed at different field names
 * entirely — company_name, price_band, open_date, etc. — none of which
 * exist on the real payload, so almost every field was silently dropped.)
 */
import { buildBaseIPO } from './schema.js';

const BASE_URL = 'https://stock.indianapi.in';
const STATUS_GROUPS = ['upcoming', 'listed', 'active', 'closed', 'pre_apply'];

export async function fetchIndianApiIPOs() {
  const apiKey = process.env.IPO_API_KEY;
  if (!apiKey || apiKey === 'your_indianapi_key_here') {
    console.warn('[indianApi] IPO_API_KEY not set — skipping this source.');
    return [];
  }

  try {
    const res = await fetch(`${BASE_URL}/ipo`, {
      headers: { 'Accept': 'application/json', 'X-Api-Key': apiKey },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      console.warn(`[indianApi] request failed: ${res.status} ${res.statusText}`);
      return [];
    }
    const data = await res.json();

    const rawList = STATUS_GROUPS.some(k => Array.isArray(data[k]))
      ? STATUS_GROUPS.flatMap(k => data[k] || [])
      : extractIPOListFallback(data);

    return rawList.map(normalizeIndianApiIPO).filter(Boolean);
  } catch (err) {
    console.warn('[indianApi] fetch failed:', err.message);
    return [];
  }
}

function normalizeIndianApiIPO(raw) {
  if (!raw.name) return null;

  const priceBand = { low: raw.min_price || 0, high: raw.max_price || 0 };
  const status = mapStatus(raw.status);
  const listingGain = typeof raw.listing_gains === 'number' ? Number(raw.listing_gains.toFixed(2)) : null;

  return buildBaseIPO({
    name: raw.name,
    status,
    isSme: !!raw.is_sme,
    priceBand,
    lotSize: raw.lot_size || raw.min_bid_quantity || null,
    openDate: raw.bidding_start_date || null,
    closeDate: raw.bidding_end_date || null,
    listingDate: raw.listing_date || null,
    listingPrice: raw.listing_price ?? null,
    listingGain,
    listingExchange: 'BSE, NSE',
    source: 'indianapi',
    documentUrl: raw.document_url || null,
    valuation: raw.issue_price ? { ipoPE: null, industryPE: null, competitorAvgPE: null, premiumDiscount: null, mcap: null, evToSales: null } : null,
    subscription: typeof raw.total_subscription_rate === 'number' && raw.total_subscription_rate > 0 ? {
      retail: { applied: 0, times: 0 },
      nii: { applied: 0, times: 0 },
      qib: { applied: 0, times: 0 },
      employee: { applied: 0, times: 0 },
      overall: raw.total_subscription_rate,
    } : undefined,
  });
}

function mapStatus(rawStatus) {
  switch (rawStatus) {
    case 'pre_apply': return 'upcoming';
    case 'upcoming': return 'upcoming';
    case 'active': return 'open';
    case 'closed': return 'closed';
    case 'listed': return 'listed';
    default: return 'upcoming';
  }
}

/**
 * Fallback for if IndianAPI ever changes its top-level response shape —
 * searches one level deep for arrays of IPO-like objects instead of
 * hard-assuming the current upcoming/listed/active/closed/pre_apply keys.
 */
function extractIPOListFallback(apiData) {
  if (Array.isArray(apiData)) return apiData;
  if (typeof apiData !== 'object' || apiData === null) return [];

  const allArrays = [];
  for (const value of Object.values(apiData)) {
    if (Array.isArray(value) && value.length > 0) {
      const first = value[0];
      if (typeof first === 'object' && first !== null && (first.name || first.symbol)) {
        allArrays.push(...value);
      }
    }
  }
  return allArrays;
}
