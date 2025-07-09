import { Point } from '@/types';

export const snapToGrid = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize;
};

export const snapPoint = (point: Point, gridSize: number, enabled: boolean): Point => {
  if (!enabled) return point;
  return {
    x: snapToGrid(point.x, gridSize),
    y: snapToGrid(point.y, gridSize)
  };
};