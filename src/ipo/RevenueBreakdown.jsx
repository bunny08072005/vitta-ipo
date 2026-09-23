import { useRef, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function RevenueBreakdown({ ipo }) {
  if (!ipo.revenueBreakdown?.length) {
    return (
      <section className="ipo-section-block" id="revenue">
        <div className="section-label-tag">04</div>
        <h2 className="section-title">Revenue Breakdown</h2>
        <p className="section-subtitle">A segment-wise revenue breakdown isn't available from the current data source.</p>
      </section>
    );
  }
  const data = {
    labels: ipo.revenueBreakdown.map(r => r.segment),
    datasets: [{
      data: ipo.revenueBreakdown.map(r => r.percentage),
      backgroundColor: ipo.revenueBreakdown.map(r => r.color),
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(10,12,11,0.95)',
        borderColor: 'rgba(27,107,58,0.3)',
        borderWidth: 1,
        titleFont: { family: 'Inter' },
        bodyFont: { family: 'Inter' },
        callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw}%` },
      },
    },
  };

  return (
    <section className="ipo-section-block" id="revenue">
      <div className="section-label-tag">04</div>
      <h2 className="section-title">Revenue Breakdown</h2>
      <div className="revenue-layout">
        <div className="revenue-chart-wrap">
          <Doughnut data={data} options={options} />
        </div>
        <div className="revenue-legend">
          {ipo.revenueBreakdown.map(r => (
            <div key={r.segment} className="revenue-legend-item">
              <span className="legend-dot" style={{ background: r.color }} />
              <span className="legend-label">{r.segment}</span>
              <span className="legend-pct">{r.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
