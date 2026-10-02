/**
 * Multilingual i18n Type Definitions & Contracts
 * AI Crop Health Platform - Phase 8
 */

export type SupportedLanguage = 'en' | 'te' | 'hi' | 'ta' | 'kn' | 'ml';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  isInitial: boolean;
  region: string;
}

export const LANGUAGE_LIST: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', isInitial: true, region: 'Global / India' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', isInitial: true, region: 'Andhra Pradesh & Telangana' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', isInitial: false, region: 'North & Central India' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', isInitial: false, region: 'Tamil Nadu' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', isInitial: false, region: 'Karnataka' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', isInitial: false, region: 'Kerala' },
];

export type TranslationDictionary = Record<string, string>;
