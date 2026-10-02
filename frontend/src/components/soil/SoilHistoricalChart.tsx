import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { SensorParameterDetail } from '../../data/types';
import { LineChart, Calendar, Clock, Waves } from 'lucide-react';

interface SoilHistoricalChartProps {
  parameters: SensorParameterDetail[];
  selectedParamId: SensorParameterDetail['id'];
  onSelectParam: (id: SensorParameterDetail['id']) => void;
}

export const SoilHistoricalChart: React.FC<SoilHistoricalChartProps> = ({
  parameters,
  selectedParamId,
  onSelectParam,
}) => {
  const [timeframe, setTimeframe] = useState<'24h' | '7d'>('24h');

  const currentParam = parameters.find((p) => p.id === selectedParamId) || parameters[0];
  const dataset = timeframe === '24h' ? currentParam.historical24h : currentParam.historical7d;

  // Chart dimensions
  const width = 680;
  const height = 220;
  const padding = { top: 20, right: 30, bottom: 35, left: 55 };

  const values = dataset.map((d) => d.value);
  const minVal = Math.min(...values, currentParam.minScale);
  const maxVal = Math.max(...values, currentParam.maxScale);
  const valRange = maxVal - minVal || 1;

  // Coordinates calculation
  const getX = (index: number) => {
    return padding.left + (index / (dataset.length - 1)) * (width - padding.left - padding.right);
  };

  const getY = (val: number) => {
    return padding.top + (1 - (val - minVal) / valRange) * (height - padding.top - padding.bottom);
  };

  const pointsString = dataset.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');

  // Healthy zone reference polygon
  const healthyTopY = getY(Math.min(maxVal, currentParam.maxHealthy));
  const healthyBottomY = getY(Math.max(minVal, currentParam.minHealthy));

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <LineChart size={22} color="var(--emerald-400)" />
          <span>Historical Sensor Telemetry ({currentParam.name})</span>
        </div>
      }
      subtitle={`Viewing recorded trend for ${currentParam.name}. Target healthy range: ${currentParam.healthyRangeText}`}
      action={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Timeframe Toggle */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.2rem',
              border: '1px solid var(--border-glass)',
            }}
          >
            <button
              type="button"
              onClick={() => setTimeframe('24h')}
              style={{
                padding: '0.3rem 0.65rem',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: timeframe === '24h' ? 'rgba(52, 211, 153, 0.2)' : 'transparent',
                color: timeframe === '24h' ? 'var(--emerald-300)' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              <Clock size={12} style={{ display: 'inline', marginRight: '3px' }} /> 24 Hours
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('7d')}
              style={{
                padding: '0.3rem 0.65rem',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: timeframe === '7d' ? 'rgba(52, 211, 153, 0.2)' : 'transparent',
                color: timeframe === '7d' ? 'var(--emerald-300)' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              <Calendar size={12} style={{ display: 'inline', marginRight: '3px' }} /> 7 Days
            </button>
          </div>
        </div>
      }
    >
      {/* Sensor Switcher Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {parameters.map((p) => {
          const isActive = p.id === currentParam.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectParam(p.id)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                border: isActive ? '1px solid var(--emerald-400)' : '1px solid var(--border-glass)',
                backgroundColor: isActive ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                color: isActive ? 'var(--emerald-300)' : 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {p.name} ({p.value} {p.unit})
            </button>
          );
        })}
      </div>

      {/* SVG Chart Surface */}
      <div
        style={{
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-sm)',
          padding: '1rem 0.5rem',
          border: '1.5px solid var(--border-glass)',
          boxShadow: '0 2px 10px rgba(212, 175, 55, 0.08)',
          overflowX: 'auto',
        }}
      >
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '240px', overflow: 'visible' }}>
          {/* Healthy Target Zone Shaded Band */}
          <rect
            x={padding.left}
            y={Math.min(healthyTopY, healthyBottomY)}
            width={width - padding.left - padding.right}
            height={Math.abs(healthyBottomY - healthyTopY)}
            fill="rgba(16, 185, 129, 0.08)"
            stroke="rgba(16, 185, 129, 0.2)"
            strokeDasharray="4 4"
          />

          {/* Reference Line Label for Target Band */}
          <text
            x={width - padding.right}
            y={Math.min(healthyTopY, healthyBottomY) - 5}
            fill="#34d399"
            fontSize="10"
            textAnchor="end"
            fontWeight="600"
          >
            Healthy Target Range ({currentParam.minHealthy} - {currentParam.maxHealthy} {currentParam.unit})
          </text>

          {/* Grid lines & Y-Axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding.top + ratio * (height - padding.top - padding.bottom);
            const val = Math.round(maxVal - ratio * valRange);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeDasharray="2 2"
                />
                <text x={padding.left - 10} y={y + 3} fill="var(--text-muted)" fontSize="10" textAnchor="end">
                  {val}
                </text>
              </g>
            );
          })}

          {/* Connected Data Line */}
          <polyline
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={pointsString}
          />

          {/* Gradient area under line */}
          <polygon
            points={`${getX(0)},${height - padding.bottom} ${pointsString} ${getX(dataset.length - 1)},${
              height - padding.bottom
            }`}
            fill="rgba(16, 185, 129, 0.12)"
          />

          {/* Data Points and X-Axis Labels */}
          {dataset.map((d, idx) => {
            const cx = getX(idx);
            const cy = getY(d.value);

            return (
              <g key={idx}>
                <circle cx={cx} cy={cy} r="4" fill="#ffffff" stroke="#10b981" strokeWidth="2.5" />
                <text
                  x={cx}
                  y={height - padding.bottom + 18}
                  fill="var(--text-muted)"
                  fontSize="11"
                  textAnchor="middle"
                >
                  {d.time}
                </text>
                <text
                  x={cx}
                  y={cy - 9}
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {d.value}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.85rem', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Waves size={14} color="#10b981" /> Shaded green region denotes agronomically optimal boundary.
        </span>
        <span>Polling Source: ESP32 IoT RS485 Modbus & ADC Buses (Simulated)</span>
      </div>
    </Card>
  );
};
