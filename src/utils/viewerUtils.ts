export interface Point {
  x: number;
  y: number;
}

export function screenToWorld(point: Point, zoom: number, offset: Point): Point {
  return {
    x: (point.x - offset.x) / zoom,
    y: (point.y - offset.y) / zoom,
  };
}

export function worldToScreen(point: Point, zoom: number, offset: Point): Point {
  return {
    x: point.x * zoom + offset.x,
    y: point.y * zoom + offset.y,
  };
}

export function snapToGrid(point: Point, gridSize: number): Point {
  if (gridSize <= 0) return point;
  
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  };
}

export function formatDimension(inches: number): string {
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  
  if (feet === 0) {
    return `${remainingInches}"`;
  } else if (remainingInches === 0) {
    return `${feet}'`;
  } else {
    return `${feet}'-${remainingInches}"`;
  }
}

export function calculateDistance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function constrainPosition(
  position: Point,
  zoom: number,
  stageSize: { width: number; height: number },
  contentSize: { width: number; height: number }
): Point {
  const scaledContentWidth = contentSize.width * zoom;
  const scaledContentHeight = contentSize.height * zoom;
  
  const minX = Math.min(0, stageSize.width - scaledContentWidth);
  const maxX = Math.max(0, stageSize.width - scaledContentWidth);
  const minY = Math.min(0, stageSize.height - scaledContentHeight);
  const maxY = Math.max(0, stageSize.height - scaledContentHeight);
  
  return {
    x: Math.max(minX, Math.min(maxX, position.x)),
    y: Math.max(minY, Math.min(maxY, position.y)),
  };
}

export function getZoomToFit(
  contentSize: { width: number; height: number },
  containerSize: { width: number; height: number },
  padding: number = 50
): { zoom: number; position: Point } {
  const availableWidth = containerSize.width - padding * 2;
  const availableHeight = containerSize.height - padding * 2;
  
  const scaleX = availableWidth / contentSize.width;
  const scaleY = availableHeight / contentSize.height;
  const zoom = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%
  
  const scaledWidth = contentSize.width * zoom;
  const scaledHeight = contentSize.height * zoom;
  
  const position = {
    x: (containerSize.width - scaledWidth) / 2,
    y: (containerSize.height - scaledHeight) / 2,
  };
  
  return { zoom, position };
}