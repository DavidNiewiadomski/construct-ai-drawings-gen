import { Point } from '@/types';

// Convert decimal feet to feet-inches format
export const formatFeetInches = (decimalFeet: number): string => {
  const feet = Math.floor(Math.abs(decimalFeet));
  const inches = Math.round((Math.abs(decimalFeet) - feet) * 12);
  
  if (inches === 0) {
    return `${feet}'`;
  } else if (inches === 12) {
    return `${feet + 1}'`;
  } else {
    return `${feet}'-${inches}"`;
  }
};

// Calculate distance between two points
export const calculateDistance = (point1: Point, point2: Point): number => {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// Calculate total distance for multiple points
export const calculateTotalDistance = (points: Point[]): number => {
  if (points.length < 2) return 0;
  
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    total += calculateDistance(points[i], points[i + 1]);
  }
  return total;
};

// Get midpoint between two points
export const getMidpoint = (point1: Point, point2: Point): Point => {
  return {
    x: (point1.x + point2.x) / 2,
    y: (point1.y + point2.y) / 2
  };
};

// Calculate angle between two points (in degrees)
export const calculateAngle = (point1: Point, point2: Point): number => {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.atan2(dy, dx) * (180 / Math.PI);
};