import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

// Set up PDF.js worker
const workerUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.js`;

interface PDFViewerLayerProps {
  drawingUrl?: string;
  drawingOpacity: number;
  layers: { drawing: boolean };
  onDocumentLoad: (e: any) => void;
  onPageChange: (e: any) => void;
}

export function PDFViewerLayer({
  drawingUrl,
  drawingOpacity,
  layers,
  onDocumentLoad,
  onPageChange
}: PDFViewerLayerProps) {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  if (!drawingUrl) return null;

  return (
    <Worker workerUrl={workerUrl}>
      <div 
        style={{ 
          height: '100%', 
          position: 'relative',
          opacity: layers.drawing ? drawingOpacity / 100 : 0
        }}
      >
        <Viewer
          fileUrl={drawingUrl}
          plugins={[defaultLayoutPluginInstance]}
          onDocumentLoad={onDocumentLoad}
          onPageChange={onPageChange}
        />
      </div>
    </Worker>
  );
}