import { CheckCircle, Circle, Clock } from 'lucide-react';
import { formatDate } from '../context/IPODataContext';

const STATUS_ICONS = { completed: CheckCircle, active: Clock, upcoming: Circle };
const STATUS_COLORS = { completed: 'var(--green)', active: 'var(--amber)', upcoming: 'var(--text-muted)' };

export default function Timeline({ ipo }) {
  if (!ipo.timeline?.length) {
    return (
      <section className="ipo-section-block" id="timeline">
        <div className="section-label-tag">20</div>
        <h2 className="section-title">IPO Timeline</h2>
        <p className="section-subtitle">Timeline isn't available — the open date for this IPO hasn't been disclosed yet.</p>
      </section>
    );
  }
  return (
    <section className="ipo-section-block" id="timeline">
      <div className="section-label-tag">20</div>
      <h2 className="section-title">IPO Timeline</h2>
      <div className="timeline-container">
        {ipo.timeline.map((event, i) => {
          const Icon = STATUS_ICONS[event.status];
          const color = STATUS_COLORS[event.status];
          return (
            <div key={i} className={`timeline-item ${event.status}`}>
              <div className="timeline-line">
                <div className="timeline-dot" style={{ color, borderColor: color }}>
                  <Icon size={16} />
                </div>
                {i < ipo.timeline.length - 1 && <div className="timeline-connector" />}
              </div>
              <div className="timeline-content">
                <h4 style={{ color: event.status === 'upcoming' ? 'var(--text-muted)' : 'var(--text-primary)' }}>{event.event}</h4>
                <span className="timeline-date">{formatDate(event.date)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
