import React from 'react';
import { Card } from '../ui/Card';
import { SoilHealthScoreResult, SensorParameterDetail } from '../../data/types';
import { Info, Sparkles } from 'lucide-react';

interface SoilHealthScoreCardProps {
  scoreData: SoilHealthScoreResult;
  parameters: SensorParameterDetail[];
}

export const SoilHealthScoreCard: React.FC<SoilHealthScoreCardProps> = ({ scoreData, parameters }) => {
  // Circular gauge calculations
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scoreData.estimatedScore / 100) * circumference;

  return (
    <Card glow>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
        {/* Left: Score Gauge Visualization */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
          <div style={{ position: 'relative', width: '150px', height: '150px', flexShrink: 0 }}>
            <svg width="150" height="150" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background Track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="14"
                fill="transparent"
              />
              {/* Animated Progress Track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={scoreData.color}
                strokeWidth="14"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>

            {/* Score Text in Center */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
                {scoreData.estimatedScore}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                / 100 Score
              </span>
            </div>
          </div>

          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                color: 'var(--accent-gold)',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '0.5rem',
              }}
            >
              <Sparkles size={12} /> Estimated Soil Quality Index
            </div>

            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, color: scoreData.color, marginBottom: '0.25rem' }}>
              {scoreData.rating} Condition
            </h3>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '300px' }}>
              Calculated composite index balancing moisture retention, soil pH reaction, and NPK nutrient bio-availability.
            </p>
          </div>
        </div>

        {/* Right: Parameter Breakdown Grid */}
        <div
          style={{
            padding: '1.25rem',
            backgroundColor: '#faf6ee',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--border-glass)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#855810' }}>
              Sub-Index Contribution Breakdown
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>6 Parameters Polled</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.6rem' }}>
            {parameters.map((p) => {
              const subScore = scoreData.parameterScores[p.id] || 80;
              const isWarning = p.status !== 'optimal' && p.status !== 'normal';

              return (
                <div
                  key={p.id}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: '#ffffff',
                    border: isWarning ? '1.5px solid #d4af37' : '1.5px solid var(--border-subtle)',
                    boxShadow: '0 1px 4px rgba(212, 175, 55, 0.08)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>{p.name}</span>
                    <span style={{ fontWeight: 700, color: isWarning ? '#fbbf24' : '#34d399' }}>{subScore}%</span>
                  </div>
                  <div style={{ height: '4px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', marginTop: '0.3rem', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${subScore}%`,
                        backgroundColor: isWarning ? '#fbbf24' : '#10b981',
                        borderRadius: '2px',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mandatory Agronomic Disclaimer Notice */}
      <div
        style={{
          marginTop: '1.5rem',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'rgba(14, 165, 233, 0.08)',
          border: '1px solid rgba(14, 165, 233, 0.25)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          fontSize: '0.825rem',
          color: '#bae6fd',
          lineHeight: '1.5',
        }}
      >
        <Info size={18} style={{ flexShrink: 0, marginTop: '0.1rem', color: '#38bdf8' }} />
        <span>
          <strong>Agronomic Disclaimer:</strong> {scoreData.disclaimer}
        </span>
      </div>
    </Card>
  );
};
