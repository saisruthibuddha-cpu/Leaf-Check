import { PlantAnalysisResult, SupportedCrop } from '../data/types';
import { fetchApi } from './apiClient';

// ---------------------------------------------------------------------------
// Backend API Response Shape (snake_case from FastAPI / Pydantic)
// ---------------------------------------------------------------------------
interface PlantAnalysisApiResponse {
  analysis_id: string;
  crop_type: string;
  health_status: string;
  disease: string;
  scientific_name?: string;
  confidence: number;
  explanation: string;
  recommended_actions: string[];
  severity: string;
  image_url: string;
  class_probabilities?: Record<string, number>;
  gradcam_image?: string;
  is_low_confidence?: boolean;
  ai_disclaimer?: string;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Adapter: Maps API snake_case response → frontend camelCase interface
// ---------------------------------------------------------------------------
function adaptPlantAnalysisResponse(api: PlantAnalysisApiResponse): PlantAnalysisResult {
  return {
    analysisId: api.analysis_id,
    cropType: api.crop_type as SupportedCrop,
    healthStatus: api.health_status as PlantAnalysisResult['healthStatus'],
    disease: api.disease,
    scientificName: api.scientific_name,
    confidence: api.confidence,
    explanation: api.explanation,
    recommendedActions: api.recommended_actions,
    severity: api.severity as PlantAnalysisResult['severity'],
    imageUrl: api.image_url,
    classProbabilities: api.class_probabilities,
    gradcamImage: api.gradcam_image,
    isLowConfidence: api.is_low_confidence,
    aiDisclaimer: api.ai_disclaimer,
    timestamp: api.timestamp,
  };
}

export const plantService = {
  /**
   * Phase 4: Sends leaf image + crop type to FastAPI backend.
   * POST /api/analyze-plant (multipart/form-data)
   * Returns real mock diagnostic result from backend service.
   *
   * When a URL string is passed (sample presets), it fetches the resource
   * and wraps it in a Blob before sending – preserving the same UX.
   */
  async analyzePlant(
    imageSource: File | string,
    cropType: SupportedCrop
  ): Promise<PlantAnalysisResult> {
    const formData = new FormData();

    if (imageSource instanceof File) {
      formData.append('image', imageSource);
    } else {
      // Sample preset: imageSource is a URL string – fetch blob
      try {
        const response = await fetch(imageSource);
        const blob = await response.blob();
        const filename = imageSource.split('/').pop() || 'sample.jpg';
        formData.append('image', new File([blob], filename, { type: blob.type || 'image/jpeg' }));
      } catch {
        // If the sample image URL is remote/cross-origin or offline, create a valid 64x64 PNG fallback blob
        const base64Png =
          'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAiSURBVHhe7cEBDQAAAMKg909tDwcUAAAAAAAAAAAAAOA1DW7AAAF4u3YfAAAAAElFTkSuQmCC';
        const bin = atob(base64Png);
        const arr = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
        const validBlob = new Blob([arr], { type: 'image/png' });
        formData.append('image', new File([validBlob], 'sample.png', { type: 'image/png' }));
      }
    }

    formData.append('crop_type', cropType);

    const apiResponse = await fetchApi<PlantAnalysisApiResponse>('/analyze-plant', {
      method: 'POST',
      body: formData,
    });

    return adaptPlantAnalysisResponse(apiResponse);
  },

  /**
   * Validates uploaded file format and size before sending to backend.
   */
  validatePlantImage(file: File): { isValid: boolean; errorReason?: string } {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return {
        isValid: false,
        errorReason: 'Invalid image format. Please upload JPG, PNG, or WEBP leaf imagery.',
      };
    }
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSizeBytes) {
      return {
        isValid: false,
        errorReason: 'File size exceeds 10MB limit. Please upload a smaller leaf image.',
      };
    }
    return { isValid: true };
  },
};
