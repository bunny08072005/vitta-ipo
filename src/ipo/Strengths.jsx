import { CheckCircle } from 'lucide-react';
import AIStateNotice from '../components/AIStateNotice';

export default function Strengths({ ipo, aiState }) {
  if (!ipo.strengths) {
    return (
      <section className="ipo-section-block" id="strengths">
        <div className="section-label-tag">12</div>
        <h2 className="section-title">Key Strengths</h2>
        <AIStateNotice aiState={aiState} />
      </section>
    );
  }
  return (
    <section className="ipo-section-block" id="strengths">
      <div className="section-label-tag">12</div>
      <h2 className="section-title">Key Strengths</h2>
      <div className="strengths-grid">
        {ipo.strengths.map((s, i) => (
          <div key={i} className="strength-card glass-card">
            <div className="strength-icon"><CheckCircle size={20} /></div>
            <h4>{s.title}</h4>
            <p>{s.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
