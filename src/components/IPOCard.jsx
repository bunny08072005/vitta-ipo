import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, IndianRupee, TrendingUp, TrendingDown } from 'lucide-react';
import { getStatusBadgeClass, getStatusLabel, formatDate } from '../context/IPODataContext';
import ScoreGauge from './ScoreGauge';
import CompanyLogo from './CompanyLogo';

const OPEN_DATE_LABEL = { upcoming: 'Opens', closed: 'Listing', listed: 'Listed' };

export default function IPOCard({ ipo }) {
  const isListed = ipo.status === 'listed';
  const hasGain = isListed && ipo.listingGain != null;
  const isGain = hasGain && ipo.listingGain >= 0;

  return (
    <Link to={`/ipo/${ipo.id}`} className="glass-card ipo-card" id={`ipo-card-${ipo.id}`}>
      <div className="ipo-card-header">
        <CompanyLogo ipo={ipo} size={44} className="ipo-card-logo" />
        <div className="ipo-card-title">
          <h3>{ipo.name}</h3>
          <span className="ipo-card-industry">{ipo.industry}</span>
        </div>
        <div className="ipo-card-badges">
          <span className={`badge ${getStatusBadgeClass(ipo.status)}`}>{getStatusLabel(ipo.status)}</span>
          {ipo.isSme && <span className="badge badge-sme">SME</span>}
        </div>
      </div>
      <div className="ipo-card-details">
        {isListed ? (
          <>
            <div className="ipo-detail">
              <IndianRupee size={14} />
              <span className="detail-label">Listed Price</span>
              <span className="detail-value">{ipo.listingPrice != null ? `₹${ipo.listingPrice}` : 'Not disclosed'}</span>
            </div>
            <div className="ipo-detail">
              {isGain ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span className="detail-label">Listing Gain/Loss</span>
              <span className="detail-value" style={{ color: hasGain ? (isGain ? 'var(--green)' : 'var(--red)') : undefined }}>
                {hasGain ? `${isGain ? '+' : ''}${ipo.listingGain}%` : 'Not disclosed'}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="ipo-detail">
              <IndianRupee size={14} />
              <span className="detail-label">Issue Size</span>
              <span className="detail-value">{ipo.issueSize || 'Not disclosed'}</span>
            </div>
            <div className="ipo-detail">
              <TrendingUp size={14} />
              <span className="detail-label">Price Band</span>
              <span className="detail-value">{ipo.priceBand?.high ? `₹${ipo.priceBand.low} – ₹${ipo.priceBand.high}` : 'Not disclosed'}</span>
            </div>
          </>
        )}
        <div className="ipo-detail">
          <Calendar size={14} />
          <span className="detail-label">{OPEN_DATE_LABEL[ipo.status] || 'Opened'}</span>
          <span className="detail-value">{formatDate(isListed ? ipo.listingDate : ipo.openDate)}</span>
        </div>
      </div>
      <div className="ipo-card-bottom">
        {isListed ? (
          <div className="ipo-card-industry-tag">{ipo.listingExchange}</div>
        ) : (
          <div className="ipo-card-score">
            <ScoreGauge score={ipo.vittaScore?.overall} size={48} />
            <div>
              <span className="score-label">Vitta Score</span>
              <span className="score-val">{ipo.vittaScore?.overall ?? '—'}/10</span>
            </div>
          </div>
        )}
        <div className="ipo-card-cta">
          Read Analysis <ArrowRight size={16} />
        </div>
      </div>
      {!isListed && ipo.gmp?.current > 0 && (
        <div className="ipo-card-gmp">
          GMP: <strong>+₹{ipo.gmp.current}</strong> ({ipo.gmp.percentage || 0}%)
        </div>
      )}
    </Link>
  );
}
