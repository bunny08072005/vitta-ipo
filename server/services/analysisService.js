import crypto from 'crypto';
import { buildAnalysisContext } from './context.js';
import { generateAnalysis } from './llmProvider.js';
import { diskGet, diskSet } from './cache.js';
import { scoreIPO } from './scoring.js';

/**
 * Shared by GET /api/ipos/:slug/analysis and POST /api/ipos/:slug/upload-rhp
 * — both need "get the cached analysis, or generate + cache a fresh one."
 * Caching is keyed by a hash of the grounding context (structured summary
 * + DRHP excerpt), so uploading a new RHP for a company naturally produces
 * a different hash and triggers regeneration without any manual cache
 * invalidation.
 */
export async function getOrGenerateAnalysis(ipo) {
  const context = await buildAnalysisContext(ipo);
  const inputHash = crypto.createHash('sha256')
    .update(context.structuredSummary + (context.drhpExcerpt || ''))
    .digest('hex');

  const cached = diskGet('analysis', ipo.id);
  if (cached?.inputHash === inputHash) {
    return { ...cached.analysis, _drhpFound: context.drhpFound, _cached: true };
  }

  const analysis = await generateAnalysis(context);
  const heuristicScore = scoreIPO(ipo);
  const vittaScore = {
    ...heuristicScore,
    businessQuality: analysis.vittaScore?.businessQuality ?? heuristicScore.businessQuality,
    corporateGovernance: analysis.vittaScore?.corporateGovernance ?? heuristicScore.corporateGovernance,
    industryOutlook: analysis.vittaScore?.industryOutlook ?? heuristicScore.industryOutlook,
  };
  const knownDims = [
    vittaScore.businessQuality, vittaScore.financialStrength, vittaScore.growth,
    vittaScore.corporateGovernance, vittaScore.valuation, vittaScore.industryOutlook,
  ].filter(v => v !== null && v !== undefined);
  vittaScore.overall = knownDims.length
    ? Number((knownDims.reduce((a, b) => a + b, 0) / knownDims.length).toFixed(1))
    : null;
  vittaScore._heuristic = false;

  const result = { ...analysis, vittaScore, _aiAnalysisAvailable: true };
  diskSet('analysis', ipo.id, { inputHash, analysis: result, generatedAt: new Date().toISOString() });

  return { ...result, _drhpFound: context.drhpFound, _cached: false };
}
