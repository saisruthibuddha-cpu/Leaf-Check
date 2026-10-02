import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { MockSoilMetric } from '../../data/mockData';
import { Droplets, Thermometer, FlaskConical, Sprout } from 'lucide-react';

interface MetricCardProps {
  metric: MockSoilMetric;
}

export const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  const getIcon = () => {
    switch (metric.id) {
      case 'moisture':
        return <Droplets size={22} color="#0ea5e9" />;
      case 'temperature':
        return <Thermometer size={22} color="#f59e0b" />;
      case 'ph':
        return <FlaskConical size={22} color="#10b981" />;
      default:
        return <Sprout size={22} color="#84cc16" />;
    }
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {getIcon()}
          </div>
          <div>
            <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {metric.name}
            </span>
            <span
              style={{
                display: 'block',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}
            >
              Optimal: {metric.optimalRange}
            </span>
          </div>
        </div>
      }
      action={<Badge variant={metric.status}>{metric.status}</Badge>}
    >
      <div style={{ marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
          <span style={{ fontSize: '2rem', fontWeight: 700, color: '#ffffff' }}>
            {metric.value}
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {metric.unit}
          </span>
        </div>

        <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          {metric.description}
        </p>

        {/* Visual Progress Bar / Scale */}
        <div
          style={{
            marginTop: '1rem',
            height: '6px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.min(Math.max((metric.value / (metric.id === 'ph' ? 14 : metric.id === 'temperature' ? 50 : 250)) * 100, 15), 100)}%`,
              background:
                metric.status === 'healthy'
                  ? 'linear-gradient(90deg, #10b981, #34d399)'
                  : metric.status === 'warning'
                  ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                  : 'linear-gradient(90deg, #f43f5e, #f87171)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>
    </Card>
  );
};
