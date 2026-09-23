import { Loader2, AlertTriangle } from 'lucide-react';

/**
 * Shared loading/error placeholder for sections whose content is filled
 * in by the on-demand AI analysis call. Returns null once real content
 * has arrived, so callers can just do `<AIStateNotice aiState={aiState} />`
 * followed by their normal render and let this component own the two
 * "nothing to show yet" states.
 */
export default function AIStateNotice({ aiState }) {
  if (!aiState) return null;

  if (aiState.loading) {
    return (
      <div className="ai-state-notice glass-card">
        <Loader2 size={18} className="spinning" />
        <span>Generating AI analysis from company data and filings…</span>
      </div>
    );
  }

  if (aiState.error) {
    return (
      <div className="ai-state-notice ai-state-error glass-card">
        <AlertTriangle size={18} />
        <span>AI analysis unavailable right now ({aiState.error}). The backend may be missing an Anthropic API key.</span>
      </div>
    );
  }

  return null;
}
