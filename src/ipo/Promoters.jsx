import { User, Briefcase } from 'lucide-react';

export default function Promoters({ ipo }) {
  if (!ipo.promoters?.length) {
    return (
      <section className="ipo-section-block" id="promoters">
        <div className="section-label-tag">07</div>
        <h2 className="section-title">Promoters</h2>
        <p className="section-subtitle">Promoter details aren't available for this company yet.</p>
      </section>
    );
  }
  return (
    <section className="ipo-section-block" id="promoters">
      <div className="section-label-tag">07</div>
      <h2 className="section-title">Promoters</h2>
      <div className="promoters-grid">
        {ipo.promoters.map(p => (
          <div key={p.name} className="promoter-card glass-card">
            <div className="promoter-avatar"><User size={28} /></div>
            <div className="promoter-info">
              <h4>{p.name}</h4>
              <span className="promoter-role">{p.designation}</span>
              <div className="promoter-details">
                {p.experience && (
                  <div className="promoter-detail">
                    <Briefcase size={14} />
                    <span>{p.experience}</span>
                  </div>
                )}
                {p.holding != null && (
                  <div className="promoter-holding">
                    <span className="holding-pct">{p.holding}%</span>
                    <span className="holding-label">Holding</span>
                  </div>
                )}
              </div>
              {p.background && <p className="promoter-bg">{p.background}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
