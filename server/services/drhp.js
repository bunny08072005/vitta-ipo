/**
 * Best-effort DRHP discovery: search SEBI's public "Draft Offer Documents"
 * filings listing (https://www.sebi.gov.in/sebiweb/home/HomeAction.do
 * ?doListing=yes&sid=3&ssid=15&smid=10) by company name, then follow
 * through to the actual PDF.
 *
 * Two shapes have been observed for a matching row:
 *  1. The row's title itself embeds a direct link to the (smaller) Draft
 *     Abridged Prospectus PDF — used when present, since it's faster to
 *     download/parse and covers the same mandated business/risk sections.
 *  2. Otherwise, the row only links to an HTML "landing page" for the
 *     filing, which embeds the full DRHP PDF inside a viewer iframe
 *     (`?file=<pdf-url>`) — followed as a fallback.
 *
 * When the caller already has a `documentUrl` (IndianAPI supplies one for
 * most IPOs — sometimes a direct PDF, sometimes a SEBI landing page, and
 * occasionally the company's own site), that's tried first since it's a
 * far more reliable match than a name-based search; the SEBI search below
 * is the fallback for when it's absent or fails to resolve.
 *
 * This is a heuristic HTML scrape of a public government filings page, not
 * a documented API — SEBI can change the markup at any time. Every step
 * degrades to `{ found: false }` on failure so callers always have a safe
 * fallback (structured-data-only analysis) rather than a hard error.
 */
// Import the inner lib directly, not the package root — pdf-parse's
// index.js has a debug-mode block that runs a self-test against a bundled
// sample PDF whenever `module.parent` is unset (which ESM's CJS interop
// often leaves unset), crashing on ENOENT for that sample file.
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { diskGet, diskSet } from './cache.js';

const SEARCH_URL = 'https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=3&ssid=15&smid=10&search=';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  'Accept': 'text/html',
};
const MAX_CHARS = 15000;
const MAX_PDF_BYTES = 30 * 1024 * 1024; // skip pathologically large filings
export { MAX_PDF_BYTES };

export async function findDRHP(companyName, documentUrl) {
  const cached = diskGet('drhp', companyName);
  if (cached) return cached;

  const result = await discoverAndExtract(companyName, documentUrl);
  diskSet('drhp', companyName, result);
  return result;
}

async function discoverAndExtract(companyName, documentUrl) {
  try {
    const pdfUrl = (documentUrl && await resolveDocumentUrl(documentUrl))
      || await findViaSebiSearch(companyName);
    if (!pdfUrl) return { found: false };

    const text = await downloadAndExtractText(pdfUrl);
    if (!text) return { found: false };

    return { found: true, pdfUrl, text: text.slice(0, MAX_CHARS) };
  } catch (err) {
    console.warn(`[drhp] discovery failed for "${companyName}":`, err.message);
    return { found: false };
  }
}

// A supplied documentUrl might already be a direct PDF, or an HTML page
// (SEBI landing page, or the company's own site) that embeds one.
async function resolveDocumentUrl(documentUrl) {
  if (/\.pdf($|\?)/i.test(documentUrl)) return documentUrl;
  return resolveLandingPagePdf(documentUrl);
}

async function findViaSebiSearch(companyName) {
  const query = searchTerm(companyName);
  if (!query) return null;

  const res = await fetch(SEARCH_URL + encodeURIComponent(query), {
    headers: HEADERS,
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) return null;

  const html = await res.text();
  const row = pickBestRow(html);
  if (!row) return null;

  return row.inlinePdfUrl || await resolveLandingPagePdf(row.landingUrl);
}

function searchTerm(companyName) {
  // SEBI's search matches substrings of the filing title — a single
  // distinctive word works better than the full legal name (which often
  // includes "Limited"/"Private" that don't appear consistently in titles).
  const cleaned = String(companyName || '')
    .replace(/\b(ltd|limited|pvt|private|inc)\b\.?/gi, '')
    .trim();
  return cleaned.split(/\s+/)[0] || null;
}

/**
 * Rows look like:
 * <tr role='row' class='odd'>
 *   <td>Aug 27, 2026</td>
 *   <td><a href="https://.../company-name_123.html" title="...">
 *     COMPANY - DRHP<br>
 *     <a href='https://.../COMPANY - AP_p.pdf' ...>COMPANY - Draft Abridged Prospectus</a>
 *   </a></td>
 * </tr>
 * Results are ordered most-recent-first; we take the first non-addendum
 * match, since a company can have multiple historical filings.
 */
function pickBestRow(html) {
  const rows = html.split(/<tr role='row'/).slice(1);

  for (const row of rows) {
    if (/addendum/i.test(row)) continue;

    const landingMatch = row.match(/<a href="([^"]+\.html)"/i);
    if (!landingMatch) continue;

    const inlinePdfMatch = row.match(/href=\s*['"]([^'"]+\.pdf)['"]/i);
    return { landingUrl: landingMatch[1], inlinePdfUrl: inlinePdfMatch ? inlinePdfMatch[1] : null };
  }
  return null;
}

async function resolveLandingPagePdf(landingUrl) {
  if (!landingUrl) return null;
  try {
    const res = await fetch(landingUrl, { headers: HEADERS, signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const html = await res.text();
    // <iframe src='../../../web/?file=https://www.sebi.gov.in/sebi_data/attachdocs/.../XYZ.pdf' ...>
    const match = html.match(/[?&]file=([^'"&]+\.pdf)/i);
    return match ? decodeURIComponent(match[1]) : null;
  } catch (err) {
    console.warn('[drhp] failed to resolve landing page PDF:', err.message);
    return null;
  }
}

async function downloadAndExtractText(pdfUrl) {
  const res = await fetch(pdfUrl, { headers: HEADERS, signal: AbortSignal.timeout(25000) });
  if (!res.ok) return null;

  const contentLength = parseInt(res.headers.get('content-length') || '0', 10);
  if (contentLength > MAX_PDF_BYTES) {
    console.warn(`[drhp] skipping oversized PDF (${contentLength} bytes): ${pdfUrl}`);
    return null;
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  return extractTextFromBuffer(buffer);
}

export async function extractTextFromBuffer(buffer) {
  const result = await pdfParse(buffer);
  return result.text?.trim() || null;
}

/**
 * A user-uploaded RHP takes priority over anything auto-discovered — it's
 * an authoritative copy the user chose to supply, not a best-effort guess.
 * Overwrites the disk cache under the same key findDRHP() reads, so the
 * next analysis/chat request for this company picks it up automatically
 * (and regenerates, since the cached analysis is keyed by a hash that
 * includes this text — see server/services/analysisService.js).
 */
export async function saveUploadedRHP(companyName, buffer) {
  const text = await extractTextFromBuffer(buffer);
  if (!text) throw new Error('Could not extract any text from this PDF — it may be a scanned image without a text layer.');

  const result = { found: true, pdfUrl: null, source: 'user-upload', text: text.slice(0, MAX_CHARS) };
  diskSet('drhp', companyName, result);
  return result;
}
