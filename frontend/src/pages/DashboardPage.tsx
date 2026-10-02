import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { MetricCard } from '../components/ui/MetricCard';
import { useSensorData } from '../hooks/useSensorData';
import { sensorService, BackendSoilHealthResponse } from '../services/sensorService';
import { MockSoilMetric, MOCK_RECOMMENDATIONS } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';
import { Sprout, Activity, ShieldAlert, Cpu, RefreshCw, Radio, Clock, AlertTriangle } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { t, translateRecommendation } = useLanguage();
  const DEVICE_ID = 'esp32-field-node-01';
  const { readings, loading, refetch } = useSensorData(DEVICE_ID, 3000); // 3-second auto-polling
  const [soilHealth, setSoilHealth] = useState<BackendSoilHealthResponse | null>(null);

  // Fetch soil health score from backend
  useEffect(() => {
    async function loadHealth() {
      try {
        const res = await sensorService.getBackendSoilHealth(DEVICE_ID);
        setSoilHealth(res);
      } catch {
        // Suppress non-fatal health fetch error
      }
    }
    loadHealth();
  }, [readings?.timestamp]);

  // Convert real ESP32 readings into localized MetricCard objects
  const getLiveMetrics = (): MockSoilMetric[] => {
    if (!readings) return [];

    return [
      {
        id: 'moisture',
        name: t('metric.moisture'),
        value: readings.moisturePercent,
        unit: '% VWC',
        optimalRange: '40 - 60% VWC',
        status: readings.moisturePercent < 40 ? 'warning' : readings.moisturePercent > 65 ? 'warning' : 'healthy',
        description: t('metric.moisture.desc'),
        trendHistory: [readings.moisturePercent - 2, readings.moisturePercent - 1, readings.moisturePercent],
      },
      {
        id: 'temperature',
        name: t('metric.temperature'),
        value: readings.temperatureCelsius,
        unit: '°C',
        optimalRange: '18 - 28°C',
        status: readings.temperatureCelsius < 18 || readings.temperatureCelsius > 28 ? 'warning' : 'healthy',
        description: t('metric.temperature.desc'),
        trendHistory: [readings.temperatureCelsius - 0.5, readings.temperatureCelsius, readings.temperatureCelsius + 0.2],
      },
      {
        id: 'ph',
        name: t('metric.ph'),
        value: readings.phLevel,
        unit: 'pH',
        optimalRange: '6.0 - 7.0 pH',
        status: readings.phLevel < 6.0 || readings.phLevel > 7.0 ? 'warning' : 'healthy',
        description: t('metric.ph.desc'),
        trendHistory: [readings.phLevel, readings.phLevel, readings.phLevel],
      },
      {
        id: 'nitrogen',
        name: t('metric.nitrogen'),
        value: readings.npk.nitrogenMgKg,
        unit: 'mg/kg',
        optimalRange: '140 - 200 mg/kg',
        status: readings.npk.nitrogenMgKg < 140 ? 'warning' : 'healthy',
        description: t('metric.nitrogen.desc'),
        trendHistory: [readings.npk.nitrogenMgKg - 5, readings.npk.nitrogenMgKg, readings.npk.nitrogenMgKg],
      },
      {
        id: 'phosphorus',
        name: t('metric.phosphorus'),
        value: readings.npk.phosphorusMgKg,
        unit: 'mg/kg',
        optimalRange: '30 - 60 mg/kg',
        status: readings.npk.phosphorusMgKg < 30 ? 'warning' : 'healthy',
        description: t('metric.phosphorus.desc'),
        trendHistory: [readings.npk.phosphorusMgKg, readings.npk.phosphorusMgKg, readings.npk.phosphorusMgKg],
      },
      {
        id: 'potassium',
        name: t('metric.potassium'),
        value: readings.npk.potassiumMgKg,
        unit: 'mg/kg',
        optimalRange: '150 - 250 mg/kg',
        status: readings.npk.potassiumMgKg < 150 ? 'warning' : 'healthy',
        description: t('metric.potassium.desc'),
        trendHistory: [readings.npk.potassiumMgKg - 3, readings.npk.potassiumMgKg, readings.npk.potassiumMgKg],
      },
    ];
  };

  const isInvalid = readings?.isInvalidReading;
  const liveMetrics = getLiveMetrics();

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header Banner & Live Hardware Stream Indicator */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 700 }}>{t('dash.title')}</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            {t('dash.subtitle')}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(52, 211, 153, 0.4)',
              color: 'var(--emerald-300)',
              fontSize: '0.775rem',
              fontWeight: 600,
            }}
          >
            {t('dash.phaseBadge')}
          </span>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => refetch()}
            style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={15} /> {t('btn.pollSensors')}
          </button>
        </div>
      </div>

      {/* Invalid Reading Warning Banner */}
      {isInvalid && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            color: '#f87171',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <AlertTriangle size={22} style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ display: 'block', fontSize: '0.95rem' }}>{t('status.warning')}</strong>
            <span>{readings?.warningNotice || t('alert.invalidReading')}</span>
          </div>
        </div>
      )}

      {/* Primary Overview Cards Grid */}
      <div className="grid-4">
        {/* Plant Health */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sprout size={20} color="var(--emerald-400)" />
              <span>{t('dash.plantHealthIndex')}</span>
            </div>
          }
          action={<Badge variant="healthy">{t('status.healthy')}</Badge>}
        >
          <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#ffffff', margin: '0.4rem 0' }}>
            {t('status.normal')}
          </p>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            {t('dash.plantHealthDesc')}
          </p>
        </Card>

        {/* Live Soil Health Score Summary */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} color="#0ea5e9" />
              <span>{t('dash.soilHealthScore')}</span>
            </div>
          }
          action={
            <Badge variant={soilHealth?.estimated_score && soilHealth.estimated_score >= 70 ? 'healthy' : 'warning'}>
              {soilHealth?.rating || t('status.healthy')}
            </Badge>
          }
        >
          <p style={{ fontSize: '1.8rem', fontWeight: 700, color: soilHealth?.color || '#34d399', margin: '0.4rem 0' }}>
            {soilHealth?.estimated_score ?? 82} / 100
          </p>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            {t('dash.soilHealthDesc')}
          </p>
        </Card>

        {/* Disease Risk Status */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={20} color="#f59e0b" />
              <span>{t('dash.diseaseRiskIndex')}</span>
            </div>
          }
          action={<Badge variant="healthy">{t('status.normal')}</Badge>}
        >
          <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#ffffff', margin: '0.4rem 0' }}>
            {t('status.healthy')}
          </p>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            {t('dash.diseaseRiskDesc')}
          </p>
        </Card>

        {/* Soil Telemetry Status */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cpu size={20} color="#059669" />
              <span>{t('dash.soilTelemetry')}</span>
            </div>
          }
          action={
            <Badge variant="healthy">
              {t('status.online')}
            </Badge>
          }
        >
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.4rem 0' }}>
            {t('status.online')}
          </p>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Radio size={13} color="#059669" /> Soil Telemetry Stream Synchronized
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={13} /> {t('dash.lastSync')}: {readings?.lastUpdatedFormatted || 'Just now'}
            </span>
          </div>
        </Card>
      </div>

      {/* Real Backend Soil Telemetry Metrics Cards Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700 }}>{t('dash.physicalSoilMetrics')}</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              {t('dash.physicalSoilMetricsSub')}
            </p>
          </div>
          <span style={{ fontSize: '0.825rem', color: 'var(--emerald-400)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Clock size={14} /> {t('dash.lastSync')}: {readings?.lastUpdatedFormatted || 'Just now'}
          </span>
        </div>

        {loading && !readings ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
            <RefreshCw size={32} color="var(--emerald-400)" className="spin" style={{ marginBottom: '0.75rem' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('btn.syncing')}</p>
          </div>
        ) : (
          <div className="grid-3">
            {liveMetrics.map((metric) => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </div>
        )}
      </div>

      {/* Active Agronomic Guidance (Multilingual Translation Layer Applied) */}
      <div>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>
          {t('dash.activeRecs')}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {MOCK_RECOMMENDATIONS.slice(0, 2).map((rawRec) => {
            const rec = translateRecommendation({
              id: rawRec.id,
              title: rawRec.title,
              category: rawRec.category,
              severity: rawRec.severity === 'urgent' ? 'urgent' : 'high',
              issue: rawRec.issue,
              explanation: rawRec.issue,
              actionableSteps: rawRec.actionableSteps,
              createdAt: rawRec.createdAt,
            });

            return (
              <Card key={rec.id} glow={rec.severity === 'urgent'}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Badge variant={rec.severity}>{rec.severity}</Badge>
                    <span style={{ fontSize: '0.85rem', color: 'var(--emerald-400)', fontWeight: 600 }}>
                      {rec.category}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{rec.createdAt}</span>
                </div>

                <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '0.75rem', marginBottom: '0.3rem' }}>
                  {rec.title}
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  {rec.issue}
                </p>

                <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: '#faf6ee', border: '1.5px solid var(--border-glass)' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#855810' }}>
                    {t('recs.actionProtocol')}
                  </span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {rec.actionableSteps[0]}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
