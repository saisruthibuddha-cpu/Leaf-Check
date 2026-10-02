import React from 'react';
import { Sprout, ShieldCheck, Cpu, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.90)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1.5px solid var(--border-glass)',
        marginTop: '5rem',
        padding: '3rem 0 2rem 0',
        boxShadow: '0 -4px 20px rgba(212, 175, 55, 0.05)',
      }}
    >
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <Sprout size={24} color="#b8860b" />
              <span style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
                Leaf Check
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Empowering farmers and agronomists with real-time computer vision disease diagnostics, physical soil telemetry, and multilingual AI guidance.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#996515', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Core Modules
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <li>Plant Vision Diagnostics</li>
              <li>ESP32 Soil Telemetry</li>
              <li>Agronomic AI Engine</li>
              <li>Multilingual Assistant</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#996515', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              System Architecture
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Cpu size={16} color="#b8860b" />
                <span>FastAPI + PyTorch Backbone</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={16} color="#b8860b" />
                <span>Modbus RS485 & ADC Sensor Mesh</span>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.825rem',
            color: 'var(--text-muted)',
          }}
        >
          <p>© 2026 Leaf Check. Built for Precision Agriculture.</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Designed with <Heart size={14} color="#f43f5e" /> for Sustainable Farming
          </p>
        </div>
      </div>
    </footer>
  );
};
