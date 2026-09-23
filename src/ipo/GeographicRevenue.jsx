import India from '@react-map/india';
import WorldMap, { regions } from 'react-svg-worldmap';
import { MapPin } from 'lucide-react';
import AIStateNotice from '../components/AIStateNotice';

const COUNTRY_NAMES = Object.fromEntries(regions.map(r => [r.code.toLowerCase(), r.name]));

// Light-to-dark interpolation on the brand green, scaled to the data's own
// max so the highest-revenue region is always the most saturated.
function colorFor(pct, maxPct) {
  const t = maxPct > 0 ? Math.min(pct / maxPct, 1) : 0;
  const lightness = 88 - t * 55; // 88% (near white) down to 33% (deep green)
  return `hsl(146, 45%, ${lightness}%)`;
}

export default function GeographicRevenue({ ipo, aiState }) {
  const geo = ipo.geographicRevenue;

  if (!geo?.breakdown?.length) {
    return (
      <section className="ipo-section-block" id="geography">
        <div className="section-label-tag">21</div>
        <h2 className="section-title">Revenue by Geography</h2>
        <AIStateNotice aiState={aiState} />
        {!aiState?.loading && !aiState?.error && (
          <p className="section-subtitle">A state-wise or country-wise revenue breakdown wasn't disclosed in the available filings for this company.</p>
        )}
      </section>
    );
  }

  const maxPct = Math.max(...geo.breakdown.map(b => b.percentage));
  const sorted = [...geo.breakdown].sort((a, b) => b.percentage - a.percentage);

  return (
    <section className="ipo-section-block" id="geography">
      <div className="section-label-tag">21</div>
      <h2 className="section-title">Revenue by Geography</h2>
      <p className="section-subtitle">
        {geo.scope === 'india-states' ? 'Share of revenue by Indian state, as disclosed in the filing' : 'Share of revenue by country, as disclosed in the filing'}
      </p>
      <div className="geo-layout glass-card">
        <div className="geo-map-wrap">
          {geo.scope === 'india-states' ? (
            <India
              type="select-single"
              size={420}
              mapColor="var(--glass)"
              strokeColor="var(--border-color)"
              hoverColor="var(--gold)"
              hints
              disableClick
              cityColors={Object.fromEntries(geo.breakdown.map(b => [b.region, colorFor(b.percentage, maxPct)]))}
            />
          ) : (
            <WorldMap
              size="responsive"
              color="#1B6B3A"
              backgroundColor="transparent"
              borderColor="var(--border-color)"
              tooltipBgColor="#0a0c0b"
              tooltipTextColor="#e8ede9"
              valueSuffix="%"
              data={geo.breakdown.map(b => ({ country: b.region, value: b.percentage }))}
            />
          )}
        </div>
        <div className="geo-legend">
          {sorted.map(b => (
            <div key={b.region} className="geo-legend-item">
              <MapPin size={14} />
              <span className="geo-legend-label">{geo.scope === 'world-countries' ? (COUNTRY_NAMES[b.region.toLowerCase()] || b.region.toUpperCase()) : b.region}</span>
              <span className="geo-legend-pct">{b.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
