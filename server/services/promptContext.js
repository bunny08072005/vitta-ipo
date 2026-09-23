/**
 * Provider-agnostic prompt building and response parsing, shared by
 * whichever LLM backend is active (server/services/gemini.js or
 * server/services/anthropic.js) — see server/services/llmProvider.js for
 * how the active one is picked.
 */

const ANALYSIS_SCHEMA_HINT = `Return ONLY valid JSON (no markdown fences, no commentary) matching exactly this shape:
{
  "businessDescription": "2-4 sentence plain-English explanation of what the company actually does, written for a retail investor with no finance background",
  "businessModelCanvas": {
    "customers": ["who buys from them"],
    "valueProposition": "one sentence",
    "revenueStreams": ["how they make money"],
    "keyResources": ["what they depend on to operate"],
    "keyPartners": ["key partners/suppliers/channels"]
  },
  "risks": [{ "title": "short title", "severity": "high|medium|low", "description": "1-2 sentences, specific to this company" }],
  "strengths": [{ "title": "short title", "description": "1-2 sentences, specific to this company" }],
  "aiSummary": {
    "oneLiner": "one sentence verdict combining opportunity and caution",
    "goodCompany": "1-2 sentences",
    "expensive": "1-2 sentences on valuation, only if PE/valuation data was provided, else say valuation data wasn't available",
    "growth": "1-2 sentences",
    "majorRisks": "1-2 sentences",
    "buffettVerdict": "1-2 sentences, in Warren Buffett's investing lens",
    "lynchVerdict": "1-2 sentences, in Peter Lynch's investing lens",
    "whoShouldApply": "1-2 sentences on suitable investor profile"
  },
  "vittaScore": {
    "businessQuality": 0-10 number,
    "corporateGovernance": 0-10 number,
    "industryOutlook": 0-10 number
  },
  "geographicRevenue": null OR {
    "scope": "india-states" | "world-countries",
    "breakdown": [{ "region": "...", "percentage": 0-100 number }]
  }
}
Provide 4-7 risks and 3-6 strengths. If the provided data is too thin to responsibly judge something, say so plainly in that field instead of guessing specifics, and give it a middle-of-range score (5) rather than an extreme one.

For "geographicRevenue": only fill this in if the source material explicitly states a revenue breakdown by Indian state or by country — most companies do NOT disclose this, so leaving it as \`null\` is the common, correct answer. Never estimate or infer a split from headquarters location, "pan-India presence" language, or similar vague statements — only use it when actual percentage/proportion figures tied to named states or countries are present in the text. If disclosed by Indian state, set "scope" to "india-states" and use only these exact names for "region" (case-sensitive, no abbreviations): Andhra Pradesh, Arunachal Pradesh, Assam, Bihar, Chhattisgarh, Goa, Gujarat, Haryana, Himachal Pradesh, Jharkhand, Karnataka, Kerala, Madhya Pradesh, Maharashtra, Manipur, Meghalaya, Mizoram, Nagaland, Odisha, Punjab, Rajasthan, Sikkim, Tamil Nadu, Telangana, Tripura, Uttar Pradesh, Uttarakhand, West Bengal, Andaman and Nicobar Islands, Chandigarh, Dadra and Nagar Haveli, Daman and Diu, Delhi, Jammu and Kashmir, Ladakh, Lakshadweep, Puducherry. If disclosed by country, set "scope" to "world-countries" and use lowercase ISO 3166-1 alpha-2 codes for "region" (e.g. "in" for India, "us" for United States, "gb" for United Kingdom).`;

