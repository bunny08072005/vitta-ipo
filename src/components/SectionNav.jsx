import { useState, useEffect } from 'react';
import { Building2, UploadCloud, BookOpen, Network, PieChart, Globe2, BarChart3, TrendingUp, Users, CircleDollarSign, Factory, Swords, AlertTriangle, CheckCircle2, Wallet, Scale, Activity, BarChart, Brain, Star, MessageCircle, Clock } from 'lucide-react';

const SECTIONS = [
  { id: 'snapshot', label: 'Snapshot', icon: Building2 },
  { id: 'upload-rhp', label: 'Upload RHP', icon: UploadCloud },
  { id: 'what-it-does', label: 'Business', icon: BookOpen },
  { id: 'business-model', label: 'Model', icon: Network },
  { id: 'revenue', label: 'Revenue', icon: PieChart },
  { id: 'geography', label: 'Geography', icon: Globe2 },
  { id: 'financials', label: 'Financials', icon: BarChart3 },
  { id: 'growth', label: 'Growth', icon: TrendingUp },
  { id: 'promoters', label: 'Promoters', icon: Users },
  { id: 'shareholding', label: 'Holding', icon: CircleDollarSign },
  { id: 'industry', label: 'Industry', icon: Factory },
  { id: 'competitors', label: 'Peers', icon: Swords },
  { id: 'risks', label: 'Risks', icon: AlertTriangle },
  { id: 'strengths', label: 'Strengths', icon: CheckCircle2 },
  { id: 'proceeds', label: 'Proceeds', icon: Wallet },
  { id: 'valuation', label: 'Valuation', icon: Scale },
  { id: 'gmp', label: 'GMP', icon: Activity },
  { id: 'subscription', label: 'Subscription', icon: BarChart },
  { id: 'ai-summary', label: 'AI Summary', icon: Brain },
  { id: 'vitta-score', label: 'Score', icon: Star },
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'timeline', label: 'Timeline', icon: Clock },
];

export default function SectionNav() {
  const [active, setActive] = useState('snapshot');

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-30% 0px -60% 0px' });

    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <aside className="section-nav">
      <div className="section-nav-inner">
        {SECTIONS.map(s => (
          <button key={s.id}
            className={`section-nav-item ${active === s.id ? 'active' : ''}`}
            onClick={() => scrollTo(s.id)}>
            <s.icon size={15} />
            <span>{s.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
