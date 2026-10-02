import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SupportedLanguage,
  LANGUAGE_LIST,
  LanguageInfo,
  getTranslation,
  translateRecommendation,
  translatePlantAnalysis,
  translateSensorParam,
} from '../i18n';
import { PlantAnalysisResult, SensorParameterDetail } from '../data/types';
import { RecommendationItem } from '../services/recommendationService';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  languages: LanguageInfo[];
  translateRecommendation: (rec: RecommendationItem) => RecommendationItem;
  translatePlantAnalysis: (result: PlantAnalysisResult) => PlantAnalysisResult;
  translateSensorParam: (param: SensorParameterDetail) => SensorParameterDetail;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'ai_crop_health_lang_pref';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage;
      if (saved && ['en', 'te', 'hi', 'ta', 'kn', 'ml'].includes(saved)) {
        return saved;
      }
    } catch {
      // LocalStorage not available or restricted
    }
    return 'en';
  });

  const setLanguage = (newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {
      // Ignore storage errors
    }
  };

  // Sync html lang attribute
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string, params?: Record<string, string | number>): string => {
    return getTranslation(language, key, params);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        languages: LANGUAGE_LIST,
        translateRecommendation: (rec) => translateRecommendation(rec, language),
        translatePlantAnalysis: (result) => translatePlantAnalysis(result, language),
        translateSensorParam: (param) => translateSensorParam(param, language),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export type { SupportedLanguage };
