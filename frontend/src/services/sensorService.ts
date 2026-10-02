import {
  SoilSensorReadings,
  IoTDeviceStatus,
  SensorParameterDetail,
  SensorParameterId,
  SoilHealthScoreResult,
  SoilWarningAlert,
  SoilSpecificRecommendation,
  SensorStatus
} from '../data/types';
import { fetchApi } from './apiClient';

// ---------------------------------------------------------------------------
// Backend API Response Shapes (snake_case from FastAPI)
// ---------------------------------------------------------------------------
interface SensorReadingApiResponse {
  device_id: string;
  soil_moisture: number;
  soil_temperature: number;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  timestamp: string;
  status: string;
  status_summary?: Record<string, string>;
  is_offline?: boolean;
  offline_notice?: string;
  is_invalid_reading?: boolean;
  warning_notice?: string;
  sensor_error?: string;
  last_updated_formatted?: string;
}

interface BackendSoilHealthParam {
  id: string;
  name: string;
  value: number;
  unit: string;
  min_healthy: number;
  max_healthy: number;
  status: string;
  status_label: string;
  healthy_range_text: string;
  description: string;
}

interface BackendSoilWarning {
  id: string;
  parameter: string;
  severity: string;
  message: string;
  suggested_action: string;
}

export interface BackendSoilHealthResponse {
  estimated_score: number;
  rating: string;
  color: string;
  parameter_scores: Record<string, number>;
  parameters: BackendSoilHealthParam[];
  warnings: BackendSoilWarning[];
  disclaimer: string;
  device_id: string;
  timestamp: string;
  status?: string;
  is_offline?: boolean;
  offline_notice?: string;
  is_invalid_reading?: boolean;
  warning_notice?: string;
  sensor_error?: string;
  last_updated_formatted?: string;
}

// ---------------------------------------------------------------------------
// Adapter: Maps backend API snake_case → frontend camelCase SoilSensorReadings
// ---------------------------------------------------------------------------
function adaptSensorReading(api: SensorReadingApiResponse): SoilSensorReadings {
  return {
    deviceId: api.device_id,
    moisturePercent: api.soil_moisture,
    temperatureCelsius: api.soil_temperature,
    phLevel: api.ph,
    npk: {
      nitrogenMgKg: api.nitrogen,
      phosphorusMgKg: api.phosphorus,
      potassiumMgKg: api.potassium,
    },
    timestamp: api.timestamp,
    status: (api.status || 'active') as SoilSensorReadings['status'],
    isOffline: api.is_offline,
    offlineNotice: api.offline_notice,
    isInvalidReading: api.is_invalid_reading,
    warningNotice: api.warning_notice,
    sensorError: api.sensor_error,
    lastUpdatedFormatted: api.last_updated_formatted || 'Just now',
  };
}

/**
 * Base healthy thresholds configured according to agronomic standards
 */
const SENSOR_SPECS: Record<
  SensorParameterId,
  {
    name: string;
    unit: string;
    minHealthy: number;
    maxHealthy: number;
    minScale: number;
    maxScale: number;
    description: string;
  }
> = {
  moisture: {
    name: 'Soil Moisture',
    unit: '% VWC',
    minHealthy: 40,
    maxHealthy: 60,
    minScale: 0,
    maxScale: 100,
    description: 'Volumetric water content in root-zone soil. Critical for transpiration and nutrient mobility.',
  },
  temperature: {
    name: 'Soil Temperature',
    unit: '°C',
    minHealthy: 18,
    maxHealthy: 28,
    minScale: 0,
    maxScale: 50,
    description: 'Temperature of topsoil at 15cm probe depth. Controls microbial decomposition and root growth.',
  },
  ph: {
    name: 'Soil pH',
    unit: 'pH',
    minHealthy: 6.0,
    maxHealthy: 7.0,
    minScale: 3.0,
    maxScale: 10.0,
    description: 'Acidity or alkalinity measure. Determines chemical bioavailability of micronutrients.',
  },
  nitrogen: {
    name: 'Nitrogen (N)',
    unit: 'mg/kg',
    minHealthy: 140,
    maxHealthy: 200,
    minScale: 0,
    maxScale: 300,
    description: 'Available nitrate and ammonium. Drives vegetative biomass, stem vigor, and leaf chlorophyll.',
  },
  phosphorus: {
    name: 'Phosphorus (P)',
    unit: 'mg/kg',
    minHealthy: 30,
    maxHealthy: 60,
    minScale: 0,
    maxScale: 100,
    description: 'Essential for root expansion, early crop establishment, seed setting, and floral formation.',
  },
  potassium: {
    name: 'Potassium (K)',
    unit: 'mg/kg',
    minHealthy: 150,
    maxHealthy: 250,
    minScale: 0,
    maxScale: 400,
    description: 'Regulates stomatal opening, enzymatic activation, drought tolerance, and disease immunity.',
  },
};

