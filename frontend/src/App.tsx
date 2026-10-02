import React, { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { SoilHealthPage } from './pages/SoilHealthPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { AboutPage } from './pages/AboutPage';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('landing');

  const renderActivePage = () => {
    switch (activeTab) {
      case 'landing':
        return <LandingPage onNavigate={setActiveTab} />;
      case 'dashboard':
        return <DashboardPage />;
      case 'plant-analysis':
        return <AnalysisPage />;
      case 'soil-health':
        return <SoilHealthPage />;
      case 'recommendations':
        return <RecommendationsPage />;
      case 'about':
        return <AboutPage />;
      default:
        return <LandingPage onNavigate={setActiveTab} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      {/* Soft Blurred Plant Foliage Backdrop & Champagne Sunlight Veil */}
      <div className="plant-bg-backdrop" aria-hidden="true" />
      <div className="plant-bg-overlay" aria-hidden="true" />

      {/* Main Elevated Content Layer */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
        <main style={{ flex: 1, padding: '2rem 0' }}>
          <div className="container">
            {renderActivePage()}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
