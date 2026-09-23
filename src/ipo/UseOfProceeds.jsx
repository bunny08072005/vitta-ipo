export default function UseOfProceeds({ ipo }) {
  const COLORS = ['#1B6B3A', '#C5A55A', '#06b6d4', '#a855f7', '#f59e0b'];

  if (!ipo.useOfProceeds?.length) {
    return (
      <section className="ipo-section-block" id="proceeds">
        <div className="section-label-tag">13</div>
        <h2 className="section-title">Use of IPO Proceeds</h2>
        <p className="section-subtitle">A breakdown of how proceeds will be used isn't available for this company yet.</p>
      </section>
    );
  }

  return (
    <section className="ipo-section-block" id="proceeds">
      <div className="section-label-tag">13</div>
      <h2 className="section-title">Use of IPO Proceeds</h2>
      <p className="section-subtitle">How the company plans to use the {ipo.freshIssue != null ? `₹${ipo.freshIssue.toLocaleString()} Cr` : ''} fresh issue</p>
      <div className="proceeds-bar">
        {ipo.useOfProceeds.map((p, i) => (
          <div key={i} className="proceeds-segment" style={{ width: `${p.percentage}%`, background: COLORS[i] }} title={`${p.purpose}: ${p.percentage}%`} />
        ))}
      </div>
      <div className="proceeds-list">
        {ipo.useOfProceeds.map((p, i) => (
          <div key={i} className="proceeds-item glass-card">
            <div className="proceeds-color" style={{ background: COLORS[i] }} />
            <div className="proceeds-info">
              <h4>{p.purpose}</h4>
              <span className="proceeds-amount">₹{p.amount.toLocaleString()} Cr</span>
            </div>
            <span className="proceeds-pct">{p.percentage}%</span>
          </div>
        ))}
      </div>
    </section>
  );
}
