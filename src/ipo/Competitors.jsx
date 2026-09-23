export default function Competitors({ ipo }) {
  const f = ipo.financials;
  const hasThisIPORow = f?.revenue?.length > 0;

  if (!hasThisIPORow && ipo.competitors.length === 0) {
    return (
      <section className="ipo-section-block" id="competitors">
        <div className="section-label-tag">10</div>
        <h2 className="section-title">Peer Comparison</h2>
        <p className="section-subtitle">Peer comparison data isn't available for this company yet.</p>
      </section>
    );
  }

  const last = f?.revenue?.length ? f.revenue.length - 1 : -1;

  return (
    <section className="ipo-section-block" id="competitors">
      <div className="section-label-tag">10</div>
      <h2 className="section-title">Peer Comparison</h2>
      <div className="competitors-table-wrap">
        <table className="competitors-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Revenue (₹ Cr)</th>
              <th>PE Ratio</th>
              <th>ROE (%)</th>
              <th>Margin (%)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {hasThisIPORow && (
              <tr className="comp-highlight">
                <td><strong>{ipo.name.split(' ')[0]}</strong> <span className="comp-ipo-tag">This IPO</span></td>
                <td>{f.revenue[last].toLocaleString()}</td>
                <td>{ipo.valuation?.ipoPE ?? '—'}</td>
                <td>{f.roe?.[last] ?? '—'}</td>
                <td>{f.margins?.pat?.[last] ?? '—'}</td>
                <td><span className="badge badge-amber">IPO</span></td>
              </tr>
            )}
            {ipo.competitors.map(c => (
              <tr key={c.name}>
                <td>{c.name}</td>
                <td>{c.revenue.toLocaleString()}</td>
                <td>{c.pe ?? '—'}</td>
                <td>{c.roe ?? '—'}</td>
                <td>{c.margin}</td>
                <td><span className={`badge ${c.listed ? 'badge-green' : 'badge-purple'}`}>{c.listed ? 'Listed' : 'Private'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
