import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Wifi, Loader2 } from 'lucide-react';
import { useIPOData, getStatusBadgeClass, getStatusLabel, formatDate } from '../context/IPODataContext';
import { fetchIPOAnalysis } from '../services/ipoApi';
import SectionNav from '../components/SectionNav';
import CompanyLogo from '../components/CompanyLogo';
import CompanySnapshot from '../ipo/CompanySnapshot';
import UploadRHP from '../ipo/UploadRHP';
import WhatDoesItDo from '../ipo/WhatDoesItDo';
import BusinessModel from '../ipo/BusinessModel';
import RevenueBreakdown from '../ipo/RevenueBreakdown';
import GeographicRevenue from '../ipo/GeographicRevenue';
import FinancialHighlights from '../ipo/FinancialHighlights';
import GrowthTrend from '../ipo/GrowthTrend';
import Promoters from '../ipo/Promoters';
import Shareholding from '../ipo/Shareholding';
import IndustryAnalysis from '../ipo/IndustryAnalysis';
import Competitors from '../ipo/Competitors';
import Risks from '../ipo/Risks';
import Strengths from '../ipo/Strengths';
import UseOfProceeds from '../ipo/UseOfProceeds';
import Valuation from '../ipo/Valuation';
import GMP from '../ipo/GMP';
import SubscriptionStatus from '../ipo/SubscriptionStatus';
import AISummary from '../ipo/AISummary';
import VittaScore from '../ipo/VittaScore';
import ChatWithDRHP from '../ipo/ChatWithDRHP';
import Timeline from '../ipo/Timeline';
import './IPOAnalysis.css';

export default function IPOAnalysis() {
  const { slug } = useParams();
  const { getIPOBySlug, loading: dataLoading } = useIPOData();
  const baseIpo = getIPOBySlug(slug);

  const needsAnalysis = !!baseIpo && !baseIpo.businessDescription;
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(needsAnalysis);
  const [analysisError, setAnalysisError] = useState(null);

  useEffect(() => {
    if (!baseIpo || baseIpo.businessDescription) return;

    let cancelled = false;
    setAnalysisLoading(true);
    setAnalysisError(null);
    fetchIPOAnalysis(baseIpo.id)
      .then(result => { if (!cancelled) setAnalysis(result); })
      .catch(err => { if (!cancelled) setAnalysisError(err.message || 'AI analysis unavailable'); })
      .finally(() => { if (!cancelled) setAnalysisLoading(false); });

    return () => { cancelled = true; };
  }, [baseIpo?.id]);

  if (!baseIpo) {
    if (dataLoading) return (
      <div className="not-found container">
        <Loader2 size={32} className="spinning" />
        <p style={{ marginTop: 16 }}>Loading IPO data…</p>
      </div>
    );
    return (
      <div className="not-found container">
        <h2>IPO Not Found</h2>
        <p>The IPO you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary">← Back to Home</Link>
      </div>
    );
  }

  const ipo = analysis ? { ...baseIpo, ...analysis } : baseIpo;
  const aiState = { loading: analysisLoading, error: analysisError };

  const handleUploadedAnalysis = (result) => {
    setAnalysis(result);
    setAnalysisError(null);
    setAnalysisLoading(false);
  };

  return (
    <div className="analysis-page">
      <div className="analysis-header">
        <div className="container">
          <div className="analysis-top-bar">
            <Link to="/" className="back-link"><ArrowLeft size={18} /> All IPOs</Link>
            {ipo._isLive && (
              <span className="live-badge-sm"><Wifi size={12} /> Live</span>
            )}
          </div>
          <div className="analysis-hero">
            <CompanyLogo ipo={ipo} size={64} className="analysis-logo" />
            <div className="analysis-hero-info">
              <div className="analysis-hero-top">
                <h1>{ipo.name}</h1>
                <span className={`badge ${getStatusBadgeClass(ipo.status)}`}>{getStatusLabel(ipo.status)}</span>
              </div>
              <p className="analysis-meta">
                {ipo.status === 'listed' ? (
                  <>
                    {ipo.industry} · Listed {formatDate(ipo.listingDate)} · {ipo.listingPrice != null ? `₹${ipo.listingPrice}` : 'Listing price not disclosed'}
                    {ipo.listingGain != null && (
                      <span style={{ color: ipo.listingGain >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                        {' '}({ipo.listingGain >= 0 ? '+' : ''}{ipo.listingGain}%)
                      </span>
                    )}
                  </>
                ) : (
                  <>{ipo.industry} · {ipo.issueSize || 'Issue size not disclosed'} · {ipo.priceBand?.high ? `₹${ipo.priceBand.low}–₹${ipo.priceBand.high}` : 'Price band not disclosed'} · {formatDate(ipo.openDate)} – {formatDate(ipo.closeDate)}</>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container analysis-layout">
        <SectionNav />
        <div className="analysis-content">
          <CompanySnapshot ipo={ipo} />
          <UploadRHP ipo={ipo} onAnalysisReady={handleUploadedAnalysis} />
          <WhatDoesItDo ipo={ipo} aiState={aiState} />
          <BusinessModel ipo={ipo} aiState={aiState} />
          <RevenueBreakdown ipo={ipo} />
          <GeographicRevenue ipo={ipo} aiState={aiState} />
          <FinancialHighlights ipo={ipo} />
          <GrowthTrend ipo={ipo} />
          <Promoters ipo={ipo} />
          <Shareholding ipo={ipo} />
          <IndustryAnalysis ipo={ipo} />
          <Competitors ipo={ipo} />
          <Risks ipo={ipo} aiState={aiState} />
          <Strengths ipo={ipo} aiState={aiState} />
          <UseOfProceeds ipo={ipo} />
          <Valuation ipo={ipo} />
          <GMP ipo={ipo} />
          <SubscriptionStatus ipo={ipo} />
          <AISummary ipo={ipo} aiState={aiState} />
          {ipo.status !== 'listed' && <VittaScore ipo={ipo} aiState={aiState} />}
          <ChatWithDRHP ipo={ipo} />
          <Timeline ipo={ipo} />
        </div>
      </div>
    </div>
  );
}
