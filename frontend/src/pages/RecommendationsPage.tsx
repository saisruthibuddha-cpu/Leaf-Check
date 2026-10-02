import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  recommendationService,
  FusedRecommendationResult,
  PlantSoilFusionInput,
} from '../services/recommendationService';
import { useLanguage } from '../context/LanguageContext';
import { useSensorData } from '../hooks/useSensorData';
import {
  Lightbulb,
  CheckCircle,
  RefreshCw,
  AlertTriangle,
  Layers,
  ShieldAlert,
  Sprout,
  Cpu,
  Info,
} from 'lucide-react';

export const RecommendationsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { readings: liveSensors } = useSensorData('esp32-field-node-01', 3000);

  // Phase 9 Fusion State
  const [cropType, setCropType] = useState<string>('Tomato');
  const [diseaseInput] = useState<string>('Auto (Latest Analysis)');
  const [simulatedDisease, setSimulatedDisease] = useState<string>('Early Blight');
  const [isCustomDisease, setIsCustomDisease] = useState<boolean>(false);
  const [fusionResult, setFusionResult] = useState<FusedRecommendationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldId] = useState<string>('field-north-01');
  const [lastFetched, setLastFetched] = useState<string>('');

  const cropOptions = ['Tomato', 'Potato', 'Rice', 'Maize'];
  const diseasePresets = [
    'Early Blight',
    'Late Blight',
    'Bacterial Spot',
    'Septoria Leaf Spot',
    'Blast',
    'Healthy',
  ];

  // Load Fused Recommendations
  const loadFusedRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const effectiveDisease = isCustomDisease
        ? simulatedDisease
        : diseaseInput === 'Auto (Latest Analysis)'
        ? null
        : diseaseInput;

      const payload: PlantSoilFusionInput = {
        crop_type: cropType,
        disease_prediction: effectiveDisease,
        disease_confidence: effectiveDisease && effectiveDisease !== 'Healthy' ? 92.5 : undefined,
        plant_health_status:
          effectiveDisease && effectiveDisease !== 'Healthy' ? 'disease_detected' : 'healthy',
        field_id: fieldId,
        lang: language,
        soil_moisture: liveSensors?.moisturePercent,
        soil_temperature: liveSensors?.temperatureCelsius,
        ph: liveSensors?.phLevel,
        nitrogen: liveSensors?.npk?.nitrogenMgKg,
        phosphorus: liveSensors?.npk?.phosphorusMgKg,
        potassium: liveSensors?.npk?.potassiumMgKg,
      };

      const result = await recommendationService.evaluateFusion(payload);
      setFusionResult(result);
      setLastFetched(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to fetch fused recommendations from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFusedRecommendations();
  }, [fieldId, language, cropType, isCustomDisease, simulatedDisease]);

  const getStressBadgeVariant = (stress: string): 'urgent' | 'warning' | 'healthy' => {
    const s = stress.toLowerCase();
    if (s.includes('compound') || s.includes('water stress (deficit)')) return 'urgent';
    if (s.includes('disease') || s.includes('water') || s.includes('nutrient')) return 'warning';
    return 'healthy';
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <Layers size={26} color="var(--emerald-400)" />
            <h2 style={{ fontSize: '1.85rem', fontWeight: 700 }}>
              {t('recs.fusionEngine')}
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
            {t('recs.fusionSub')}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {lastFetched && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {t('dash.lastSync')}: {lastFetched}
            </span>
          )}
          <button
            type="button"
            className="btn-secondary"
            onClick={loadFusedRecommendations}
            disabled={loading}
            style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            {loading ? t('recs.evaluating') : t('recs.evaluateBtn')}
          </button>
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
            Phase 9 · Plant + Soil Fusion
          </span>
        </div>
      </div>

      {/* Mandatory Safety Guardrail Alert Banner */}
      <div
        style={{
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(59, 130, 246, 0.12)',
          border: '1px solid rgba(59, 130, 246, 0.35)',
          color: '#93c5fd',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <Info size={20} style={{ flexShrink: 0 }} />
        <span>{t('recs.safetyNotice')}</span>
      </div>

      {/* Control & Live Telemetry Fusion Dashboard */}
      <Card title="Fusion Inputs: Plant Diagnosis & Real-Time Soil Probes">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Top Selection Row: Crop Type and Diagnostic Mode */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {/* Target Crop Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                <Sprout size={15} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                {t('recs.targetCrop')}
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {cropOptions.map((c) => {
                  const active = cropType === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCropType(c)}
                      style={{
                        padding: '0.4rem 0.9rem',
                        borderRadius: 'var(--radius-sm)',
                        border: active ? '1px solid var(--emerald-400)' : '1px solid var(--border-glass)',
                        backgroundColor: active ? 'rgba(52, 211, 153, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                        color: active ? 'var(--emerald-300)' : 'var(--text-muted)',
                        fontWeight: active ? 600 : 500,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Disease Input Mode Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                <ShieldAlert size={15} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                {t('recs.simDisease')}
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setIsCustomDisease(false)}
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    border: !isCustomDisease ? '1px solid var(--emerald-400)' : '1px solid var(--border-glass)',
                    backgroundColor: !isCustomDisease ? 'rgba(52, 211, 153, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                    color: !isCustomDisease ? 'var(--emerald-300)' : 'var(--text-muted)',
                    fontWeight: !isCustomDisease ? 600 : 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Live / Latest Analysis
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomDisease(true)}
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    border: isCustomDisease ? '1px solid #38bdf8' : '1px solid var(--border-glass)',
                    backgroundColor: isCustomDisease ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                    color: isCustomDisease ? '#7dd3fc' : 'var(--text-muted)',
                    fontWeight: isCustomDisease ? 600 : 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Scenario Testing
                </button>
              </div>

              {isCustomDisease && (
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
                  {diseasePresets.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSimulatedDisease(d)}
                      style={{
                        padding: '0.25rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        border: simulatedDisease === d ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                        backgroundColor: simulatedDisease === d ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                        color: simulatedDisease === d ? '#ffffff' : 'var(--text-muted)',
                        cursor: 'pointer',
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active Supporting Soil Telemetry Strip */}
          <div
            style={{
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#faf6ee',
              border: '1.5px solid var(--border-glass)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              boxShadow: '0 2px 8px rgba(212, 175, 55, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#855810', fontSize: '0.85rem', fontWeight: 700 }}>
              <Cpu size={18} color="#b8860b" />
              <span>Active ESP32 Telemetry:</span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.825rem' }}>
              <span>
                <strong style={{ color: 'var(--text-secondary)' }}>Moisture:</strong>{' '}
                <span style={{ color: '#38bdf8' }}>{liveSensors?.moisturePercent != null ? liveSensors.moisturePercent.toFixed(1) : '--'}%</span>
              </span>
              <span>
                <strong style={{ color: 'var(--text-secondary)' }}>Temp:</strong>{' '}
                <span style={{ color: '#fb923c' }}>{liveSensors?.temperatureCelsius != null ? liveSensors.temperatureCelsius.toFixed(1) : '--'}°C</span>
              </span>
              <span>
                <strong style={{ color: 'var(--text-secondary)' }}>pH:</strong>{' '}
                <span style={{ color: '#c084fc' }}>{liveSensors?.phLevel != null ? liveSensors.phLevel.toFixed(2) : '--'}</span>
              </span>
              <span>
                <strong style={{ color: 'var(--text-secondary)' }}>N-P-K:</strong>{' '}
                <span style={{ color: 'var(--emerald-300)' }}>
                  {liveSensors?.npk ? `${liveSensors.npk.nitrogenMgKg.toFixed(0)} - ${liveSensors.npk.phosphorusMgKg.toFixed(0)} - ${liveSensors.npk.potassiumMgKg.toFixed(0)} mg/kg` : '--'}
                </span>
              </span>
            </div>
          </div>

          {/* Stresses Detected Pill Bar */}
          {fusionResult && fusionResult.stressesDetected && fusionResult.stressesDetected.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {t('recs.stressType')}s:
              </span>
              {fusionResult.stressesDetected.map((stress, idx) => (
                <Badge key={idx} variant={getStressBadgeVariant(stress)}>
                  {stress}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Loading Indicator */}
      {loading && (
        <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
          <RefreshCw size={36} color="var(--emerald-400)" className="spin" style={{ marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>{t('recs.evaluating')}</p>
        </div>
      )}

      {/* Error Banner */}
      {!loading && error && (
        <div
          style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            textAlign: 'center',
          }}
        >
          <AlertTriangle size={36} color="#f87171" />
          <div>
            <h3 style={{ color: '#f87171', fontWeight: 700, marginBottom: '0.25rem' }}>{t('error.general')}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{error}</p>
          </div>
          <button type="button" className="btn-secondary" onClick={loadFusedRecommendations}>
            {t('btn.retry')}
          </button>
        </div>
      )}

      {/* Phase 9 Fused Recommendations Cards List */}
      {!loading && !error && fusionResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {fusionResult.recommendations.map((rec) => {
            const isUrgent = rec.severity === 'urgent';

            return (
              <Card key={rec.id} glow={isUrgent}>
                {/* 1. Header: Recommendation Title, Severity, Stress Type */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isUrgent ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '0.1rem',
                      }}
                    >
                      {isUrgent ? (
                        <AlertTriangle size={22} color="#f87171" />
                      ) : (
                        <Lightbulb size={22} color="var(--emerald-400)" />
                      )}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            color: isUrgent ? '#f87171' : 'var(--emerald-400)',
                          }}
                        >
                          {rec.category}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>•</span>
                        <Badge variant={getStressBadgeVariant(rec.stressType)}>
                          {rec.stressType}
                        </Badge>
                      </div>
                      {/* Explicit Field: Recommendation */}
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ffffff', lineHeight: '1.3' }}>
                        {rec.recommendation}
                      </h3>
                    </div>
                  </div>

                  {/* Explicit Field: Severity */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Badge variant={rec.severity === 'urgent' ? 'urgent' : rec.severity === 'high' ? 'warning' : 'healthy'}>
                      {rec.severity.toUpperCase()} SEVERITY
                    </Badge>
                  </div>
                </div>

                {/* 2. Explicit Field: Reason */}
                <div
                  style={{
                    marginBottom: '1rem',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: '#faf6ee',
                    border: '1.5px solid var(--border-glass)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#855810',
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {t('recs.reasonLabel')}
                  </span>
                  <p style={{ fontSize: '0.925rem', color: 'var(--text-primary)', margin: 0, lineHeight: '1.5' }}>
                    {rec.reason}
                  </p>
                </div>

                {/* 3. Explicit Field: Suggested Action (General preventive/management guidance) */}
                <div
                  style={{
                    marginBottom: '1.25rem',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: '#faf6ee',
                    border: '1.5px solid rgba(212, 175, 55, 0.45)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#855810',
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {t('recs.suggestedActionLabel')}
                  </span>
                  <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#7c4f13', margin: 0, lineHeight: '1.5' }}>
                    {rec.suggestedAction}
                  </p>
                </div>

                {/* 4. Actionable Steps Protocol */}
                {rec.actionableSteps && rec.actionableSteps.length > 0 && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                      {t('recs.actionProtocol')}
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {rec.actionableSteps.map((step, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.5rem',
                            fontSize: '0.875rem',
                            color: 'var(--text-primary)',
                          }}
                        >
                          <CheckCircle size={16} color="var(--emerald-400)" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Explicit Field: Supporting Sensor Values */}
                {rec.supportingSensorValues && Object.keys(rec.supportingSensorValues).length > 0 && (
                  <div
                    style={{
                      paddingTop: '0.85rem',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: '0.6rem',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {t('recs.supportingSensorsLabel')}:
                    </span>
                    {Object.entries(rec.supportingSensorValues).map(([key, val]) => (
                      <span
                        key={key}
                        style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-sm)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <strong style={{ color: 'var(--text-primary)' }}>{key.replace(/_/g, ' ')}:</strong> {String(val)}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
