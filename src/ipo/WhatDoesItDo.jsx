import { Lightbulb } from 'lucide-react';
import AIStateNotice from '../components/AIStateNotice';

export default function WhatDoesItDo({ ipo, aiState }) {
  return (
    <section className="ipo-section-block" id="what-it-does">
      <div className="section-label-tag">02</div>
      <h2 className="section-title">What Does This Company Actually Do?</h2>
      <AIStateNotice aiState={aiState} />
      {ipo.businessDescription && (
        <div className="explainer-card glass-card">
          <div className="explainer-header">
            <Lightbulb size={20} />
            <span>Explained like you're 15</span>
          </div>
          <p className="explainer-text">{ipo.businessDescription}</p>
        </div>
      )}
    </section>
  );
}