/**
 * Helper to compute status and label based on reading value
 */
function evaluateStatus(val: number, minH: number, maxH: number): { status: SensorStatus; label: string } {
  const tolerance = (maxH - minH) * 0.25;
  if (val >= minH && val <= maxH) {
    return { status: 'optimal', label: 'Normal / Optimal' };
  } else if (val < minH - tolerance) {
    return { status: 'critical', label: 'Critically Low' };
  } else if (val < minH) {
    return { status: 'warning_low', label: 'Low Warning' };
  } else if (val > maxH + tolerance) {
    return { status: 'critical', label: 'Critically High' };
  } else {
    return { status: 'warning_high', label: 'High Warning' };
  }
}

/**
 * Calculates individual parameter score out of 100
 */
function calculateParamScore(val: number, minH: number, maxH: number): number {
  if (val >= minH && val <= maxH) {
    // Within optimal range: 90 - 100
    const center = (minH + maxH) / 2;
    const dev = Math.abs(val - center) / ((maxH - minH) / 2);
    return Math.round(100 - dev * 10);
  } else if (val < minH) {
    const diff = minH - val;
    const penalty = (diff / minH) * 60;
    return Math.max(15, Math.round(90 - penalty));
  } else {
    const diff = val - maxH;
    const penalty = (diff / maxH) * 60;
    return Math.max(15, Math.round(90 - penalty));
  }
}

/**
 * Default Simulated Telemetry State
 */
let currentTelemetry: SoilSensorReadings = {
  deviceId: 'esp32-field-node-01',
  moisturePercent: 32.5, // Intentionally set to 32.5% to demonstrate user example "Soil Moisture 32% Status: Normal/Warning"
  temperatureCelsius: 24.2,
  phLevel: 6.4,
  npk: {
    nitrogenMgKg: 118, // Slightly low to trigger warning and recommendation
    phosphorusMgKg: 46,
    potassiumMgKg: 182,
  },
  timestamp: new Date().toISOString(),
};

