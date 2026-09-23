import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = ['#1B6B3A', '#C5A55A', '#06b6d4', '#a855f7', '#f59e0b', '#ec4899'];

export default function Shareholding({ ipo }) {
  if (!ipo.shareholding?.length) {
    return (
      <section className="ipo-section-block" id="shareholding">
        <div className="section-label-tag">08</div>
        <h2 className="section-title">Shareholding Pattern</h2>
        <p className="section-subtitle">Shareholding pattern isn't available for this company yet.</p>
      </section>
    );
  }
  const data = {
    labels: ipo.shareholding.map(s => s.holder),
    datasets: [{
      data: ipo.shareholding.map(s => s.percentage),
      backgroundColor: COLORS.slice(0, ipo.shareholding.length),
      borderWidth: 0, hoverOffset: 8,
    }],
  };
  const options = {
    responsive: true, maintainAspectRatio: false, cutout: '60%',
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: 'rgba(10,12,11,0.95)', borderColor: 'rgba(27,107,58,0.3)', borderWidth: 1, callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw}%` } },
    },
  };
  return (
    <section className="ipo-section-block" id="shareholding">
      <div className="section-label-tag">08</div>
      <h2 className="section-title">Shareholding Pattern</h2>
      <div className="revenue-layout">
        <div className="revenue-chart-wrap"><Doughnut data={data} options={options} /></div>
        <div className="revenue-legend">
          {ipo.shareholding.map((s, i) => (
            <div key={s.holder} className="revenue-legend-item">
              <span className="legend-dot" style={{ background: COLORS[i] }} />
              <span className="legend-label">{s.holder}</span>
              <span className="legend-pct">{s.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
