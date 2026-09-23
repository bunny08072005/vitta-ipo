export default function ScoreGauge({ score, size = 56 }) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const known = score !== null && score !== undefined;
  const pct = known ? score / 10 : 0;
  const offset = circumference * (1 - pct);
  const color = !known ? 'var(--text-muted)' : score >= 8 ? 'var(--green)' : score >= 6 ? 'var(--amber)' : 'var(--red)';

  return (
    <svg width={size} height={size} className="score-gauge" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--border-color)" strokeWidth="4" />
      {known && (
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s var(--ease-out)' }} />
      )}
    </svg>
  );
}
