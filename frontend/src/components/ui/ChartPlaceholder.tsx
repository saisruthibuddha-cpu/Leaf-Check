import React from 'react';

interface ChartPlaceholderProps {
  title: string;
  data: number[];
  unit: string;
  color?: string;
}

export const ChartPlaceholder: React.FC<ChartPlaceholderProps> = ({
  title,
  data,
  unit,
  color = '#10b981',
}) => {
  const maxVal = Math.max(...data) * 1.1;
  const minVal = Math.min(...data) * 0.9;
  const range = maxVal - minVal || 1;
  const height = 120;
  const width = 300;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - minVal) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div style={{ marginTop: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          7-Day Telemetry Trend ({title})
        </span>
        <span className="mock-banner">Mock Sensor Trend</span>
      </div>

      <div
        style={{
          background: '#ffffff',
          padding: '1rem',
          borderRadius: 'var(--radius-sm)',
          border: '1.5px solid var(--border-glass)',
          boxShadow: '0 2px 8px rgba(212, 175, 55, 0.08)',
        }}
      >
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100px', overflow: 'visible' }}>
          {/* SVG Line Graph */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
          {/* Data Nodes */}
          {data.map((val, idx) => {
            const x = (idx / (data.length - 1)) * width;
            const y = height - ((val - minVal) / range) * height;
            return (
              <circle
                key={idx}
                cx={x}
                cy={y}
                r="4"
                fill="#ffffff"
                stroke={color}
                strokeWidth="2"
              />
            );
          })}
        </svg>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>Day 1</span>
          <span>Day 3</span>
          <span>Day 5</span>
          <span>Today ({data[data.length - 1]} {unit})</span>
        </div>
      </div>
    </div>
  );
};
