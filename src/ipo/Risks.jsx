import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import AIStateNotice from '../components/AIStateNotice';

const ICONS = { high: AlertTriangle, medium: AlertCircle, low: Info };
const COLORS = { high: 'var(--red)', medium: 'var(--amber)', low: 'var(--cyan)' };
const BGS = { high: 'var(--red-soft)', medium: 'var(--amber-soft)', low: 'var(--cyan-soft)' };

export default function Risks({ ipo, aiState }) {
  if (!ipo.risks) {
    return (
      <section className="ipo-section-block" id="risks">
        <div className="section-label-tag">11</div>
        <h2 className="section-title">Key Risks</h2>
        <AIStateNotice aiState={aiState} />
      </section>
    );
  }
  return (
    <section className="ipo-section-block" id="risks">
      <div className="section-label-tag">11</div>
      <h2 className="section-title">Key Risks</h2>
      <p className="section-subtitle">Extracted from DRHP risk factors — {ipo.risks.length} most critical</p>
      <div className="risks-grid">
        {ipo.risks.map((risk, i) => {
          const Icon = ICONS[risk.severity];
          return (
            <div key={i} className="risk-card glass-card" style={{ borderLeftColor: COLORS[risk.severity] }}>
              <div className="risk-header">
                <span className="risk-severity" style={{ background: BGS[risk.severity], color: COLORS[risk.severity] }}>
                  <Icon size={14} /> {risk.severity.toUpperCase()}
                </span>
              </div>
              <h4 className="risk-title">{risk.title}</h4>
              <p className="risk-desc">{risk.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
