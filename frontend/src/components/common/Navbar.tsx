import React, { useState, useEffect } from 'react';
import { Sprout, Menu, X, Globe, ChevronDown, Bot } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { FarmerAiAssistantModal } from './FarmerAiAssistantModal';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const { language, setLanguage, languages, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenChat = () => setChatModalOpen(true);
    window.addEventListener('open-agri-chat', handleOpenChat);
    return () => window.removeEventListener('open-agri-chat', handleOpenChat);
  }, []);

  const navItems = [
    { id: 'landing', label: t('nav.home') },
    { id: 'dashboard', label: t('nav.dashboard') },
    { id: 'plant-analysis', label: t('nav.plantAnalysis') },
    { id: 'soil-health', label: t('nav.soilHealth') },
    { id: 'recommendations', label: t('nav.recommendations') },
    { id: 'about', label: t('nav.about') },
  ];

  const handleNavClick = (id: string) => {
    onTabChange(id);
    setMobileMenuOpen(false);
  };

  const currentLangInfo = languages.find((l) => l.code === language) || languages[0];

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'rgba(255, 255, 255, 0.90)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1.5px solid var(--border-glass)',
          boxShadow: '0 4px 20px rgba(212, 175, 55, 0.08)',
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '76px' }}>
          {/* Brand Logo */}
          <div
            onClick={() => handleNavClick('landing')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
                border: '1.5px solid #fef08a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 14px rgba(212, 175, 55, 0.35)',
              }}
            >
              <Sprout size={24} color="#ffffff" />
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                {t('nav.brand')}
              </span>
              <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--gold-600)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {t('nav.subtitle')}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav style={{ display: 'none', alignItems: 'center', gap: '0.45rem' }} className="desktop-nav">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  style={{
                    padding: '0.55rem 0.95rem',
                    borderRadius: 'var(--radius-full)',
                    border: isActive ? '1.5px solid #d4af37' : '1.5px solid transparent',
                    backgroundColor: isActive ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                    color: isActive ? '#7c4f13' : 'var(--text-secondary)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 0 10px rgba(212, 175, 55, 0.2)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Actions: Farmer AI Assistant & Language Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Farmer AI Assistant Button */}
            <button
              onClick={() => setChatModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.95rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: '#ffffff',
                border: '1.5px solid #d4af37',
                color: '#855810',
                fontSize: '0.825rem',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(212, 175, 55, 0.18)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Bot size={16} color="#b8860b" />
              <span>{t('nav.assistant')}</span>
            </button>

            {/* Language Selection Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.95rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid var(--border-glass)',
                  color: 'var(--text-primary)',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                }}
              >
                <Globe size={15} color="#b8860b" />
                <span>{currentLangInfo.nativeName}</span>
                <ChevronDown size={14} color="var(--text-muted)" />
              </button>

              {langDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '115%',
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #d4af37',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.5rem',
                    boxShadow: '0 10px 30px rgba(184, 134, 11, 0.18)',
                    minWidth: '200px',
                    zIndex: 110,
                  }}
                >
                  <div style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', color: '#855810', fontWeight: 700, borderBottom: '1px solid rgba(212, 175, 55, 0.2)', marginBottom: '0.3rem' }}>
                    Select Language / భాష ఎంచుకోండి
                  </div>

                  {languages.map((l) => {
                    const isSelected = language === l.code;
                    return (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLanguage(l.code);
                          setLangDropdownOpen(false);
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.5rem 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          border: isSelected ? '1px solid #d4af37' : '1px solid transparent',
                          backgroundColor: isSelected ? 'rgba(212, 175, 55, 0.14)' : 'transparent',
                          color: isSelected ? '#7c4f13' : 'var(--text-primary)',
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: '0.825rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '0.2rem',
                        }}
                      >
                        <span>
                          {l.nativeName}{' '}
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({l.name})</span>
                        </span>
                        {l.isInitial && (
                          <span
                            style={{
                              fontSize: '0.65rem',
                              backgroundColor: 'rgba(212, 175, 55, 0.2)',
                              color: '#855810',
                              border: '1px solid rgba(212, 175, 55, 0.4)',
                              padding: '0.1rem 0.35rem',
                              borderRadius: '2px',
                              fontWeight: 600,
                            }}
                          >
                            Live
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                background: '#ffffff',
                border: '1.5px solid var(--border-glass)',
                color: '#7c4f13',
              }}
              className="mobile-toggle"
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div
            style={{
              padding: '1rem 1.5rem 1.5rem 1.5rem',
              backgroundColor: '#ffffff',
              borderBottom: '1.5px solid var(--border-glass)',
              boxShadow: '0 10px 25px rgba(212, 175, 55, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  textAlign: 'left',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: activeTab === item.id ? '1.5px solid #d4af37' : '1px solid transparent',
                  backgroundColor: activeTab === item.id ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                  color: activeTab === item.id ? '#7c4f13' : 'var(--text-secondary)',
                  fontWeight: activeTab === item.id ? 700 : 500,
                  fontSize: '1rem',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        <style>{`
          @media (min-width: 868px) {
            .desktop-nav { display: flex !important; }
            .mobile-toggle { display: none !important; }
          }
        `}</style>
      </header>

      {/* Multilingual Farmer AI Assistant Modal */}
      <FarmerAiAssistantModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
      />
    </>
  );
};
