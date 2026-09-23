import { Scale, TrendingUp, TrendingDown } from 'lucide-react';

export default function Valuation({ ipo }) {
  const v = ipo.valuation;
  if (!v?.ipoPE) {
    return (
      <section className="ipo-section-block" id="valuation">
        <div className="section-label-tag">14</div>
        <h2 className="section-title">Valuation</h2>
        <p className="section-subtitle">PE and valuation data isn't available for this company yet.</p>
      </section>
    );
  }
  const peData = [
    { label: 'IPO PE', value: v.ipoPE, color: '#C5A55A' },
    { label: 'Industry PE', value: v.industryPE, color: '#1B6B3A' },
    { label: 'Competitor Avg PE', value: v.competitorAvgPE, color: '#06b6d4' },
  ].filter(p => p.value != null);
  const maxPE = Math.max(...peData.map(p => p.value));
  const hasIndustryPE = v.industryPE != null;
  const isPremium = hasIndustryPE && v.ipoPE > v.industryPE;

  return (
    <section className="ipo-section-block" id="valuation">
      <div className="section-label-tag">14</div>
      <h2 className="section-title">Valuation</h2>
      <div className="val-visual">
        {peData.map(p => (
          <div key={p.label} className="val-bar-row">
            <span className="val-bar-label">{p.label}</span>
            <div className="val-bar-track">
              <div className="val-bar-fill" style={{ width: `${(p.value/maxPE)*100}%`, background: p.color }} />
            </div>
            <span className="val-bar-value">{p.value}x</span>
          </div>
        ))}
      </div>
      <div className={`val-verdict glass-card ${isPremium ? 'premium' : 'discount'}`}>
        {isPremium ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
        <div>
          <h4>{v.premiumDiscount || (hasIndustryPE ? 'Valuation vs industry' : 'Industry PE not available for comparison')}</h4>
          <p>
            {v.mcap ? `Market Cap at upper band: ₹${v.mcap.toLocaleString()} Cr` : 'Market cap not disclosed'}
            {v.evToSales ? ` · EV/Sales: ${v.evToSales}x` : ''}
          </p>
        </div>
      </div>
    </section>
  );
}
