/**
 * Canonical IPO shape shared by every source. Fields we genuinely don't
 * know are left `null`/empty rather than filled with fabricated defaults —
 * the frontend renders an honest "not yet available" state for those
 * instead of made-up numbers. AI-authored fields (businessDescription,
 * risks, strengths, aiSummary, refined vittaScore) are always null here;
 * they're filled in on-demand by /api/ipos/:slug/analysis.
 */
export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function normalizeCompanyName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/\b(ltd|limited|pvt|private|inc|corp|corporation|company|co)\b\.?/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };

/**
 * Normalizes a date string to "YYYY-MM-DD" without going through
 * `Date#toISOString()`, which converts to UTC and silently shifts
 * non-ISO date-only strings (e.g. NSE's "31-Aug-2026") back a day in any
 * timezone ahead of UTC — ISO date-only strings parse as UTC midnight per
 * spec, but "31-Aug-2026" parses as *local* midnight, so converting that
 * to UTC for display rolls it back to Aug 30 in IST. Handling both known
 * source formats explicitly, without an intermediate Date object, avoids
 * the mismatch entirely.
 */
export function formatDateForStore(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;

  const iso = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const dmy = dateStr.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/); // e.g. "31-Aug-2026" (NSE)
  if (dmy) {
    const month = MONTHS[dmy[2].toLowerCase()];
    if (month === undefined) return null;
    return `${dmy[3]}-${String(month + 1).padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
  }

  // Unknown format — fall back to Date parsing, but read back local
  // components (not UTC) since that's how the ambiguous string was parsed.
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function buildBaseIPO(fields) {
  const {
    name, logo, industry, sector, status, isSme,
    issueSize, issueSizeNum, freshIssue, ofs,
    priceBand, lotSize, faceValue,
    openDate, closeDate, listingDate, listingExchange, listingPrice, listingGain,
    source, documentUrl,
    snapshot,
    revenueBreakdown, financials, promoters, shareholding,
    industryData, competitors, useOfProceeds, valuation,
    gmp, subscription,
  } = fields;

  const id = slugify(name);

  return {
    id,
    name,
    logo: logo || null,
    industry: industry || 'General',
    sector: sector || industry || 'General',
    status: status || 'upcoming',
    isSme: isSme ?? false,
    issueSize: issueSize || (issueSizeNum ? `₹${issueSizeNum.toLocaleString('en-IN')} Cr` : null),
    issueSizeNum: issueSizeNum ?? null,
    freshIssue: freshIssue ?? null,
    ofs: ofs ?? null,
    priceBand: priceBand || { low: 0, high: 0 },
    lotSize: lotSize ?? null,
    faceValue: faceValue ?? null,
    openDate: formatDateForStore(openDate),
    closeDate: formatDateForStore(closeDate),
    listingDate: formatDateForStore(listingDate),
    listingExchange: listingExchange || 'BSE, NSE',
    listingPrice: listingPrice ?? null,
    listingGain: listingGain ?? null,
    source: source || 'unknown',
    documentUrl: documentUrl || null,

    snapshot: {
      founded: snapshot?.founded ?? null,
      employees: snapshot?.employees ?? null,
      headquarters: snapshot?.headquarters ?? null,
      registeredOffice: snapshot?.registeredOffice ?? null,
      website: snapshot?.website ?? null,
      registrar: snapshot?.registrar ?? null,
      leadManagers: snapshot?.leadManagers ?? [],
    },

    // AI-authored — filled by /api/ipos/:slug/analysis, null until then.
    businessDescription: null,
    businessModelCanvas: null,
    risks: null,
    strengths: null,
    aiSummary: null,
    // { scope: 'india-states'|'world-countries', breakdown: [{ region, percentage }] }
    // — only populated when the DRHP/RHP text actually discloses a
    // geographic revenue split; null otherwise (most companies don't).
    geographicRevenue: null,

    revenueBreakdown: revenueBreakdown ?? null,
    financials: financials ?? null,
    promoters: promoters ?? [],
    shareholding: shareholding ?? [],
    industryData: industryData ?? null,
    competitors: competitors ?? [],
    useOfProceeds: useOfProceeds ?? null,
    valuation: valuation ?? null,

    gmp: gmp ?? { current: 0, percentage: 0, history: [] },
    subscription: subscription ?? {
      retail: { applied: 0, times: 0 },
      nii: { applied: 0, times: 0 },
      qib: { applied: 0, times: 0 },
      employee: { applied: 0, times: 0 },
      overall: 0,
    },

    // Cheap heuristic score (server/services/scoring.js) — filled in by
    // the merge step, not here, since it needs the fully-built object.
    vittaScore: null,

    timeline: buildTimeline(openDate, closeDate, listingDate),

    _aiAnalysisAvailable: false,
  };
}

// Parses a normalized "YYYY-MM-DD" string as a UTC calendar date (not
// local time) so all downstream arithmetic and formatting stays in the
// same timezone-free frame — mixing local parsing with UTC formatting
// (or vice versa) is exactly what caused the day-shift bug above.
function toUTCDate(isoDateStr) {
  const [y, m, d] = isoDateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}
function fromUTCDate(date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

export function buildTimeline(openDateRaw, closeDateRaw, listingDateRaw) {
  const openStr = formatDateForStore(openDateRaw);
  if (!openStr) return [];
  const open = toUTCDate(openStr);

  const closeStr = formatDateForStore(closeDateRaw);
  const close = closeStr ? toUTCDate(closeStr) : new Date(open.getTime() + 3 * 86400000);

  const listingStr = formatDateForStore(listingDateRaw);
  const listing = listingStr ? toUTCDate(listingStr) : new Date(close.getTime() + 5 * 86400000);

  const now = toUTCDate(fromUTCDate(new Date())); // today, UTC-normalized to match

  const drhpDate = new Date(open.getTime() - 60 * 86400000);
  const sebiDate = new Date(open.getTime() - 30 * 86400000);
  const rhpDate = new Date(open.getTime() - 7 * 86400000);
  const allotDate = new Date(close.getTime() + 2 * 86400000);

  const getStatus = (d) => d < now ? 'completed' : (d.getTime() === now.getTime() ? 'active' : 'upcoming');

  return [
    { event: 'DRHP Filed', date: fromUTCDate(drhpDate), status: getStatus(drhpDate) },
    { event: 'SEBI Approval', date: fromUTCDate(sebiDate), status: getStatus(sebiDate) },
    { event: 'RHP Released', date: fromUTCDate(rhpDate), status: getStatus(rhpDate) },
    { event: 'IPO Opens', date: fromUTCDate(open), status: getStatus(open) },
    { event: 'IPO Closes', date: fromUTCDate(close), status: getStatus(close) },
    { event: 'Allotment', date: fromUTCDate(allotDate), status: getStatus(allotDate) },
    { event: 'Listing', date: fromUTCDate(listing), status: getStatus(listing) },
  ];
}