export function buildAnalysisPrompt(context) {
  return `You are a financial analyst writing investor-facing IPO analysis for Vitta IPO, an Indian IPO research app. Analyze the following company using ONLY the information given below — do not use outside knowledge about this company, and do not invent financial figures that aren't present.

${context.structuredSummary}

${context.drhpExcerpt ? `Excerpt from the company's SEBI Draft Abridged Prospectus (DRHP):\n"""\n${context.drhpExcerpt}\n"""` : 'No DRHP filing was found for this company — base the analysis solely on the structured data above, and note where a full DRHP review would add more confidence.'}

${ANALYSIS_SCHEMA_HINT}`;
}

export function buildChatPrompt(context, question) {
  return `You are answering an investor's question about an Indian IPO for Vitta IPO's "Chat with DRHP" feature. Answer using ONLY the information below. If the answer isn't covered by this data, say clearly that it isn't disclosed in the available filings rather than guessing. Keep the answer to 2-4 sentences, concrete and specific, not generic boilerplate.

${context.structuredSummary}

${context.drhpExcerpt ? `Excerpt from the company's SEBI Draft Abridged Prospectus (DRHP):\n"""\n${context.drhpExcerpt}\n"""` : 'No DRHP filing was found for this company — answer from the structured data above only, and say so if the question needs DRHP-level detail that isn\'t available.'}

Investor's question: "${question}"

Respond with plain text only (no JSON, no markdown headers) — just the answer.`;
}

export function parseAnalysisJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { /* fall through */ }
    }
    throw new Error('The model did not return valid JSON for the analysis request');
  }
}

/**
 * Turns the canonical structured IPO object into a compact text block for
 * the prompt — only includes fields we actually have data for.
 */
export function buildStructuredSummary(ipo) {
  const lines = [`Company: ${ipo.name}`, `Sector: ${ipo.industry}`, `IPO status: ${ipo.status}`];

  if (ipo.issueSize) lines.push(`Issue size: ${ipo.issueSize}`);
  if (ipo.priceBand?.high) lines.push(`Price band: ₹${ipo.priceBand.low}–₹${ipo.priceBand.high}`);
  if (ipo.snapshot?.founded) lines.push(`Founded: ${ipo.snapshot.founded}`);
  if (ipo.snapshot?.headquarters) lines.push(`Headquarters: ${ipo.snapshot.headquarters}`);
  if (ipo.snapshot?.employees) lines.push(`Employees: ${ipo.snapshot.employees}`);

  if (ipo.financials?.revenue?.length) {
    lines.push(`Revenue by year (${ipo.financials.years?.join(', ')}), ₹ Cr: ${ipo.financials.revenue.join(', ')}`);
    if (ipo.financials.pat?.length) lines.push(`PAT by year, ₹ Cr: ${ipo.financials.pat.join(', ')}`);
    if (ipo.financials.debt?.length) lines.push(`Debt by year, ₹ Cr: ${ipo.financials.debt.join(', ')}`);
    if (ipo.financials.roe?.length) lines.push(`ROE by year (%): ${ipo.financials.roe.join(', ')}`);
  } else {
    lines.push('Financial history: not available from the data source.');
  }

  if (ipo.valuation?.ipoPE) {
    lines.push(`IPO PE: ${ipo.valuation.ipoPE}x, Industry PE: ${ipo.valuation.industryPE ?? 'unknown'}x`);
  }

  if (ipo.status === 'listed' && ipo.listingPrice != null) {
    lines.push(`Listing price: ₹${ipo.listingPrice}${ipo.listingGain != null ? ` (${ipo.listingGain >= 0 ? '+' : ''}${ipo.listingGain}% vs issue price)` : ''}`);
  }

  if (ipo.promoters?.length) {
    lines.push(`Promoters: ${ipo.promoters.map(p => `${p.name}${p.holding ? ` (${p.holding}% holding)` : ''}`).join('; ')}`);
  }

  if (ipo.competitors?.length) {
    lines.push(`Listed peers: ${ipo.competitors.map(c => c.name).join(', ')}`);
  }

  if (ipo.gmp?.current) lines.push(`Current grey market premium: ₹${ipo.gmp.current} (${ipo.gmp.percentage}%)`);
  if (ipo.subscription?.overall) lines.push(`Overall subscription: ${ipo.subscription.overall}x`);

  return lines.join('\n');
}
