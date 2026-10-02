import { useState } from 'react';
import { PlantAnalysisResult, SupportedCrop } from '../data/types';
import { plantService } from '../services/plantService';

export function usePlantAnalysis() {
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<PlantAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeImage = async (file: File | string, cropType: SupportedCrop = 'Tomato') => {
    try {
      setAnalyzing(true);
      setError(null);
      const data = await plantService.analyzePlant(file, cropType);
      setResult(data);
      return data;
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Plant analysis failed';
      setError(msg);
      throw err;
    } finally {
      setAnalyzing(false);
    }
  };

  return { analyzeImage, analyzing, result, error };
}
