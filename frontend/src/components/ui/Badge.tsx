import React from 'react';

export type BadgeVariant =
  | 'healthy'
  | 'warning'
  | 'alert'
  | 'urgent'
  | 'high'
  | 'medium'
  | 'low'
  | 'info'
  | 'moderate'
  | 'severe'
  | 'none'
  | 'disease_detected'
  | 'optimal'
  | 'normal'
  | 'critical'
  | 'warning_low'
  | 'warning_high'
  | 'error';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ variant, children, size = 'md' }) => {
  const getStyles = () => {
    switch (variant) {
      case 'healthy':
      case 'low':
      case 'none':
      case 'optimal':
      case 'normal':
        return {
          bg: '#ffffff',
          color: '#065f46',
          border: '1.5px solid #059669',
        };
      case 'warning':
      case 'medium':
      case 'moderate':
      case 'warning_low':
      case 'warning_high':
        return {
          bg: '#ffffff',
          color: '#855810',
          border: '1.5px solid #d4af37',
        };
      case 'alert':
      case 'high':
      case 'urgent':
      case 'severe':
      case 'critical':
      case 'disease_detected':
      case 'error':
        return {
          bg: '#ffffff',
          color: '#9f1239',
          border: '1.5px solid #e11d48',
        };
      case 'info':
      default:
        return {
          bg: '#ffffff',
          color: '#855810',
          border: '1.5px solid #d4af37',
        };
    }
  };

  const style = getStyles();
  const padding = size === 'sm' ? '0.15rem 0.5rem' : '0.25rem 0.75rem';
  const fontSize = size === 'sm' ? '0.75rem' : '0.85rem';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding,
        fontSize,
        fontWeight: 600,
        borderRadius: 'var(--radius-full)',
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        textTransform: 'capitalize',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: style.color,
        }}
      />
      {children}
    </span>
  );
};
