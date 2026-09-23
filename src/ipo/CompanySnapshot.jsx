import { Building2, MapPin, Users, Globe, Calendar, Landmark, BookOpen } from 'lucide-react';
import { formatDate } from '../context/IPODataContext';

const NA = 'Not disclosed';

export default function CompanySnapshot({ ipo }) {
  const isListed = ipo.status === 'listed';

  const items = [
    { icon: Calendar, label: 'Founded', value: ipo.snapshot.founded || NA },
    { icon: Building2, label: 'Sector', value: ipo.industry },
    { icon: Users, label: 'Employees', value: ipo.snapshot.employees ? ipo.snapshot.employees.toLocaleString() : NA },
    { icon: MapPin, label: 'Headquarters', value: ipo.snapshot.headquarters || NA },
    { icon: Globe, label: 'Website', value: ipo.snapshot.website || NA },
    { icon: Landmark, label: 'Registrar', value: ipo.snapshot.registrar || NA },
    { icon: BookOpen, label: 'Face Value', value: ipo.faceValue ? `₹${ipo.faceValue}` : NA },
    { icon: Building2, label: 'Listed On', value: ipo.listingExchange || NA },
  ];

  return (
    <section className="ipo-section-block" id="snapshot">
      <div className="section-label-tag">01</div>
      <h2 className="section-title">Company Snapshot</h2>
      <div className="snapshot-grid">
        {items.map(item => (
          <div key={item.label} className="snapshot-item glass-card">
            <div className="snapshot-icon"><item.icon size={18} /></div>
            <div>
              <span className="snapshot-label">{item.label}</span>
              <span className="snapshot-value">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="issue-details glass-card">
        <h4>{isListed ? 'Listing Performance' : 'Issue Details'}</h4>
        <div className="issue-grid">
          {isListed ? (
            <>
              <div className="issue-item">
                <span className="issue-label">Issue Price</span>
                <span className="issue-val">{ipo.priceBand?.high ? `₹${ipo.priceBand.high}` : NA}</span>
              </div>
              <div className="issue-item">
                <span className="issue-label">Listed Price</span>
                <span className="issue-val">{ipo.listingPrice != null ? `₹${ipo.listingPrice}` : NA}</span>
              </div>
              <div className="issue-item">
                <span className="issue-label">Listing Gain / Loss</span>
                <span className="issue-val" style={{ color: ipo.listingGain != null ? (ipo.listingGain >= 0 ? 'var(--green)' : 'var(--red)') : undefined }}>
                  {ipo.listingGain != null ? `${ipo.listingGain >= 0 ? '+' : ''}${ipo.listingGain}%` : NA}
                </span>
              </div>
              <div className="issue-item">
                <span className="issue-label">Listing Date</span>
                <span className="issue-val">{formatDate(ipo.listingDate)}</span>
              </div>
              <div className="issue-item">
                <span className="issue-label">Lot Size</span>
                <span className="issue-val">{ipo.lotSize ? `${ipo.lotSize} shares` : NA}</span>
              </div>
            </>
          ) : (
            <>
              <div className="issue-item">
                <span className="issue-label">Total Issue Size</span>
                <span className="issue-val">{ipo.issueSize || NA}</span>
              </div>
              <div className="issue-item">
                <span className="issue-label">Fresh Issue</span>
                <span className="issue-val">{ipo.freshIssue != null ? `₹${ipo.freshIssue.toLocaleString()} Cr` : NA}</span>
              </div>
              <div className="issue-item">
                <span className="issue-label">Offer for Sale</span>
                <span className="issue-val">{ipo.ofs != null ? `₹${ipo.ofs.toLocaleString()} Cr` : NA}</span>
              </div>
              <div className="issue-item">
                <span className="issue-label">Price Band</span>
                <span className="issue-val">{ipo.priceBand?.high ? `₹${ipo.priceBand.low} – ₹${ipo.priceBand.high}` : NA}</span>
              </div>
              <div className="issue-item">
                <span className="issue-label">Lot Size</span>
                <span className="issue-val">{ipo.lotSize ? `${ipo.lotSize} shares` : NA}</span>
              </div>
              <div className="issue-item">
                <span className="issue-label">Min Investment</span>
                <span className="issue-val">{ipo.lotSize && ipo.priceBand?.high ? `₹${(ipo.lotSize * ipo.priceBand.high).toLocaleString()}` : NA}</span>
              </div>
            </>
          )}
        </div>
      </div>
      {ipo.snapshot.leadManagers?.length > 0 && (
        <div className="lead-managers glass-card">
          <h4>Lead Managers</h4>
          <div className="lm-list">
            {ipo.snapshot.leadManagers.map(lm => (
              <span key={lm} className="lm-tag">{lm}</span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
