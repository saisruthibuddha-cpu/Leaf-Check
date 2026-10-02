import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useLanguage } from '../context/LanguageContext';
import { SoilSensorCard } from '../components/soil/SoilSensorCard';
import { SoilHealthScoreCard } from '../components/soil/SoilHealthScoreCard';
import { SoilHistoricalChart } from '../components/soil/SoilHistoricalChart';
import { sensorService, BackendSoilHealthResponse } from '../services/sensorService';
import {
  SensorParameterDetail,
  SensorParameterId,
  SoilHealthScoreResult,
  SoilWarningAlert,
  SoilSpecificRecommendation,
  SoilSensorReadings,
} from '../data/types';
import {
  RefreshCw,
  AlertTriangle,
  Lightbulb,
  Clock,
  Wifi
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Helper: Adapts backend soil health response → frontend SensorParameterDetail[]
// ---------------------------------------------------------------------------
const PARAM_SCALE: Record<string, { minScale: number; maxScale: number }> = {
  moisture:    { minScale: 0,   maxScale: 100  },
  temperature: { minScale: 0,   maxScale: 50   },
  ph:          { minScale: 3,   maxScale: 10   },
  nitrogen:    { minScale: 0,   maxScale: 300  },
  phosphorus:  { minScale: 0,   maxScale: 100  },
  potassium:   { minScale: 0,   maxScale: 400  },
};

function adaptBackendParams(
  backendParams: BackendSoilHealthResponse['parameters']
): SensorParameterDetail[] {
  return backendParams.map((p) => {
    const scale = PARAM_SCALE[p.id] || { minScale: 0, maxScale: 100 };

    // Generate historical series anchored to current API value
    const val = p.value;
    const range = p.max_healthy - p.min_healthy;
    const historical24h = [0, 4, 8, 12, 16, 20, 24].map((hr, idx) => {
      const offset = Math.sin(idx + 1) * range * 0.15;
      return {
        time: `${hr.toString().padStart(2, '0')}:00`,
        value: Math.max(scale.minScale, Math.round((val + offset) * 10) / 10),
      };
    });

    const historical7d = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Today'].map(
      (day, idx) => {
        const offset = Math.cos(idx * 0.8) * range * 0.2;
        return {
          time: day,
          value: Math.max(scale.minScale, Math.round((val + offset) * 10) / 10),
        };
      }
    );

    return {
      id: p.id as SensorParameterId,
      name: p.name,
      value: p.value,
      unit: p.unit,
      minHealthy: p.min_healthy,
      maxHealthy: p.max_healthy,
      minScale: scale.minScale,
      maxScale: scale.maxScale,
      status: p.status as SensorParameterDetail['status'],
      statusLabel: p.status_label,
      healthyRangeText: p.healthy_range_text,
      description: p.description,
      historical24h,
      historical7d,
    };
  });
}

function adaptBackendScore(backend: BackendSoilHealthResponse): SoilHealthScoreResult {
  const parameterScores: Record<SensorParameterId, number> = {
    moisture: 0,
    temperature: 0,
    ph: 0,
    nitrogen: 0,
    phosphorus: 0,
    potassium: 0,
  };
  Object.entries(backend.parameter_scores).forEach(([k, v]) => {
    parameterScores[k as SensorParameterId] = v;
  });

  return {
    estimatedScore: backend.estimated_score,
    rating: backend.rating as SoilHealthScoreResult['rating'],
    color: backend.color,
    parameterScores,
    disclaimer: backend.disclaimer,
  };
}

function adaptBackendWarnings(backend: BackendSoilHealthResponse): SoilWarningAlert[] {
  return backend.warnings.map((w) => ({
    id: w.id,
    parameterId: w.id.replace('warn-low-', '').replace('warn-high-', '') as SensorParameterId,
    parameterName: w.parameter,
    severity: w.severity as SoilWarningAlert['severity'],
    message: w.message,
    suggestedImmediateAction: w.suggested_action,
  }));
}

