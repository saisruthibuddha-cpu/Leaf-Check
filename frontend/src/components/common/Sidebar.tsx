import React from 'react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Overview Dashboard' },
    { id: 'plant-analysis', label: 'Plant Diagnostics' },
    { id: 'soil-health', label: 'Soil Telemetry' },
  ];

  return (
    <aside
      style={{
        width: '240px',
        borderRight: '1px solid var(--border-dark)',
        padding: '1.5rem 1rem',
        backgroundColor: 'var(--bg-card-dark)',
      }}
    >
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                textAlign: 'left',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isActive ? 'var(--primary-700)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
