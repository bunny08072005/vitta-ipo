import { useState } from 'react';

// Deterministic per-company color so the same company always gets the
// same badge color across renders/sessions, without needing to store one.
const PALETTE = ['#1B6B3A', '#C5A55A', '#06b6d4', '#a855f7', '#f59e0b', '#0891b2', '#7c3aed', '#059669'];

function colorFor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

function initialsFor(name) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/**
 * We don't always have a verified real logo URL for a company — the old
 * code guessed a Clearbit URL from the first word of the name, which was
 * wrong for most companies. Rather than show a wrong logo (or a broken
 * image icon), this renders a real image when we have one and otherwise
 * falls back to a clean colored initials badge, same pattern as
 * Slack/Gmail use for contacts without a photo.
 */
export default function CompanyLogo({ ipo, size = 44, className = '' }) {
  const [failed, setFailed] = useState(false);
  const showImage = ipo.logo && !failed;

  if (showImage) {
    return (
      <img
        src={ipo.logo}
        alt={ipo.name}
        className={className}
        style={{ width: size, height: size, objectFit: 'contain' }}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        width: size, height: size, borderRadius: 'var(--radius-sm)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: colorFor(ipo.name), color: '#fff', fontWeight: 700,
        fontFamily: 'var(--font-heading)', fontSize: size * 0.38, flexShrink: 0,
      }}
      title={ipo.name}
    >
      {initialsFor(ipo.name)}
    </div>
  );
}
