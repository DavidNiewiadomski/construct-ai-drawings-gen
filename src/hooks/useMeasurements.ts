import { useState, useCallback } from 'react';
import { Point, Measurement } from '@/types';
import { calculateDistance } from '@/utils/measurements';

export function useMeasurements() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [selectedMeasurementId, setSelectedMeasurementId] = useState<string | undefined>();
  const [isDrawingMeasurement, setIsDrawingMeasurement] = useState(false);
  const [measurementStartPoint, setMeasurementStartPoint] = useState<Point | null>(null);

  // Start drawing a measurement
  const startMeasurement = useCallback((startPoint: Point) => {
    setMeasurementStartPoint(startPoint);
    setIsDrawingMeasurement(true);
  }, []);

  // Complete measurement
  const completeMeasurement = useCallback((endPoint: Point) => {
    if (!measurementStartPoint) return;

    const distance = calculateDistance(measurementStartPoint, endPoint);
    const newMeasurement: Measurement = {
      id: crypto.randomUUID(),
      startPoint: measurementStartPoint,
      endPoint,
      distance,
      createdAt: new Date().toISOString()
    };

    setMeasurements(prev => [...prev, newMeasurement]);
    setMeasurementStartPoint(null);
    setIsDrawingMeasurement(false);
    setSelectedMeasurementId(newMeasurement.id);
  }, [measurementStartPoint]);

  // Cancel current measurement
  const cancelMeasurement = useCallback(() => {
    setMeasurementStartPoint(null);
    setIsDrawingMeasurement(false);
  }, []);

  // Select measurement
  const selectMeasurement = useCallback((id: string) => {
    setSelectedMeasurementId(id);
  }, []);

  // Delete measurement
  const deleteMeasurement = useCallback((id: string) => {
    setMeasurements(prev => prev.filter(m => m.id !== id));
    if (selectedMeasurementId === id) {
      setSelectedMeasurementId(undefined);
    }
  }, [selectedMeasurementId]);

  // Clear all measurements
  const clearAllMeasurements = useCallback(() => {
    setMeasurements([]);
    setSelectedMeasurementId(undefined);
    setMeasurementStartPoint(null);
    setIsDrawingMeasurement(false);
  }, []);

  // Update measurement
  const updateMeasurement = useCallback((id: string, updates: Partial<Measurement>) => {
    setMeasurements(prev => prev.map(m => 
      m.id === id ? { ...m, ...updates } : m
    ));
  }, []);

  return {
    measurements,
    selectedMeasurementId,
    isDrawingMeasurement,
    measurementStartPoint,
    startMeasurement,
    completeMeasurement,
    cancelMeasurement,
    selectMeasurement,
    deleteMeasurement,
    clearAllMeasurements,
    updateMeasurement
  };
}