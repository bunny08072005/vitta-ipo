import { Brain, ThumbsUp, ThumbsDown, TrendingUp, AlertTriangle, Target, User } from 'lucide-react';
import AIStateNotice from '../components/AIStateNotice';

export default function AISummary({ ipo, aiState }) {
  const ai = ipo.aiSummary;
  if (!ai) {
    return (
      <section className="ipo-section-block" id="ai-summary">
        <div className="section-label-tag">17</div>
        <h2 className="section-title">AI Summary</h2>
        <AIStateNotice aiState={aiState} />
      </section>
    );
  }
  const verdicts = [
    { icon: ThumbsUp, label: 'Good Company?', value: ai.goodCompany, color: typeof ai.goodCompany === 'string' && ai.goodCompany.startsWith('Yes') ? 'var(--green)' : 'var(--amber)' },
    { icon: TrendingUp, label: 'Growth', value: ai.growth },
    { icon: Target, label: 'Expensive?', value: ai.expensive },
    { icon: AlertTriangle, label: 'Major Risks', value: ai.majorRisks },
  ];

  return (
    <section className="ipo-section-block" id="ai-summary">
      <div className="section-label-tag">17</div>
      <h2 className="section-title">AI Summary</h2>
      <div className="ai-hero glass-card">
        <div className="ai-hero-header">
          <Brain size={24} />
          <span>If you only have 60 seconds, here's what matters</span>
        </div>
        <p className="ai-oneliner">{ai.oneLiner}</p>
      </div>
      <div className="ai-verdicts">
        {verdicts.map(v => (
          <div key={v.label} className="ai-verdict-card glass-card">
            <v.icon size={18} />
            <h4>{v.label}</h4>
            <p>{v.value}</p>
          </div>
        ))}
      </div>
      <div className="ai-legends">
        <div className="ai-legend glass-card">
          <div className="legend-header">
            <User size={18} /> <h4>Would Buffett Invest?</h4>
          </div>
          <p>{ai.buffettVerdict}</p>
        </div>
        <div className="ai-legend glass-card">
          <div className="legend-header">
            <User size={18} /> <h4>Would Peter Lynch Like It?</h4>
          </div>
          <p>{ai.lynchVerdict}</p>
        </div>
      </div>
      <div className="ai-who glass-card">
        <h4>Who Should Consider Applying?</h4>
        <p>{ai.whoShouldApply}</p>
      </div>
    </section>
  );
}
