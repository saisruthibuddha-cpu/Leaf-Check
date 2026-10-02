import React from 'react';

export const Header: React.FC = () => {
  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        borderBottom: '1px solid var(--border-dark)',
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--text-main)', fontWeight: 700 }}>
          Leaf Check
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Real-Time Agricultural Diagnostics & Soil Telemetry
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--primary-500)', fontWeight: 500 }}>
          Phase 0: Architectural Scaffold Active
        </span>
      </div>
    </header>
  );
};
