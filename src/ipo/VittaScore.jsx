import ScoreGauge from '../components/ScoreGauge';
import AIStateNotice from '../components/AIStateNotice';

const DIMENSIONS = [
  { key: 'businessQuality', label: 'Business Quality', emoji: '🏢' },
  { key: 'financialStrength', label: 'Financial Strength', emoji: '💰' },
  { key: 'growth', label: 'Growth', emoji: '📈' },
  { key: 'corporateGovernance', label: 'Governance', emoji: '🏛️' },
  { key: 'valuation', label: 'Valuation', emoji: '⚖️' },
  { key: 'industryOutlook', label: 'Industry Outlook', emoji: '🔭' },
];

export default function VittaScore({ ipo, aiState }) {
  const s = ipo.vittaScore || {};
  const known = s.overall !== null && s.overall !== undefined;
  const color = !known ? 'var(--text-muted)' : s.overall >= 8 ? 'var(--green)' : s.overall >= 6 ? 'var(--amber)' : 'var(--red)';

  return (
    <section className="ipo-section-block" id="vitta-score">
      <div className="section-label-tag">18</div>
      <h2 className="section-title">Vitta Score</h2>
      {s._heuristic && <AIStateNotice aiState={aiState} />}
      <div className="score-hero glass-card">
        <ScoreGauge score={s.overall} size={120} />
        <div className="score-hero-info">
          <span className="score-hero-value" style={{ color }}>{known ? s.overall : '—'}</span>
          <span className="score-hero-max">/ 10</span>
          <span className="score-hero-label">{s._heuristic ? 'Provisional Score (financials only)' : 'Overall Score'}</span>
        </div>
      </div>
      <div className="score-dimensions">
        {DIMENSIONS.map(d => {
          const val = s[d.key];
          const dimKnown = val !== null && val !== undefined;
          return (
            <div key={d.key} className="score-dim glass-card">
              <span className="dim-emoji">{d.emoji}</span>
              <div className="dim-info">
                <span className="dim-label">{d.label}</span>
                <div className="dim-bar-track">
                  <div className="dim-bar-fill" style={{ width: `${dimKnown ? val*10 : 0}%`, background: !dimKnown ? 'var(--text-muted)' : val >= 8 ? 'var(--green)' : val >= 6 ? 'var(--amber)' : 'var(--red)' }} />
                </div>
              </div>
              <span className="dim-value">{dimKnown ? val : '—'}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
