import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, TrendingUp, BarChart3, Zap, Shield, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useIPOData } from '../context/IPODataContext';
import IPOCard from '../components/IPOCard';
import './Home.css';

const TABS = [
  { key: 'all', label: 'All IPOs' },
  { key: 'open', label: 'Open Now', color: 'var(--green)' },
  { key: 'upcoming', label: 'Upcoming', color: 'var(--amber)' },
  { key: 'closed', label: 'Listing Soon', color: 'var(--cyan)' },
  { key: 'listed', label: 'Listed', color: 'var(--purple)' },
  { key: 'sme', label: 'SME', color: 'var(--gold)' },
];

// "sme" isn't a lifecycle status (an SME IPO can be upcoming/open/listed
// too) — it's the separate `isSme` flag, so it needs its own filter.
function matchesTab(ipo, tabKey) {
  if (tabKey === 'all') return true;
  if (tabKey === 'sme') return ipo.isSme;
  return ipo.status === tabKey;
}

export default function Home() {
  const [params, setParams] = useSearchParams();
  const activeTab = params.get('tab') || 'all';
  const [search, setSearch] = useState('');
  const { ipos: allIPOs, isLive, backendUnavailable, loading, lastFetched, refreshData } = useIPOData();

  const filtered = useMemo(() => {
    let list = allIPOs.filter(i => matchesTab(i, activeTab));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i => i.name.toLowerCase().includes(q) || i.industry.toLowerCase().includes(q));
    }
    return list;
  }, [activeTab, search, allIPOs]);

  const stats = [
    { icon: <BarChart3 size={20} />, value: allIPOs.length, label: 'IPOs Tracked' },
    { icon: <TrendingUp size={20} />, value: `₹${(allIPOs.reduce((s, i) => s + (i.issueSizeNum || 0), 0) / 100).toFixed(0)}K Cr`, label: 'Total Issue Size' },
    { icon: <Zap size={20} />, value: (allIPOs.reduce((s, i) => s + (i.vittaScore?.overall || 0), 0) / (allIPOs.length || 1)).toFixed(1), label: 'Avg Vitta Score' },
  ];

  return (
    <div className="home-page">
      <section className="hero-section" id="hero-section">
        <div className="hero-bg">
          <div className="hero-orb orb-1" />
          <div className="hero-orb orb-2" />
          <div className="hero-orb orb-3" />
        </div>
        <div className="container hero-content">
          <div className="hero-badge animate-fade-in">
            <Zap size={14} /> AI-Powered IPO Research
          </div>
          <h1 className="hero-title animate-fade-in">
            Understand any IPO<br />
            <span className="gradient-text">in 5 minutes</span>
          </h1>
          <p className="hero-subtitle animate-fade-in">
            Stop reading 500-page DRHPs. Get AI-powered visual analysis, financial dashboards,
            risk assessment, and Vitta Score for every Indian IPO.
          </p>
          <div className="hero-search animate-fade-in">
            <Search size={20} />
            <input type="text" placeholder="Search IPO by company or industry..." value={search}
              onChange={e => setSearch(e.target.value)} id="hero-search" />
          </div>
          <div className="hero-features animate-fade-in">
            {['AI DRHP Analysis', 'Visual Financials', 'Risk Heatmap', 'Vitta Score', 'Chat with DRHP'].map(f => (
              <span key={f} className="hero-feature"><Shield size={12} /> {f}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="container ipo-section">
        {/* Live data indicator */}
        <div className="live-indicator">
          <div className={`live-status ${isLive ? 'live' : 'offline'}`}>
            {isLive ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span>{isLive ? 'Live Data' : backendUnavailable ? 'Sample Data — backend unavailable' : 'Sample Data'}</span>
            {isLive && lastFetched && (
              <span className="last-updated">
                Updated {lastFetched.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <button className="refresh-btn" onClick={refreshData} disabled={loading} title="Refresh IPO data">
            <RefreshCw size={14} className={loading ? 'spinning' : ''} />
          </button>
        </div>
        {backendUnavailable && (
          <p className="backend-warning">
            Couldn't reach the Vitta IPO backend, so you're seeing 2 sample IPOs instead of live data.
            Make sure <code>npm run server</code> is running alongside the app.
          </p>
        )}

        <div className="stats-bar stagger-children">
          {stats.map(s => (
            <div key={s.label} className="stat-card glass-card">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="tab-bar">
          {TABS.map(tab => (
            <button key={tab.key}
              className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setParams(tab.key === 'all' ? {} : { tab: tab.key })}
              style={activeTab === tab.key && tab.color ? { '--tab-color': tab.color } : {}}
              id={`tab-${tab.key}`}>
              {tab.label}
              {tab.key !== 'all' && (
                <span className="tab-count">{allIPOs.filter(i => matchesTab(i, tab.key)).length}</span>
              )}
            </button>
          ))}
        </div>

        <div className="ipo-grid stagger-children">
          {loading && allIPOs.length === 0 ? (
            <div className="empty-state">
              <RefreshCw size={48} className="spinning" />
              <h3>Loading live IPO data...</h3>
              <p>Fetching the latest IPOs from the market</p>
            </div>
          ) : filtered.length > 0 ? filtered.map(ipo => (
            <IPOCard key={ipo.id} ipo={ipo} />
          )) : (
            <div className="empty-state">
              <BarChart3 size={48} />
              <h3>No IPOs found</h3>
              <p>{search ? 'Try a different search term' : 'No IPOs in this category yet'}</p>
            </div>
          )}
        </div>
      </section>

      <section className="container how-it-works">
        <h2>How <span className="gradient-text">Vitta IPO</span> Works</h2>
        <div className="steps-grid stagger-children">
          {[
            { num: '01', title: 'Pick an IPO', desc: 'Browse upcoming, open, or listed IPOs with Vitta Score and GMP data.' },
            { num: '02', title: 'Read AI Analysis', desc: '20 visual sections covering business, financials, risks, strengths, and valuation.' },
            { num: '03', title: 'Make Informed Decisions', desc: 'Chat with the DRHP, compare IPOs, and access AI-powered insights.' },
          ].map(step => (
            <div key={step.num} className="step-card glass-card">
              <span className="step-num">{step.num}</span>
              <h4>{step.title}</h4>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
