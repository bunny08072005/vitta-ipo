export default function SubscriptionStatus({ ipo }) {
  const sub = ipo.subscription;
  const categories = [
    { label: 'Retail', data: sub.retail, color: '#1B6B3A' },
    { label: 'NII (HNI)', data: sub.nii, color: '#C5A55A' },
    { label: 'QIB', data: sub.qib, color: '#06b6d4' },
    { label: 'Employee', data: sub.employee, color: '#a855f7' },
  ];
  const maxTimes = Math.max(...categories.map(c => c.data.times), 1);
  const notOpen = sub.overall === 0;

  return (
    <section className="ipo-section-block" id="subscription">
      <div className="section-label-tag">16</div>
      <h2 className="section-title">Subscription Status</h2>
      {notOpen ? (
        <div className="sub-not-open glass-card">
          <p>Subscription data will be available once the IPO opens for bidding.</p>
        </div>
      ) : (
        <>
          <div className="sub-overall glass-card">
            <span className="sub-overall-label">Overall Subscription</span>
            <span className="sub-overall-value">{sub.overall}x</span>
          </div>
          <div className="sub-categories">
            {categories.map(cat => (
              <div key={cat.label} className="sub-category glass-card">
                <div className="sub-cat-header">
                  <span className="sub-cat-name">{cat.label}</span>
                  <span className="sub-cat-times" style={{ color: cat.color }}>{cat.data.times}x</span>
                </div>
                <div className="sub-bar-track">
                  <div className="sub-bar-fill" style={{ width: `${Math.min((cat.data.times/maxTimes)*100, 100)}%`, background: cat.color }} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
