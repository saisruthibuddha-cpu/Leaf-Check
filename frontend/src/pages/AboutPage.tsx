import React from 'react';
import { Card } from '../components/ui/Card';
import { Scan, Cpu, Globe, ShieldCheck } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const steps = [
    {
      num: '01',
      icon: <Scan size={24} color="var(--emerald-400)" />,
      title: 'Image Capture & Sensor Ingestion',
      desc: 'Farmers upload crop leaf images or connect wireless ESP32 edge nodes equipped with capacitive moisture, 1-Wire temperature, and RS485 Modbus pH/NPK probes.'
    },
    {
      num: '02',
      icon: <Cpu size={24} color="#0ea5e9" />,
      title: 'AI Vision & Telemetry Processing',
      desc: 'Our PyTorch ResNet50 neural network classifies leaf pathogens while the FastAPI backend calibrates raw soil ADC voltage curves and Modbus registers.'
    },
    {
      num: '03',
      icon: <Globe size={24} color="#f59e0b" />,
      title: 'Multilingual Agronomic Guidance',
      desc: 'The recommendation engine fuses visual diagnostics with soil nutrient context to issue step-by-step fertigation and irrigation advice in English & Telugu.'
    }
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* Page Header */}
      <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.9rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(52, 211, 153, 0.12)',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            color: 'var(--emerald-300)',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1rem',
          }}
        >
          <ShieldCheck size={16} /> Architectural Workflow
        </div>
        <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '1rem' }}>
          How Leaf Check Works
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.6' }}>
          An end-to-end smart farming system built to bridge physical soil telemetry and high-precision deep learning computer vision.
        </p>
      </div>

      {/* 3-Step Process Cards */}
      <div className="grid-3">
        {steps.map((step) => (
          <Card key={step.num}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {step.icon}
              </div>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--emerald-400)', opacity: 0.6 }}>
                {step.num}
              </span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {step.title}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              {step.desc}
            </p>
          </Card>
        ))}
      </div>

      {/* Modular Platform Architecture Map */}
      <Card title="Clean Modular Architectural Pipeline">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
          <div style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', background: '#faf6ee', border: '1.5px solid var(--border-glass)' }}>
            <h4 style={{ color: '#855810', fontWeight: 700, marginBottom: '0.4rem' }}>1. Frontend Layer</h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              React + Vite + TypeScript interface with glassmorphic cards and responsive language contexts.
            </p>
          </div>

          <div style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', background: '#faf6ee', border: '1.5px solid var(--border-glass)' }}>
            <h4 style={{ color: '#855810', fontWeight: 700, marginBottom: '0.4rem' }}>2. Backend Gateway</h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              FastAPI REST API handling Pydantic validation, MQTT telemetry streams, and database ORM queries.
            </p>
          </div>

          <div style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', background: '#faf6ee', border: '1.5px solid var(--border-glass)' }}>
            <h4 style={{ color: '#855810', fontWeight: 700, marginBottom: '0.4rem' }}>3. AI Neural Engine</h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              PyTorch CropDiseaseNet vision pipeline for plant pathogen identification and severity scoring.
            </p>
          </div>

          <div style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', background: '#faf6ee', border: '1.5px solid var(--border-glass)' }}>
            <h4 style={{ color: '#855810', fontWeight: 700, marginBottom: '0.4rem' }}>4. Agronomic Fusion Engine</h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Multimodal intelligence uniting leaf pathogen computer vision with physical soil chemistry (Moisture, Temp, pH, NPK).
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