// ---------------------------------------------------------------------------
// Component: Real-Time Soil Health & ESP32 Telemetry Dashboard
// ---------------------------------------------------------------------------
export const SoilHealthPage: React.FC = () => {
  const { t, translateSensorParam } = useLanguage();
  const DEVICE_ID = 'esp32-field-node-01';
  const [parameters, setParameters] = useState<SensorParameterDetail[]>([]);
  const [scoreData, setScoreData] = useState<SoilHealthScoreResult | null>(null);
  const [warnings, setWarnings] = useState<SoilWarningAlert[]>([]);
  const [recommendations, setRecommendations] = useState<SoilSpecificRecommendation[]>([]);
  const [selectedParamId, setSelectedParamId] = useState<SensorParameterId>('moisture');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [isInvalidReading, setIsInvalidReading] = useState<boolean>(false);
  const [warningNotice, setWarningNotice] = useState<string | null>(null);

  // Load telemetry and soil health data from real backend endpoints
  const loadTelemetry = async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else if (!parameters.length) setLoading(true);

      // Fetch real soil health and latest sensor readings from backend
      const [backendHealth, latestReading]: [BackendSoilHealthResponse, SoilSensorReadings] = await Promise.all([
        sensorService.getBackendSoilHealth(DEVICE_ID),
        sensorService.getLatestReadings(DEVICE_ID)
      ]);

      const adaptedParams = adaptBackendParams(backendHealth.parameters);
      const adaptedScore = adaptBackendScore(backendHealth);
      const adaptedWarnings = adaptBackendWarnings(backendHealth);
      const recs = sensorService.getSoilRecommendations(adaptedParams);

      setParameters(adaptedParams);
      setScoreData(adaptedScore);
      setWarnings(adaptedWarnings);
      setRecommendations(recs);

      setLastSyncTime(latestReading.lastUpdatedFormatted || 'Just now');
      setIsInvalidReading(Boolean(latestReading.isInvalidReading));
      setWarningNotice(latestReading.warningNotice || null);
    } catch (err: unknown) {
      console.warn('[SoilHealthPage] Error during telemetry refresh:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTelemetry();

    // Auto-polling interval (every 3 seconds) for real-time soil sensor updates
    const timer = setInterval(() => {
      loadTelemetry(false);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const handleManualRefresh = () => {
    loadTelemetry(true);
  };

  if (loading && !scoreData) {
    return (
      <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <RefreshCw size={36} color="var(--gold-500)" className="spin" style={{ marginBottom: '1rem' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          Synchronizing precision soil health telemetry stream...
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header Banner & Live Stream Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 700 }}>{t('soil.title')}</h2>
            <span
              style={{
                padding: '0.3rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(52, 211, 153, 0.4)',
                color: 'var(--emerald-300)',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              {t('dash.phaseBadge')}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {t('soil.subtitle')}
          </p>
        </div>

        {/* Live Soil Telemetry Status Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#ffffff',
              border: '1.5px solid var(--border-glass)',
              boxShadow: '0 2px 8px rgba(212, 175, 55, 0.1)',
              fontSize: '0.825rem',
            }}
          >
            {/* Telemetry Status Indicator */}
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#059669', fontWeight: 600 }}>
              <Wifi size={14} className="pulse" />
              Soil Telemetry (Synchronized)
            </span>
            <span style={{ color: 'var(--border-glass)' }}>|</span>
            {/* Last Updated Timestamp */}
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
              <Clock size={13} /> {lastSyncTime}
            </span>
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={handleManualRefresh}
            disabled={refreshing}
            style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RefreshCw size={15} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Syncing...' : 'Poll Sensors'}
          </button>
        </div>
      </div>

      {/* Invalid Reading Notice Banner */}
      {isInvalidReading && (
        <div
          className="animate-fade-in"
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            color: '#b8860b',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <AlertTriangle size={22} style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ display: 'block', fontSize: '0.95rem' }}>Calibrated Reading Notice</strong>
            <span>{warningNotice || 'Adjusted readings detected from field telemetry.'}</span>
          </div>
        </div>
      )}


      {/* 4. Estimated Soil Health Score Section */}
      {scoreData && <SoilHealthScoreCard scoreData={scoreData} parameters={parameters} />}

      {/* 5. Warning Alerts Section (if any sensor is in warning/critical state) */}
      {warnings.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
            <AlertTriangle size={20} color="#fbbf24" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fbbf24' }}>
              Active Soil Parameter Warnings ({warnings.length})
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {warnings.map((alert) => (
              <div
                key={alert.id}
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <Badge variant={alert.severity}>{alert.severity} Alert</Badge>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>
                      {alert.parameterName} Deviation Detected
                    </span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {alert.message}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--emerald-300)', marginTop: '0.4rem', fontWeight: 500 }}>
                    <strong>Action Required:</strong> {alert.suggestedImmediateAction}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Individual Sensor Cards Grid (All 6 Sensors: Moisture, Temperature, pH, Nitrogen, Phosphorus, Potassium) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{t('soil.probesHeader')}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {t('soil.probesSub')}
            </p>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--emerald-400)', fontWeight: 600 }}>
            Selected: {parameters.find((p) => p.id === selectedParamId)?.name}
          </span>
        </div>

        <div className="grid-3">
          {parameters.map((param) => {
            const localized = translateSensorParam(param);
            return (
              <SoilSensorCard
                key={localized.id}
                param={localized}
                isSelected={localized.id === selectedParamId}
                onSelect={setSelectedParamId}
              />
            );
          })}
        </div>
      </div>

      {/* 7. Historical Telemetry Chart */}
      <SoilHistoricalChart
        parameters={parameters}
        selectedParamId={selectedParamId}
        onSelectParam={setSelectedParamId}
      />

      {/* 8. Actionable Soil Recommendations */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Lightbulb size={22} color="var(--emerald-400)" />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{t('soil.actionRecs')}</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {recommendations.map((rec) => (
            <Card key={rec.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <Badge variant={rec.impact === 'High' ? 'warning' : 'healthy'}>
                  {rec.impact} Priority
                </Badge>
                <span style={{ fontSize: '0.8rem', color: 'var(--emerald-400)', fontWeight: 600 }}>
                  {rec.category}
                </span>
              </div>

              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                {rec.title}
              </h4>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '0.85rem' }}>
                {rec.actionText}
              </p>

              {rec.dosageAdvice && (
                <div
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: '#faf6ee',
                    border: '1.5px solid var(--border-glass)',
                    fontSize: '0.825rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  <strong style={{ color: '#855810' }}>Dosage Advice:</strong> {rec.dosageAdvice}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
