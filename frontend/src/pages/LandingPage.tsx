import React from 'react';
import { Sprout, Activity, Cpu, Globe, ArrowRight, Scan, ShieldCheck, Waves, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '5rem' }}>
      {/* Hero Section */}
      <section
        style={{
          padding: '4.5rem 1.5rem',
          textAlign: 'center',
          position: 'relative',
          background: 'radial-gradient(ellipse at top, rgba(212, 175, 55, 0.16) 0%, rgba(255, 255, 255, 0.88) 70%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: 'var(--radius-lg)',
          border: '1.5px solid var(--border-glass)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#ffffff',
              border: '1.5px solid #d4af37',
              color: '#855810',
              fontSize: '0.85rem',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(212, 175, 55, 0.18)',
              marginBottom: '1.5rem',
            }}
          >
            <Sprout size={16} color="#b8860b" /> Leaf Check Platform
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              marginBottom: '1.25rem',
              lineHeight: 1.15,
            }}
          >
            <span className="text-gradient">{t('hero.title')}</span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: 'var(--text-secondary)',
              marginBottom: '2.5rem',
              lineHeight: 1.6,
            }}
          >
            {t('hero.subtitle')}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.25rem' }}>
            <button className="btn-primary" onClick={() => onNavigate('plant-analysis')}>
              <Scan size={18} /> {t('hero.btnAnalyze')}
            </button>
            <button className="btn-secondary" onClick={() => onNavigate('dashboard')}>
              <Activity size={18} /> {t('hero.btnDashboard')}
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                onNavigate('plant-analysis');
                setTimeout(() => window.dispatchEvent(new CustomEvent('start-demo-flow')), 250);
              }}
              style={{ borderColor: 'var(--gold-500)', color: '#855810', fontWeight: 700, backgroundColor: '#ffffff' }}
            >
              <Sparkles size={18} color="#b8860b" /> Run 10-Step Demo Flow
            </button>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Next-Gen Farm Intelligence Ecosystem
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Combining computer vision leaf diagnostics with physical soil telemetry.
          </p>
        </div>

        <div className="grid-3">
          {/* AI Plant Detection */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(212, 175, 55, 0.12)',
                border: '1.5px solid rgba(212, 175, 55, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <Scan size={26} color="#b8860b" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              AI Plant Disease Detection
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Instant neural network leaf scanning identifies over 38 crop disease types with severity classification and organic treatment remedies.
            </p>
          </div>

          {/* Smart Soil Monitoring */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(212, 175, 55, 0.12)',
                border: '1.5px solid rgba(212, 175, 55, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <Waves size={26} color="#b8860b" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Smart Soil Monitoring
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Real-time measurement of root-zone soil moisture, temperature, pH balance, and NPK nutrient bio-availability.
            </p>
          </div>

          {/* IoT Sensor Integration */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(212, 175, 55, 0.12)',
                border: '1.5px solid rgba(212, 175, 55, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <Cpu size={26} color="#b8860b" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              ESP32 IoT Integration
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Solar-powered wireless edge sensor nodes transmit telemetry continuously using Modbus RS485 and ADC buses.
            </p>
          </div>

          {/* Multilingual Assistance */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(212, 175, 55, 0.12)',
                border: '1.5px solid rgba(212, 175, 55, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <Globe size={26} color="#b8860b" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Multilingual Assistance
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Built for local farming communities with support for English, Telugu (తెలుగు), and additional regional dialects.
            </p>
          </div>

          {/* AI Recommendation Engine */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(212, 175, 55, 0.12)',
                border: '1.5px solid rgba(212, 175, 55, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <Activity size={26} color="#b8860b" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Agronomic AI Recommendations
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Fuses physical sensor readings with computer vision predictions to deliver precise irrigation and fertigation advice.
            </p>
          </div>

          {/* How It Works CTA */}
          <div
            className="glass-panel"
            style={{
              padding: '2rem',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 245, 230, 0.75) 100%)',
              borderColor: '#d4af37',
              borderWidth: '1.5px',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(212, 175, 55, 0.15)',
                border: '1.5px solid #d4af37',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <ShieldCheck size={26} color="#b8860b" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              How It Works
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1rem' }}>
              Discover how edge hardware, computer vision models, and FastAPI backend servers collaborate seamlessly.
            </p>
            <button
              style={{
                background: 'transparent',
                border: 'none',
                color: '#855810',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
              }}
              onClick={() => onNavigate('about')}
            >
              Explore Architecture <ArrowRight size={16} color="#b8860b" />
            </button>
          </div>
        </div>
      </section>

      {/* Quick Action CTA Banner */}
      <section
        style={{
          padding: '3rem 2rem',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, #ffffff 0%, #faf6eb 100%)',
          border: '2px solid #d4af37',
          boxShadow: '0 8px 30px rgba(212, 175, 55, 0.18)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
            Ready to inspect your crop health?
          </h2>
          <p style={{ color: '#855810', fontWeight: 600 }}>
            Upload a leaf image or view live mock telemetry for your field.
          </p>
        </div>
        <button className="btn-primary" onClick={() => onNavigate('plant-analysis')}>
          Start Diagnosis <ArrowRight size={18} />
        </button>
      </section>
    </div>
  );
};
