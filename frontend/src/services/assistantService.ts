/**
 * Phase 10 Context-Aware Agricultural AI Assistant Service
 * Sends farmer questions along with real-time field context to /api/assistant/ask.
 */
import { fetchApi } from './apiClient';

export interface AssistantQueryPayload {
  question: string;
  crop_type?: string;
  disease_prediction?: string | null;
  disease_confidence?: number | null;
  plant_health_status?: string | null;
  analysis_explanation?: string | null;
  soil_moisture?: number | null;
  soil_temperature?: number | null;
  ph?: number | null;
  nitrogen?: number | null;
  phosphorus?: number | null;
  potassium?: number | null;
  soil_health_score?: number | null;
  existing_recommendations?: string[];
  lang?: string;
}

export interface AssistantApiResponse {
  question: string;
  lang: string;
  crop_type: string;
  possible_reason: string;
  evidence_from_plant_image: string;
  relevant_soil_measurements: string;
  recommended_next_step: string;
  full_response: string;
  confidence_level: string;
  safety_disclaimer: string;
  context_utilized: Record<string, any>;
  created_at: string;
}

export interface AssistantAnswer {
  question: string;
  lang: string;
  cropType: string;
  possibleReason: string;
  evidenceFromPlantImage: string;
  relevantSoilMeasurements: string;
  recommendedNextStep: string;
  fullResponse: string;
  confidenceLevel: string;
  safetyDisclaimer: string;
  contextUtilized: Record<string, any>;
  createdAt: string;
}

function adaptAssistantResponse(api: AssistantApiResponse): AssistantAnswer {
  return {
    question: api.question,
    lang: api.lang,
    cropType: api.crop_type,
    possibleReason: api.possible_reason,
    evidenceFromPlantImage: api.evidence_from_plant_image,
    relevantSoilMeasurements: api.relevant_soil_measurements,
    recommendedNextStep: api.recommended_next_step,
    fullResponse: api.full_response,
    confidenceLevel: api.confidence_level,
    safetyDisclaimer: api.safety_disclaimer,
    contextUtilized: api.context_utilized || {},
    createdAt: api.created_at,
  };
}

export const assistantService = {
  /**
   * Ask the AI Farmer Assistant with real-time crop, vision, and sensor context.
   * POST /api/assistant/ask
   */
  async askAssistant(payload: AssistantQueryPayload): Promise<AssistantAnswer> {
    const api = await fetchApi<AssistantApiResponse>('/assistant/ask', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return adaptAssistantResponse(api);
  },

  /**
   * Fetches active context snapshot visible to the assistant.
   * GET /api/assistant/context
   */
  async getContextSnapshot(cropType: string = 'Tomato', lang: string = 'en'): Promise<Record<string, any>> {
    return fetchApi<Record<string, any>>(
      `/assistant/context?crop_type=${encodeURIComponent(cropType)}&lang=${encodeURIComponent(lang)}`
    );
  },
};
