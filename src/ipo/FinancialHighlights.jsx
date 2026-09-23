import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Filler);

const chartOpts = (title) => ({
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: 'rgba(10,12,11,0.95)', borderColor: 'rgba(27,107,58,0.3)', borderWidth: 1, titleFont: { family: 'Inter' }, bodyFont: { family: 'Inter' } },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#8a9a8e', font: { family: 'Inter', size: 11 } } },
    y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#8a9a8e', font: { family: 'Inter', size: 11 } } },
  },
});

function MiniChart({ title, labels, data, type = 'bar', color = '#1B6B3A', suffix = '' }) {
  const dataset = {
    labels,
    datasets: [{
      data,
      backgroundColor: type === 'bar' ? color + '99' : 'transparent',
      borderColor: color,
      borderWidth: type === 'line' ? 2 : 0,
      borderRadius: type === 'bar' ? 6 : 0,
      fill: type === 'line' ? { target: 'origin', above: color + '15' } : false,
      tension: 0.4,
      pointRadius: type === 'line' ? 3 : 0,
      pointBackgroundColor: color,
    }],
  };
  const Comp = type === 'bar' ? Bar : Line;
  return (
    <div className="fin-chart-card glass-card">
      <h4 className="fin-chart-title">{title}</h4>
      <div className="fin-chart-wrap"><Comp data={dataset} options={chartOpts(title)} /></div>
    </div>
  );
}

export default function FinancialHighlights({ ipo }) {
  const f = ipo.financials;
  if (!f?.revenue?.length) {
    return (
      <section className="ipo-section-block" id="financials">
        <div className="section-label-tag">05</div>
        <h2 className="section-title">Financial Highlights</h2>
        <p className="section-subtitle">Historical financials for this company aren't available from the current data source.</p>
      </section>
    );
  }
  return (
    <section className="ipo-section-block" id="financials">
      <div className="section-label-tag">05</div>
      <h2 className="section-title">Financial Highlights</h2>
      <p className="section-subtitle">All figures in ₹ Crores</p>
      <div className="fin-grid">
        <MiniChart title="Revenue" labels={f.years} data={f.revenue} color="#1B6B3A" />
        <MiniChart title="EBITDA" labels={f.years} data={f.ebitda} color="#C5A55A" />
        <MiniChart title="Profit After Tax" labels={f.years} data={f.pat} color="#10b981" />
        <MiniChart title="Cash Flow" labels={f.years} data={f.cashFlow} type="line" color="#06b6d4" />
        <MiniChart title="Debt" labels={f.years} data={f.debt} color="#f43f5e" />
        <MiniChart title="EBITDA Margin (%)" labels={f.years} data={f.margins.ebitda} type="line" color="#a855f7" />
        <MiniChart title="ROE (%)" labels={f.years} data={f.roe} type="line" color="#1B6B3A" />
        <MiniChart title="ROCE (%)" labels={f.years} data={f.roce} type="line" color="#C5A55A" />
      </div>
    </section>
  );
}
