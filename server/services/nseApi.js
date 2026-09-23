/**
 * Best-effort secondary IPO source: NSE's public (undocumented) JSON
 * endpoints. This is NOT an official/documented API — NSE serves it to
 * their own website's frontend. We fetch it the same way any browser
 * would (visit the homepage first to pick up a session cookie, then hit
 * the JSON endpoint with the same headers) with no captcha bypass or
 * evasion beyond that.
 *
 * This is inherently fragile: NSE can change the response shape, rate
 * limit, or block non-browser traffic at any time. Every failure mode
 * here degrades to an empty array rather than throwing, and the whole
 * source can be disabled with ENABLE_NSE_SOURCE=false.
 *
 * Two endpoints are combined:
 *  - /api/all-upcoming-issues?category=ipo — main-board issues (open and
 *    forthcoming), with dates and price band, but no subscription data.
 *  - /api/ipo-current-issue — currently-open issues only (main-board AND
 *    SME), including live subscription multiples (noOfTime) but no
 *    forthcoming issues. Overlaps with the first for open main-board
 *    issues; mergeSources() reconciles that via normalized-name matching.
 */
import { buildBaseIPO } from './schema.js';

const HOME_URL = 'https://www.nseindia.com';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
};

async function getSessionCookie() {
  const res = await fetch(HOME_URL, { headers: HEADERS, signal: AbortSignal.timeout(8000) });
  const setCookie = res.headers.get('set-cookie') || '';
  return setCookie.split(',').map(c => c.split(';')[0]).join('; ');
}

async function fetchNseEndpoint(path, cookie) {
  const res = await fetch(`${HOME_URL}${path}`, {
    headers: { ...HEADERS, Cookie: cookie, Referer: HOME_URL },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`NSE ${path} returned ${res.status}`);
  return res.json();
}

export async function fetchNseIPOs() {
  if (process.env.ENABLE_NSE_SOURCE === 'false') return [];

  try {
    const cookie = await getSessionCookie();
    const [upcoming, current] = await Promise.allSettled([
      fetchNseEndpoint('/api/all-upcoming-issues?category=ipo', cookie),
      fetchNseEndpoint('/api/ipo-current-issue', cookie),
    ]);

    const results = [];
    if (upcoming.status === 'fulfilled') results.push(...normalizeUpcoming(upcoming.value));
    if (current.status === 'fulfilled') results.push(...normalizeCurrent(current.value));
    return results;
  } catch (err) {
    console.warn('[nseApi] source unavailable, skipping:', err.message);
    return [];
  }
}

// /api/all-upcoming-issues?category=ipo — one row per company.
// { companyName, issueStartDate, issueEndDate, issuePrice, issueSize
//   (= number of shares offered, as a string), series, status, symbol }
function normalizeUpcoming(payload) {
  const list = Array.isArray(payload) ? payload : (payload?.data || []);
  if (!Array.isArray(list)) return [];

  return list.map(item => {
    if (!item.companyName) return null;
    const priceBand = parsePriceRange(item.issuePrice);
    const shares = parseFloat(item.issueSize);

    return safeBuild({
      name: item.companyName,
      status: mapNseStatus(item.status),
      isSme: item.series === 'SME',
      priceBand,
      issueSizeNum: sharesToCroreValue(shares, priceBand.high),
      openDate: item.issueStartDate,
      closeDate: item.issueEndDate,
      listingExchange: 'NSE',
      source: 'nse',
    });
  }).filter(Boolean);
}

// /api/ipo-current-issue — currently-open issues, main-board AND SME.
// Main-board rows include a "category" field (usually "Total" for the
// aggregate row); SME rows have no category/price at all. noOfTime is
// the live subscription multiple.
function normalizeCurrent(payload) {
  const list = Array.isArray(payload) ? payload : (payload?.data || []);
  if (!Array.isArray(list)) return [];

  const byName = new Map();
  for (const item of list) {
    if (!item.companyName) continue;
    if (!byName.has(item.companyName)) byName.set(item.companyName, []);
    byName.get(item.companyName).push(item);
  }

  const results = [];
  for (const [name, rows] of byName) {
    const first = rows[0];
    const priceBand = parsePriceRange(first.issuePrice);
    const shares = parseFloat(first.issueSize ?? first.noOfSharesOffered);

    const subscription = { retail: blank(), nii: blank(), qib: blank(), employee: blank(), overall: 0 };
    for (const row of rows) {
      const times = parseFloat(row.noOfTime) || 0;
      const bucket = categoryBucket(row.category);
      if (bucket === 'overall') subscription.overall = times;
      else if (bucket) subscription[bucket].times = times;
    }
    // SME rows have no `category` field at all — the single row IS the total.
    if (rows.length === 1 && first.category === undefined) {
      subscription.overall = parseFloat(first.noOfTime) || 0;
    }

    results.push(safeBuild({
      name,
      status: mapNseStatus(first.status) || 'open',
      isSme: first.series === 'SME',
      priceBand,
      issueSizeNum: sharesToCroreValue(shares, priceBand.high),
      openDate: first.issueStartDate,
      closeDate: first.issueEndDate,
      listingExchange: first.series === 'SME' ? 'NSE Emerge (SME)' : 'NSE',
      source: 'nse',
      subscription,
    }));
  }
  return results;
}

function blank() { return { applied: 0, times: 0 }; }

function categoryBucket(category) {
  if (!category) return null;
  const c = category.toLowerCase();
  if (c === 'total') return 'overall';
  if (c.includes('retail')) return 'retail';
  if (c.includes('qualified institutional') || c.includes('qib')) return 'qib';
  if (c.includes('non institutional') || c.includes('nii')) return 'nii';
  if (c.includes('employee')) return 'employee';
  return null;
}

// NSE's `issueSize` is a share count, not a currency amount — convert to
// ₹ Crore using the top of the price band (the standard convention for
// quoting IPO issue size).
function sharesToCroreValue(shares, priceHigh) {
  if (!shares || !priceHigh || isNaN(shares) || isNaN(priceHigh)) return null;
  return Number(((shares * priceHigh) / 1e7).toFixed(1));
}

function parsePriceRange(str) {
  if (!str) return { low: 0, high: 0 };
  const nums = [...String(str).matchAll(/[\d,]+(?:\.\d+)?/g)].map(m => parseFloat(m[0].replace(/,/g, '')));
  if (nums.length === 0) return { low: 0, high: 0 };
  if (nums.length === 1) return { low: nums[0], high: nums[0] };
  return { low: Math.min(...nums), high: Math.max(...nums) };
}

function mapNseStatus(status) {
  if (!status) return null;
  const s = String(status).toLowerCase();
  if (s.includes('active')) return 'open';
  if (s.includes('forthcoming')) return 'upcoming';
  if (s.includes('listed')) return 'listed';
  if (s.includes('closed')) return 'closed';
  return null;
}

function safeBuild(fields) {
  try {
    return buildBaseIPO(fields);
  } catch (err) {
    console.warn(`[nseApi] failed to normalize "${fields.name}":`, err.message);
    return null;
  }
}