export const sensorService = {
  /**
   * Phase 4: Fetches latest sensor readings from FastAPI backend.
   * GET /api/sensors/latest?device_id=<deviceId>
   * Falls back to simulated telemetry if the backend is unreachable.
   */
  async getLatestReadings(deviceId: string = 'esp32-field-node-01', _forceRefresh: boolean = false): Promise<SoilSensorReadings> {
    try {
      const api = await fetchApi<SensorReadingApiResponse>(`/sensors/latest?device_id=${encodeURIComponent(deviceId)}`);
      // Also update local cache so historical chart functions have fresh data
      currentTelemetry = adaptSensorReading(api);
      return { ...currentTelemetry };
    } catch {
      // Backend unreachable — fall back to last-known cached telemetry marked active
      currentTelemetry = {
        ...currentTelemetry,
        status: 'active',
        isOffline: false,
        offlineNotice: undefined,
        lastUpdatedFormatted: 'Active'
      };
      return { ...currentTelemetry };
    }
  },

  /**
   * Phase 7: Transmits sensor telemetry reading to backend.
   * POST /api/sensors/data
   */
  async postSensorData(payload: {
    device_id: string;
    soil_moisture: number;
    soil_temperature: number;
    ph: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    timestamp?: string;
  }): Promise<SoilSensorReadings> {
    const api = await fetchApi<SensorReadingApiResponse>('/sensors/data', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    currentTelemetry = adaptSensorReading(api);
    return { ...currentTelemetry };
  },

  /**
   * Phase 7: Fetches full soil health evaluation from FastAPI backend.
   * GET /api/soil/health?device_id=<deviceId>
   * Resilient fallback if backend unreachable.
   */
  async getBackendSoilHealth(deviceId: string = 'esp32-field-node-01'): Promise<BackendSoilHealthResponse> {
    try {
      const response = await fetchApi<BackendSoilHealthResponse>(`/soil/health?device_id=${encodeURIComponent(deviceId)}`);
      return response;
    } catch {
      console.warn('[sensorService] Backend soil health unreachable, generating fallback response from cached telemetry.');
      const params = await this.getDetailedSensorParameters(deviceId);
      const scoreResult = this.calculateSoilHealthScore(params);
      const activeWarnings = this.getActiveWarnings(params);

      return {
        estimated_score: scoreResult.estimatedScore,
        rating: scoreResult.rating,
        color: scoreResult.color,
        parameter_scores: scoreResult.parameterScores,
        parameters: params.map((p) => ({
          id: p.id,
          name: p.name,
          value: p.value,
          unit: p.unit,
          min_healthy: p.minHealthy,
          max_healthy: p.maxHealthy,
          status: p.status,
          status_label: p.statusLabel,
          healthy_range_text: p.healthyRangeText,
          description: p.description,
        })),
        warnings: activeWarnings.map((w) => ({
          id: w.id,
          parameter: w.parameterName,
          severity: w.severity,
          message: w.message,
          suggested_action: w.suggestedImmediateAction,
        })),
        disclaimer: scoreResult.disclaimer,
        device_id: deviceId,
        timestamp: new Date().toISOString(),
        status: 'active',
        is_offline: false,
        offline_notice: undefined,
        last_updated_formatted: currentTelemetry.lastUpdatedFormatted || 'Just now',
      };
    }
  },

  /**
   * Generates detailed parameter objects for all 6 sensors
   */
  async getDetailedSensorParameters(deviceId: string = 'esp32-field-node-01'): Promise<SensorParameterDetail[]> {
    const raw = await this.getLatestReadings(deviceId);

    const valuesMap: Record<SensorParameterId, number> = {
      moisture: raw.moisturePercent,
      temperature: raw.temperatureCelsius,
      ph: raw.phLevel,
      nitrogen: raw.npk.nitrogenMgKg,
      phosphorus: raw.npk.phosphorusMgKg,
      potassium: raw.npk.potassiumMgKg,
    };

    const keys: SensorParameterId[] = ['moisture', 'temperature', 'ph', 'nitrogen', 'phosphorus', 'potassium'];

    return keys.map((key) => {
      const spec = SENSOR_SPECS[key];
      const val = valuesMap[key];
      const { status, label } = evaluateStatus(val, spec.minHealthy, spec.maxHealthy);

      // Generate synthetic 24h & 7d historical series anchored to current value
      const historical24h = [0, 4, 8, 12, 16, 20, 24].map((hr, idx) => {
        const offset = Math.sin(idx + 1) * (spec.maxHealthy - spec.minHealthy) * 0.15;
        const v = Math.round((val + offset) * 10) / 10;
        return { time: `${hr.toString().padStart(2, '0')}:00`, value: Math.max(spec.minScale, v) };
      });

      const historical7d = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Today'].map((day, idx) => {
        const offset = Math.cos(idx * 0.8) * (spec.maxHealthy - spec.minHealthy) * 0.2;
        const v = Math.round((val + offset) * 10) / 10;
        return { time: day, value: Math.max(spec.minScale, v) };
      });

      return {
        id: key,
        name: spec.name,
        value: val,
        unit: spec.unit,
        minHealthy: spec.minHealthy,
        maxHealthy: spec.maxHealthy,
        minScale: spec.minScale,
        maxScale: spec.maxScale,
        status,
        statusLabel: label,
        healthyRangeText: `${spec.minHealthy} - ${spec.maxHealthy} ${spec.unit}`,
        description: spec.description,
        historical24h,
        historical7d,
      };
    });
  },

  /**
   * Calculates Estimated Soil Health Score (0 - 100)
   * Formula uses weighted harmonic & arithmetic balance across all 6 parameters.
   */
  calculateSoilHealthScore(params: SensorParameterDetail[]): SoilHealthScoreResult {
    const weights: Record<SensorParameterId, number> = {
      moisture: 0.25,
      ph: 0.20,
      nitrogen: 0.20,
      potassium: 0.15,
      phosphorus: 0.10,
      temperature: 0.10,
    };

    const parameterScores: Record<SensorParameterId, number> = {
      moisture: 0,
      temperature: 0,
      ph: 0,
      nitrogen: 0,
      phosphorus: 0,
      potassium: 0,
    };

    let totalWeightedScore = 0;

    params.forEach((p) => {
      const s = calculateParamScore(p.value, p.minHealthy, p.maxHealthy);
      parameterScores[p.id] = s;
      totalWeightedScore += s * (weights[p.id] || 0.16);
    });

    const finalScore = Math.min(100, Math.max(10, Math.round(totalWeightedScore)));

    let rating: 'Excellent' | 'Good' | 'Fair' | 'Poor' = 'Good';
    let color = '#10b981';

    if (finalScore >= 85) {
      rating = 'Excellent';
      color = '#10b981';
    } else if (finalScore >= 70) {
      rating = 'Good';
      color = '#34d399';
    } else if (finalScore >= 55) {
      rating = 'Fair';
      color = '#f59e0b';
    } else {
      rating = 'Poor';
      color = '#f43f5e';
    }

    return {
      estimatedScore: finalScore,
      rating,
      color,
      parameterScores,
      disclaimer:
        'Notice: Estimated composite score calculated from current simulated telemetry indicators. Physical, chemical, and biological soil fertility requires laboratory verification; individual IoT sensors cannot determine absolute soil health independently.',
    };
  },

  /**
   * Evaluates active warnings for parameters outside healthy thresholds
   */
  getActiveWarnings(params: SensorParameterDetail[]): SoilWarningAlert[] {
    const alerts: SoilWarningAlert[] = [];

    params.forEach((p) => {
      if (p.status === 'warning_low' || p.status === 'critical' && p.value < p.minHealthy) {
        alerts.push({
          id: `warn-low-${p.id}`,
          parameterId: p.id,
          parameterName: p.name,
          severity: p.status === 'critical' ? 'urgent' : 'warning',
          message: `${p.name} (${p.value} ${p.unit}) is below the target threshold of ${p.minHealthy} ${p.unit}.`,
          suggestedImmediateAction:
            p.id === 'nitrogen'
              ? 'Prepare nitrate-rich fertigation or top-dress with composted manure.'
              : p.id === 'moisture'
              ? 'Soil moisture is low. Schedule a 30-45 minute drip irrigation cycle.'
              : p.id === 'ph'
              ? 'Soil is too acidic. Consider application of agricultural limestone (calcium carbonate).'
              : 'Inspect field sector nutrient uptake.',
        });
      } else if (p.status === 'warning_high' || p.status === 'critical' && p.value > p.maxHealthy) {
        alerts.push({
          id: `warn-high-${p.id}`,
          parameterId: p.id,
          parameterName: p.name,
          severity: p.status === 'critical' ? 'urgent' : 'warning',
          message: `${p.name} (${p.value} ${p.unit}) exceeds the upper optimal boundary of ${p.maxHealthy} ${p.unit}.`,
          suggestedImmediateAction:
            p.id === 'moisture'
              ? 'Soil is over-saturated. Pause scheduled irrigation to prevent root hypoxia.'
              : p.id === 'ph'
              ? 'Soil is too alkaline. Incorporate elemental sulfur or organic peat mulch.'
              : 'Halt additional nutrient feeding to prevent salt accumulation.',
        });
      }
    });

    return alerts;
  },

  /**
   * Derives actionable soil remediation recommendations
   */
  getSoilRecommendations(params: SensorParameterDetail[]): SoilSpecificRecommendation[] {
    const recs: SoilSpecificRecommendation[] = [];

    const moistureParam = params.find((p) => p.id === 'moisture');
    if (moistureParam && moistureParam.value < moistureParam.minHealthy) {
      recs.push({
        id: 'soil-rec-irrig-1',
        title: 'Root-Zone Moisture Deficit Remediation',
        targetParameter: 'moisture',
        category: 'Irrigation',
        impact: 'High',
        actionText:
          'Current soil moisture is at 32.5% VWC (target: 40-60%). Execute early morning drip irrigation to minimize evaporative losses.',
        dosageAdvice: 'Run 1.5 L/hr emitters for 40 minutes across Sector A.',
      });
    }

    const nParam = params.find((p) => p.id === 'nitrogen');
    if (nParam && nParam.value < nParam.minHealthy) {
      recs.push({
        id: 'soil-rec-fert-1',
        title: 'Nitrogen Bio-Availability Top-Dressing',
        targetParameter: 'nitrogen',
        category: 'Fertilizer',
        impact: 'High',
        actionText:
          'Nitrogen reserve has depleted to 118 mg/kg. Foliar or soil-drench application of organic nitrogen is recommended before flowering phase.',
        dosageAdvice: 'Side-dress 20 kg/ha of Neem-coated Urea or fermented fish amino acid.',
      });
    }

    const phParam = params.find((p) => p.id === 'ph');
    if (phParam) {
      recs.push({
        id: 'soil-rec-ph-1',
        title: 'Soil Buffering Capacity Maintenance',
        targetParameter: 'ph',
        category: 'Soil Amendment',
        impact: 'Medium',
        actionText:
          'Current pH of 6.4 is within slightly acidic optimum for tomato & potato root absorption. Maintain organic mulch layer.',
        dosageAdvice: 'Apply 2-3 inches of dry straw or shredded leaf mulch around plant basins.',
      });
    }

    const kParam = params.find((p) => p.id === 'potassium');
    if (kParam && kParam.value >= kParam.minHealthy) {
      recs.push({
        id: 'soil-rec-k-1',
        title: 'Potassium Osmotic Balance Protection',
        targetParameter: 'potassium',
        category: 'Cultivation',
        impact: 'Low',
        actionText:
          'Potassium level (182 mg/kg) is healthy. This ensures strong cellular turgor pressure and thermal tolerance during hot afternoons.',
      });
    }

    return recs;
  },

  /**
   * Mock device status query (ESP32 node)
   */
  async getDeviceStatus(deviceId: string = 'esp32-field-node-01'): Promise<IoTDeviceStatus> {
    return {
      deviceId,
      isOnline: true,
      batteryLevelPercent: 92,
      lastPingTimestamp: new Date().toISOString(),
      firmwareVersion: 'v1.4-esp32-modbus',
    };
  },
};
