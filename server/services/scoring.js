/**
 * Cheap, non-LLM heuristic Vitta Score computed purely from numeric
 * fields we already have, so list cards show a real score immediately
 * instead of the old hardcoded "5/10 for everything" placeholder.
 *
 * Dimensions that genuinely require qualitative judgment (business
 * quality, corporate governance, industry outlook) are left `null` here
 * — they're filled in by the AI analysis once generated, and the UI
 * shows "pending" for them until then rather than a made-up number.
 */
export function scoreIPO(ipo) {
  const financialStrength = scoreFinancialStrength(ipo.financials);
  const growth = scoreGrowth(ipo.financials);
  const valuation = scoreValuation(ipo.valuation);

  const known = [financialStrength, growth, valuation].filter(v => v !== null);
  const overall = known.length > 0
    ? Number((known.reduce((a, b) => a + b, 0) / known.length).toFixed(1))
    : null;

  return {
    businessQuality: null,
    financialStrength,
    growth,
    corporateGovernance: null,
    valuation,
    industryOutlook: null,
    overall,
    _heuristic: true,
  };
}

function scoreFinancialStrength(f) {
  if (!f?.revenue?.length || !f?.margins?.pat?.length) return null;
  const latestMargin = f.margins.pat[f.margins.pat.length - 1];
  const debtTrend = f.debt?.length >= 2 ? f.debt[0] - f.debt[f.debt.length - 1] : 0;
  const roe = f.roe?.length ? f.roe[f.roe.length - 1] : 0;

  let score = 5;
  score += clamp((latestMargin - 10) / 5, -2, 3); // reward double-digit PAT margins
  score += debtTrend > 0 ? 1 : (debtTrend < 0 ? -1 : 0); // reward falling debt
  score += clamp((roe - 15) / 10, -1, 2); // reward strong ROE
  return clamp(Math.round(score * 10) / 10, 0, 10);
}

function scoreGrowth(f) {
  if (!f?.revenue?.length || f.revenue.length < 2) return null;
  const first = f.revenue[0];
  const last = f.revenue[f.revenue.length - 1];
  if (!first || first <= 0) return null;
  const years = f.revenue.length - 1;
  const cagr = (Math.pow(last / first, 1 / years) - 1) * 100;

  let score = 5 + clamp(cagr / 10, -3, 5);
  return clamp(Math.round(score * 10) / 10, 0, 10);
}

function scoreValuation(v) {
  if (!v?.ipoPE || !v?.industryPE) return null;
  const premiumPct = ((v.ipoPE - v.industryPE) / v.industryPE) * 100;
  // Cheaper relative to industry PE scores higher; expensive scores lower.
  let score = 6 - clamp(premiumPct / 15, -3, 4);
  return clamp(Math.round(score * 10) / 10, 0, 10);
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}
