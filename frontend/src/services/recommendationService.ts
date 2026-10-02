/**
 * Recommendation Service — Phase 4, Phase 8, and Phase 9
 * Calls GET /api/recommendations, POST /api/recommendations/evaluate, and GET /api/recommendations/fused.
 * Adapts snake_case responses to frontend-friendly camelCase.
 */
import { fetchApi } from './apiClient';

// ---------------------------------------------------------------------------
// Backend API Response Shapes (snake_case from FastAPI Pydantic models)
// ---------------------------------------------------------------------------
export interface RecommendationApiItem {
  id: string;
  title: string;
  category: string;
  severity: string;
  issue: string;
  explanation: string;
  actionable_steps: string[];
  recommendation?: string;
  reason?: string;
  suggested_action?: string;
  supporting_sensor_values?: Record<string, any>;
  stress_type?: string;
  created_at: string;
}

export interface RecommendationListApiResponse {
  field_id: string;
  total_count: number;
  recommendations: RecommendationApiItem[];
}

export interface FusedRecommendationApiItem {
  id: string;
  recommendation: string;
  severity: string;
  stress_type: string;
  reason: string;
  suggested_action: string;
  supporting_sensor_values: Record<string, any>;
  actionable_steps: string[];
  category: string;
  created_at: string;
}

export interface FusedRecommendationApiResponse {
  field_id: string;
  crop_type: string;
  plant_disease?: string | null;
  disease_confidence?: number | null;
  evaluated_at: string;
  stresses_detected: string[];
  total_count: number;
  recommendations: FusedRecommendationApiItem[];
  disclaimer: string;
}

// ---------------------------------------------------------------------------
// Phase 9 Frontend Input Payload
// ---------------------------------------------------------------------------
export interface PlantSoilFusionInput {
  crop_type: string;
  disease_prediction?: string | null;
  disease_confidence?: number | null;
  plant_health_status?: string;
  analysis_id?: string | null;
  soil_moisture?: number | null;
  soil_temperature?: number | null;
  ph?: number | null;
  nitrogen?: number | null;
  phosphorus?: number | null;
  potassium?: number | null;
  field_id?: string;
  lang?: string;
}

// ---------------------------------------------------------------------------
// Frontend-friendly Fused Recommendation shape
// ---------------------------------------------------------------------------
export interface FusedRecommendationItem {
  id: string;
  recommendation: string;
  severity: 'urgent' | 'high' | 'medium' | 'low';
  stressType: string;
  reason: string;
  suggestedAction: string;
  supportingSensorValues: Record<string, any>;
  actionableSteps: string[];
  category: string;
  createdAt: string;
}

export interface FusedRecommendationResult {
  fieldId: string;
  cropType: string;
  plantDisease?: string | null;
  diseaseConfidence?: number | null;
  evaluatedAt: string;
  stressesDetected: string[];
  totalCount: number;
  recommendations: FusedRecommendationItem[];
  disclaimer: string;
}

export interface RecommendationItem {
  id: string;
  title: string;
  category: string;
  severity: 'urgent' | 'high' | 'medium' | 'low';
  issue: string;
  explanation: string;
  actionableSteps: string[];
  recommendation?: string;
  reason?: string;
  suggestedAction?: string;
  supportingSensorValues?: Record<string, any>;
  stressType?: string;
  createdAt: string;
}

export interface RecommendationListResult {
  fieldId: string;
  totalCount: number;
  recommendations: RecommendationItem[];
}

// ---------------------------------------------------------------------------
// Adapters: Maps API snake_case → camelCase
// ---------------------------------------------------------------------------
function adaptRecommendation(api: RecommendationApiItem): RecommendationItem {
  return {
    id: api.id,
    title: api.title,
    category: api.category,
    severity: (api.severity as RecommendationItem['severity']) || 'medium',
    issue: api.issue,
    explanation: api.explanation,
    actionableSteps: api.actionable_steps || [],
    recommendation: api.recommendation || api.title,
    reason: api.reason || api.issue,
    suggestedAction: api.suggested_action || api.explanation,
    supportingSensorValues: api.supporting_sensor_values || {},
    stressType: api.stress_type,
    createdAt: new Date(api.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

function adaptFusedRecommendation(api: FusedRecommendationApiItem): FusedRecommendationItem {
  return {
    id: api.id,
    recommendation: api.recommendation,
    severity: (api.severity as FusedRecommendationItem['severity']) || 'medium',
    stressType: api.stress_type,
    reason: api.reason,
    suggestedAction: api.suggested_action,
    supportingSensorValues: api.supporting_sensor_values || {},
    actionableSteps: api.actionable_steps || [],
    category: api.category || 'Management',
    createdAt: new Date(api.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

// ---------------------------------------------------------------------------
// Service Object
// ---------------------------------------------------------------------------
export const recommendationService = {
  /**
   * Fetches agronomic recommendations from FastAPI backend with multilingual support.
   * GET /api/recommendations?field_id=<fieldId>&lang=<lang>&crop_type=<cropType>
   */
  async getRecommendations(
    fieldId: string = 'field-north-01',
    lang: string = 'en',
    cropType: string = 'Tomato'
  ): Promise<RecommendationListResult> {
    const api = await fetchApi<RecommendationListApiResponse>(
      `/recommendations?field_id=${encodeURIComponent(fieldId)}&lang=${encodeURIComponent(lang)}&crop_type=${encodeURIComponent(cropType)}`
    );
    return {
      fieldId: api.field_id,
      totalCount: api.total_count,
      recommendations: api.recommendations.map(adaptRecommendation),
    };
  },

  /**
   * Phase 9 Core: Evaluates combined plant analysis inferences with soil telemetry.
   * POST /api/recommendations/evaluate
   */
  async evaluateFusion(payload: PlantSoilFusionInput): Promise<FusedRecommendationResult> {
    const api = await fetchApi<FusedRecommendationApiResponse>('/recommendations/evaluate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return {
      fieldId: api.field_id,
      cropType: api.crop_type,
      plantDisease: api.plant_disease,
      diseaseConfidence: api.disease_confidence,
      evaluatedAt: api.evaluated_at,
      stressesDetected: api.stresses_detected || [],
      totalCount: api.total_count,
      recommendations: api.recommendations.map(adaptFusedRecommendation),
      disclaimer: api.disclaimer,
    };
  },

  /**
   * Phase 9 Convenience: Fetches live fused recommendations using current ESP32 data.
   * GET /api/recommendations/fused?field_id=...&crop_type=...&lang=...
   */
  async getLiveFused(
    fieldId: string = 'field-north-01',
    cropType: string = 'Tomato',
    lang: string = 'en'
  ): Promise<FusedRecommendationResult> {
    const api = await fetchApi<FusedRecommendationApiResponse>(
      `/recommendations/fused?field_id=${encodeURIComponent(fieldId)}&crop_type=${encodeURIComponent(cropType)}&lang=${encodeURIComponent(lang)}`
    );
    return {
      fieldId: api.field_id,
      cropType: api.crop_type,
      plantDisease: api.plant_disease,
      diseaseConfidence: api.disease_confidence,
      evaluatedAt: api.evaluated_at,
      stressesDetected: api.stresses_detected || [],
      totalCount: api.total_count,
      recommendations: api.recommendations.map(adaptFusedRecommendation),
      disclaimer: api.disclaimer,
    };
  },
};
