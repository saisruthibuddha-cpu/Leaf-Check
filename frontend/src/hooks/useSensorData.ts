import { useState, useEffect, useCallback } from 'react';
import { SoilSensorReadings } from '../data/types';
import { sensorService } from '../services/sensorService';

export function useSensorData(deviceId: string = 'esp32-field-node-01', pollIntervalMs: number = 3000) {
  const [readings, setReadings] = useState<SoilSensorReadings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTelemetry = useCallback(async (isInitial: boolean = false) => {
    try {
      if (isInitial) setLoading(true);
      const data = await sensorService.getLatestReadings(deviceId);
      setReadings(data);
      setError(null);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to fetch sensor readings');
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    let isMounted = true;
    
    if (deviceId) {
      fetchTelemetry(true);
    }

    // Auto-polling interval for real-time ESP32 sensor updates
    const timer = setInterval(() => {
      if (isMounted && deviceId) {
        fetchTelemetry(false);
      }
    }, pollIntervalMs);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [deviceId, pollIntervalMs, fetchTelemetry]);

  return { readings, loading, error, refetch: () => fetchTelemetry(false) };
}
