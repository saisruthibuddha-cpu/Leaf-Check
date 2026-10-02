import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { SensorParameterDetail } from '../../data/types';
import { Droplets, Thermometer, FlaskConical, Sprout, Layers, Zap, AlertTriangle } from 'lucide-react';

interface SoilSensorCardProps {
  param: SensorParameterDetail;
  isSelected?: boolean;
  onSelect?: (id: SensorParameterDetail['id']) => void;
}

export const SoilSensorCard: React.FC<SoilSensorCardProps> = ({ param, isSelected = false, onSelect }) => {
  const isWarning = param.status !== 'optimal' && param.status !== 'normal';

  const getIcon = () => {
    switch (param.id) {
      case 'moisture':
        return <Droplets size={22} color="#0ea5e9" />;
      case 'temperature':
        return <Thermometer size={22} color="#f59e0b" />;
      case 'ph':
        return <FlaskConical size={22} color="#10b981" />;
      case 'nitrogen':
        return <Sprout size={22} color="#34d399" />;
      case 'phosphorus':
        return <Layers size={22} color="#fbbf24" />;
      case 'potassium':
        return <Zap size={22} color="#a855f7" />;
      default:
        return <Sprout size={22} color="#10b981" />;
    }
  };

  // Calculate percentage positions on the meter bar
  const totalSpan = param.maxScale - param.minScale;
  const currentPosPct = Math.min(100, Math.max(0, ((param.value - param.minScale) / totalSpan) * 100));
  const healthyStartPct = Math.min(100, Math.max(0, ((param.minHealthy - param.minScale) / totalSpan) * 100));
  const healthyEndPct = Math.min(100, Math.max(0, ((param.maxHealthy - param.minScale) / totalSpan) * 100));
  const healthyWidthPct = healthyEndPct - healthyStartPct;

  return (
    <div
      onClick={() => onSelect && onSelect(param.id)}
      style={{
        cursor: onSelect ? 'pointer' : 'default',
        transform: isSelected ? 'scale(1.02)' : 'none',
        transition: 'all 0.25s ease',
      }}
    >
      <Card
        className={`sensor-card ${isWarning ? 'warning-glow' : ''}`}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: isSelected ? '1px solid var(--emerald-400)' : '1px solid var(--border-subtle)',
              }}
            >
              {getIcon()}
            </div>
            <div>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {param.name}
              </span>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Target: {param.healthyRangeText}
              </span>
            </div>
          </div>
        }
        action={
          <Badge variant={param.status}>
            {param.statusLabel}
          </Badge>
        }
      >
        <div style={{ marginTop: '0.6rem' }}>
          {/* Main Reading Value Display */}
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
              <span
                style={{
                  fontSize: '2.2rem',
                  fontWeight: 800,
                  color: isWarning ? '#fbbf24' : '#ffffff',
                  letterSpacing: '-0.02em',
                }}
              >
                {param.value}
              </span>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {param.unit}
              </span>
            </div>

            {isWarning && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.75rem',
                  color: '#fbbf24',
                  fontWeight: 600,
                }}
              >
                <AlertTriangle size={14} /> Attention Needed
              </div>
            )}
          </div>

          {/* Graphical Threshold Meter Bar */}
          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
              <span>Min ({param.minScale} {param.unit})</span>
              <span style={{ color: 'var(--emerald-400)', fontWeight: 600 }}>Healthy Zone ({param.minHealthy} - {param.maxHealthy})</span>
              <span>Max ({param.maxScale} {param.unit})</span>
            </div>

            {/* Meter Bar Container */}
            <div
              style={{
                position: 'relative',
                height: '10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                overflow: 'visible',
              }}
            >
              {/* Healthy Zone Highlight */}
              <div
                style={{
                  position: 'absolute',
                  left: `${healthyStartPct}%`,
                  width: `${healthyWidthPct}%`,
                  height: '100%',
                  backgroundColor: 'rgba(16, 185, 129, 0.35)',
                  borderLeft: '1px solid #10b981',
                  borderRight: '1px solid #10b981',
                }}
              />

              {/* Current Value Marker Pointer */}
              <div
                style={{
                  position: 'absolute',
                  left: `${currentPosPct}%`,
                  top: '-4px',
                  width: '6px',
                  height: '18px',
                  borderRadius: '2px',
                  backgroundColor: isWarning ? '#fbbf24' : '#ffffff',
                  boxShadow: isWarning ? '0 0 8px #fbbf24' : '0 0 8px #10b981',
                  transform: 'translateX(-50%)',
                  zIndex: 2,
                  transition: 'left 0.4s ease',
                }}
              />
            </div>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.85rem', lineHeight: '1.4' }}>
            {param.description}
          </p>
        </div>
      </Card>
    </div>
  );
};
