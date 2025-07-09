import { useState, useRef, useCallback } from 'react';
import { DocumentLoadEvent, PageChangeEvent } from '@react-pdf-viewer/core';
import { coordinateSystem } from '@/utils/coordinateSystem';

export function useDrawingViewer() {
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [drawingOpacity, setDrawingOpacity] = useState(100);

  // Update PDF dimensions and coordinate system
  const updatePdfDimensions = useCallback(() => {
    if (pdfContainerRef.current) {
      const pdfElement = pdfContainerRef.current.querySelector('.rpv-core__page-layer');
      if (pdfElement) {
        const rect = pdfElement.getBoundingClientRect();
        const containerRect = pdfContainerRef.current.getBoundingClientRect();
        
        const pdfBounds = {
          width: rect.width,
          height: rect.height,
          x: rect.left - containerRect.left,
          y: rect.top - containerRect.top
        };
        
        setPdfDimensions({
          width: rect.width,
          height: rect.height
        });
        
        // Update coordinate system with PDF bounds
        coordinateSystem.updatePdfBounds(pdfBounds);
      }
    }
  }, []);

  // Handle PDF document load
  const handleDocumentLoad = useCallback((e: DocumentLoadEvent) => {
    setTotalPages(e.doc.numPages);
    setIsLoading(false);
    
    // Get PDF container dimensions for overlay alignment
    setTimeout(() => {
      updatePdfDimensions();
    }, 100);
  }, [updatePdfDimensions]);

  // Handle page change
  const handlePageChange = useCallback((e: PageChangeEvent) => {
    setCurrentPage(e.currentPage);
    
    // Update PDF dimensions when page changes
    setTimeout(() => {
      updatePdfDimensions();
    }, 100);
  }, [updatePdfDimensions]);

  // Handle page navigation from toolbar
  const handlePageNavigation = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Initialize loading state when URL is provided
  const setDrawingUrl = useCallback((url?: string) => {
    setIsLoading(!!url);
  }, []);

  return {
    pdfContainerRef,
    pdfDimensions,
    currentPage,
    totalPages,
    isLoading,
    drawingOpacity,
    setDrawingOpacity,
    handleDocumentLoad,
    handlePageChange,
    handlePageNavigation,
    setDrawingUrl,
    updatePdfDimensions
  };
}