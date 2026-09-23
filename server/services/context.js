import { findDRHP } from './drhp.js';
import { buildStructuredSummary } from './promptContext.js';

/**
 * Shared by both /analysis and /chat — builds the same grounding context
 * (structured data summary + DRHP excerpt if one was found) so answers
 * and the generated analysis stay consistent with each other.
 */
export async function buildAnalysisContext(ipo) {
  const drhp = await findDRHP(ipo.name, ipo.documentUrl);
  return {
    structuredSummary: buildStructuredSummary(ipo),
    drhpExcerpt: drhp.found ? drhp.text : null,
    drhpFound: drhp.found,
  };
}
