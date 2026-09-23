export default function GrowthTrend({ ipo }) {
  const f = ipo.financials;
  if (!f?.revenue?.length) {
    return (
      <section className="ipo-section-block" id="growth">
        <div className="section-label-tag">06</div>
        <h2 className="section-title">Growth Trend</h2>
        <p className="section-subtitle">Historical financials for this company aren't available from the current data source.</p>
      </section>
    );
  }
  const maxRev = Math.max(...f.revenue);
  return (
    <section className="ipo-section-block" id="growth">
      <div className="section-label-tag">06</div>
      <h2 className="section-title">Growth Trend</h2>
      <div className="growth-bars">
        {f.years.map((year, i) => {
          const pct = (f.revenue[i] / maxRev) * 100;
          const yoy = i > 0 ? (((f.revenue[i] - f.revenue[i-1]) / f.revenue[i-1]) * 100).toFixed(0) : null;
          return (
            <div key={year} className="growth-row">
              <span className="growth-year">{year}</span>
              <div className="growth-bar-track">
                <div className="growth-bar-fill" style={{ width: `${pct}%`, animationDelay: `${i * 150}ms` }} />
              </div>
              <span className="growth-val">₹{f.revenue[i]} Cr</span>
              {yoy && <span className="growth-yoy badge-green">+{yoy}%</span>}
            </div>
          );
        })}
      </div>
      <div className="growth-cagr glass-card">
        <span className="cagr-label">5-Year Revenue CAGR</span>
        <span className="cagr-value">{((Math.pow(f.revenue[4]/f.revenue[0], 1/4) - 1) * 100).toFixed(1)}%</span>
      </div>
    </section>
  );
}
