import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrendingUp, TrendingDown } from 'lucide-react';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export default function GMP({ ipo }) {
  if (ipo.status === 'listed') return <ListingPerformance ipo={ipo} />;

  const g = ipo.gmp;
  const hasData = g.current > 0 || g.history?.length > 0;

  if (!hasData) {
    return (
      <section className="ipo-section-block" id="gmp">
        <div className="section-label-tag">15</div>
        <h2 className="section-title">Grey Market Premium</h2>
        <p className="section-subtitle">Grey market premium data isn't available for this IPO right now.</p>
      </section>
    );
  }

  const data = {
    labels: g.history.map(h => h.date.slice(5)),
    datasets: [{
      data: g.history.map(h => h.value),
      borderColor: '#10b981', borderWidth: 2, tension: 0.4,
      fill: { target: 'origin', above: 'rgba(16,185,129,0.1)' },
      pointRadius: 4, pointBackgroundColor: '#10b981',
    }],
  };
  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(10,12,11,0.95)', borderColor: 'rgba(27,107,58,0.3)', borderWidth: 1, callbacks: { label: ctx => `GMP: ₹${ctx.raw}` } } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#8a9a8e', font: { family: 'Inter', size: 11 } } },
      y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#8a9a8e', font: { family: 'Inter', size: 11 }, callback: v => `₹${v}` } },
    },
  };

  return (
    <section className="ipo-section-block" id="gmp">
      <div className="section-label-tag">15</div>
      <h2 className="section-title">Grey Market Premium</h2>
      <div className="gmp-current glass-card">
        <div className="gmp-main">
          <span className="gmp-label">Current GMP</span>
          <span className="gmp-value">+₹{g.current}</span>
        </div>
        <div className="gmp-est">
          <span className="gmp-label">Expected Listing</span>
          <span className="gmp-listing">₹{ipo.priceBand.high + g.current} ({g.percentage}% premium)</span>
        </div>
      </div>
      {g.history?.length > 0 && (
        <div className="gmp-chart glass-card">
          <h4>GMP Trend</h4>
          <div className="gmp-chart-wrap"><Line data={data} options={options} /></div>
        </div>
      )}
    </section>
  );
}

function ListingPerformance({ ipo }) {
  const hasGain = ipo.listingGain != null;
  const isGain = hasGain && ipo.listingGain >= 0;
  const issuePrice = ipo.priceBand?.high || null;
  const maxPrice = Math.max(issuePrice || 0, ipo.listingPrice || 0) || 1;

  return (
    <section className="ipo-section-block" id="gmp">
      <div className="section-label-tag">15</div>
      <h2 className="section-title">Listing Performance</h2>
      <p className="section-subtitle">How the stock performed on listing day versus its issue price</p>
      <div className="val-visual">
        <div className="val-bar-row">
          <span className="val-bar-label">Issue Price</span>
          <div className="val-bar-track">
            <div className="val-bar-fill" style={{ width: issuePrice ? `${(issuePrice / maxPrice) * 100}%` : '0%', background: '#C5A55A' }} />
          </div>
          <span className="val-bar-value">{issuePrice ? `₹${issuePrice}` : '—'}</span>
        </div>
        <div className="val-bar-row">
          <span className="val-bar-label">Listed Price</span>
          <div className="val-bar-track">
            <div className="val-bar-fill" style={{ width: ipo.listingPrice ? `${(ipo.listingPrice / maxPrice) * 100}%` : '0%', background: hasGain ? (isGain ? '#10b981' : '#f43f5e') : '#1B6B3A' }} />
          </div>
          <span className="val-bar-value">{ipo.listingPrice != null ? `₹${ipo.listingPrice}` : '—'}</span>
        </div>
      </div>
      <div className={`val-verdict glass-card ${hasGain && isGain ? 'discount' : 'premium'}`}>
        {hasGain && isGain ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
        <div>
          <h4>{hasGain ? `${isGain ? '+' : ''}${ipo.listingGain}% ${isGain ? 'gain' : 'loss'} on listing day` : 'Listing gain/loss not disclosed'}</h4>
          <p>Relative to the ₹{issuePrice || '—'} issue price</p>
        </div>
      </div>
    </section>
  );
}
