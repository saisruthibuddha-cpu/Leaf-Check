/**
 * AI Crop Health - TypeScript Interface Contracts
 * Architecture Phase 2 Specifications
 */

export type SupportedCrop = 'Tomato' | 'Potato' | 'Rice' | 'Maize';

export type HealthStatus = 'healthy' | 'warning' | 'disease_detected';

export interface PlantAnalysisResult {
  analysisId: string;
  cropType: SupportedCrop;
  healthStatus: HealthStatus;
  disease: string;
  scientificName?: string;
  confidence: number; // percentage e.g. 92
  explanation: string;
  recommendedActions: string[];
  severity: 'none' | 'low' | 'moderate' | 'severe';
  imageUrl: string;
  classProbabilities?: Record<string, number>;
  gradcamImage?: string;
  isLowConfidence?: boolean;
  aiDisclaimer?: string;
  timestamp: string;
}

export interface SoilSensorReadings {
  deviceId: string;
  moisturePercent: number;
  temperatureCelsius: number;
  phLevel: number;
  npk: {
    nitrogenMgKg: number;
    phosphorusMgKg: number;
    potassiumMgKg: number;
  };
  timestamp: string;
  status?: 'active' | 'online' | 'offline' | 'warning' | 'error';
  isOffline?: boolean;
  offlineNotice?: string;
  isInvalidReading?: boolean;
  warningNotice?: string;
  sensorError?: string;
  lastUpdatedFormatted?: string;
}

export type SensorParameterId = 'moisture' | 'temperature' | 'ph' | 'nitrogen' | 'phosphorus' | 'potassium';

export type SensorStatus = 'optimal' | 'normal' | 'warning_low' | 'warning_high' | 'critical' | 'error';

export interface SensorParameterDetail {
  id: SensorParameterId;
  name: string;
  value: number;
  unit: string;
  minHealthy: number;
  maxHealthy: number;
  minScale: number;
  maxScale: number;
  status: SensorStatus;
  statusLabel: string;
  healthyRangeText: string;
  description: string;
  historical24h: { time: string; value: number }[];
  historical7d: { time: string; value: number }[];
}

export interface SoilHealthScoreResult {
  estimatedScore: number; // 0 - 100
  rating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  color: string;
  parameterScores: Record<SensorParameterId, number>; // each 0 - 100
  disclaimer: string;
}

export interface SoilWarningAlert {
  id: string;
  parameterId: SensorParameterId;
  parameterName: string;
  severity: 'warning' | 'alert' | 'urgent';
  message: string;
  suggestedImmediateAction: string;
}

export interface SoilSpecificRecommendation {
  id: string;
  title: string;
  targetParameter: SensorParameterId;
  category: 'Fertilizer' | 'Irrigation' | 'Soil Amendment' | 'Cultivation';
  impact: 'High' | 'Medium' | 'Low';
  actionText: string;
  dosageAdvice?: string;
}

export interface AIRecommendation {
  id: string;
  category: 'irrigation' | 'fertilizer' | 'pest_control' | 'soil_amendment';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
}

export interface IoTDeviceStatus {
  deviceId: string;
  isOnline: boolean;
  batteryLevelPercent: number;
  lastPingTimestamp: string;
  firmwareVersion: string;
}

