import { TrendingUp, Zap } from 'lucide-react';
import { formatCurrency } from '../context/IPODataContext';

export default function IndustryAnalysis({ ipo }) {
  const ind = ipo.industryData;
  if (!ind) {
    return (
      <section className="ipo-section-block" id="industry">
        <div className="section-label-tag">09</div>
        <h2 className="section-title">Industry Analysis</h2>
        <p className="section-subtitle">Industry sizing data isn't available for this company yet.</p>
      </section>
    );
  }
  return (
    <section className="ipo-section-block" id="industry">
      <div className="section-label-tag">09</div>
      <h2 className="section-title">Industry Analysis</h2>
      <p className="section-subtitle">{ind.name}</p>
      <div className="industry-overview glass-card">
        <p>{ind.description}</p>
      </div>
      <div className="market-size-compare">
        <div className="market-size-box glass-card">
          <span className="ms-year">2024</span>
          <span className="ms-value">{formatCurrency(ind.marketSize2024)}</span>
        </div>
        <div className="market-arrow">
          <TrendingUp size={24} />
          <span className="cagr-badge badge-green">{ind.cagr}% CAGR</span>
        </div>
        <div className="market-size-box glass-card ms-future">
          <span className="ms-year">2030</span>
          <span className="ms-value">{formatCurrency(ind.marketSize2030)}</span>
        </div>
      </div>
      <div className="key-drivers">
        <h4>Key Growth Drivers</h4>
        <div className="drivers-list">
          {ind.keyDrivers.map(d => (
            <div key={d} className="driver-tag glass-card"><Zap size={14} /> {d}</div>
          ))}
        </div>
      </div>
    </section>
  );
}
