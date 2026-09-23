import { ArrowDown } from 'lucide-react';
import AIStateNotice from '../components/AIStateNotice';

export default function BusinessModel({ ipo, aiState }) {
  const bm = ipo.businessModelCanvas;
  if (!bm) {
    return (
      <section className="ipo-section-block" id="business-model">
        <div className="section-label-tag">03</div>
        <h2 className="section-title">Business Model</h2>
        <AIStateNotice aiState={aiState} />
      </section>
    );
  }
  return (
    <section className="ipo-section-block" id="business-model">
      <div className="section-label-tag">03</div>
      <h2 className="section-title">Business Model</h2>
      <div className="bm-flow">
        <div className="bm-node glass-card bm-customers">
          <h4>Customers</h4>
          <ul>{bm.customers.map(c => <li key={c}>{c}</li>)}</ul>
        </div>
        <div className="bm-arrow"><ArrowDown size={24} /></div>
        <div className="bm-node glass-card bm-value">
          <h4>Value Proposition</h4>
          <p>{bm.valueProposition}</p>
        </div>
        <div className="bm-arrow"><ArrowDown size={24} /></div>
        <div className="bm-node glass-card bm-revenue">
          <h4>Revenue Streams</h4>
          <ul>{bm.revenueStreams.map(r => <li key={r}>{r}</li>)}</ul>
        </div>
      </div>
      <div className="bm-extras">
        <div className="glass-card bm-extra">
          <h4>Key Resources</h4>
          <ul>{bm.keyResources.map(r => <li key={r}>{r}</li>)}</ul>
        </div>
        <div className="glass-card bm-extra">
          <h4>Key Partners</h4>
          <ul>{bm.keyPartners.map(p => <li key={p}>{p}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}
