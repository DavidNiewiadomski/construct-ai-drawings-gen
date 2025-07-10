import React from 'react';

// Performance monitoring utilities for the backing generator app

interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  timestamp: number;
  props?: any;
}

interface ActionMetrics {
  action: string;
  duration: number;
  timestamp: number;
  metadata?: any;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private renderMetrics: PerformanceMetrics[] = [];
  private actionMetrics: ActionMetrics[] = [];
  private errorCount = 0;
  private isEnabled = process.env.NODE_ENV === 'development';

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Measure component render time
   */
  measureRenderTime(componentName: string, props?: any) {
    if (!this.isEnabled) return () => {};
    
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      this.renderMetrics.push({
        renderTime,
        componentName,
        timestamp: Date.now(),
        props: this.sanitizeProps(props)
      });
      
      // Log slow renders
      if (renderTime > 16) {
        console.warn(`Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
      }
      
      // Keep only last 100 measurements
      if (this.renderMetrics.length > 100) {
        this.renderMetrics = this.renderMetrics.slice(-100);
      }
    };
  }

  /**
   * Track user actions and their performance
   */
  trackAction(action: string, metadata?: any): () => void {
    if (!this.isEnabled) return () => {};
    
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.actionMetrics.push({
        action,
        duration,
        timestamp: Date.now(),
        metadata
      });
      
      // Send to analytics if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'timing_complete', {
          name: action,
          value: Math.round(duration)
        });
      }
      
      // Log slow actions
      if (duration > 1000) {
        console.warn(`Slow action detected: ${action} took ${duration.toFixed(2)}ms`);
      }
      
      // Keep only last 50 measurements
      if (this.actionMetrics.length > 50) {
        this.actionMetrics = this.actionMetrics.slice(-50);
      }
    };
  }

  /**
   * Report errors with context
   */
  reportError(error: Error, context?: any): void {
    this.errorCount++;
    
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      context: this.sanitizeProps(context),
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    console.error('Application Error:', errorInfo);
    
    // Send to error tracking service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: false
      });
    }
    
    // In production, you might send to a service like Sentry
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { contexts: { custom: context } });
    }
  }

  /**
   * Measure file processing performance
   */
  measureFileProcessing(fileName: string, fileSize: number) {
    const startTime = performance.now();
    
    return {
      markStage: (stage: string) => {
        const stageTime = performance.now() - startTime;
        console.log(`File processing (${fileName}): ${stage} completed in ${stageTime.toFixed(2)}ms`);
      },
      complete: () => {
        const totalTime = performance.now() - startTime;
        const throughput = fileSize / (totalTime / 1000); // bytes per second
        
        console.log(`File processing completed: ${fileName} (${fileSize} bytes) in ${totalTime.toFixed(2)}ms`);
        console.log(`Throughput: ${(throughput / 1024 / 1024).toFixed(2)} MB/s`);
        
        return {
          fileName,
          fileSize,
          duration: totalTime,
          throughput
        };
      }
    };
  }

  /**
   * Get performance report
   */
  getPerformanceReport() {
    const avgRenderTime = this.renderMetrics.length > 0 
      ? this.renderMetrics.reduce((sum, m) => sum + m.renderTime, 0) / this.renderMetrics.length
      : 0;
    
    const slowestRenders = [...this.renderMetrics]
      .sort((a, b) => b.renderTime - a.renderTime)
      .slice(0, 5);
    
    const avgActionTime = this.actionMetrics.length > 0
      ? this.actionMetrics.reduce((sum, m) => sum + m.duration, 0) / this.actionMetrics.length
      : 0;
    
    const slowestActions = [...this.actionMetrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);
    
    return {
      renderMetrics: {
        count: this.renderMetrics.length,
        averageTime: avgRenderTime,
        slowestRenders
      },
      actionMetrics: {
        count: this.actionMetrics.length,
        averageTime: avgActionTime,
        slowestActions
      },
      errorCount: this.errorCount,
      memoryUsage: this.getMemoryUsage()
    };
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.renderMetrics = [];
    this.actionMetrics = [];
    this.errorCount = 0;
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  private sanitizeProps(props: any): any {
    if (!props) return undefined;
    
    try {
      // Remove functions and complex objects that can't be serialized
      return JSON.parse(JSON.stringify(props, (key, value) => {
        if (typeof value === 'function') return '[Function]';
        if (value instanceof HTMLElement) return '[HTMLElement]';
        if (value instanceof Error) return { message: value.message, stack: value.stack };
        return value;
      }));
    } catch {
      return '[Complex Object]';
    }
  }

  private getMemoryUsage() {
    if ('memory' in performance) {
      return {
        used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return null;
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// React hook for component performance monitoring
export function usePerformanceMonitor(componentName: string, props?: any) {
  const measureEnd = performanceMonitor.measureRenderTime(componentName, props);
  
  // Call measureEnd in useEffect to measure after render
  return measureEnd;
}

// Higher-order component for automatic performance monitoring
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  return function PerformanceMonitoredComponent(props: P) {
    const name = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Unknown';
    const measureEnd = usePerformanceMonitor(name, props);
    
    React.useEffect(() => {
      measureEnd();
    });
    
    return React.createElement(WrappedComponent, props);
  };
}

// Utility functions for specific measurements
export const performanceUtils = {
  measureAsync: async <T>(name: string, asyncFn: () => Promise<T>): Promise<T> => {
    const trackEnd = performanceMonitor.trackAction(name);
    try {
      const result = await asyncFn();
      trackEnd();
      return result;
    } catch (error) {
      trackEnd();
      performanceMonitor.reportError(error as Error, { action: name });
      throw error;
    }
  },

  measureSync: <T>(name: string, syncFn: () => T): T => {
    const trackEnd = performanceMonitor.trackAction(name);
    try {
      const result = syncFn();
      trackEnd();
      return result;
    } catch (error) {
      trackEnd();
      performanceMonitor.reportError(error as Error, { action: name });
      throw error;
    }
  },

  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate = false
  ): T => {
    let timeout: NodeJS.Timeout | null = null;
    
    return ((...args: any[]) => {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      
      const callNow = immediate && !timeout;
      
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      
      if (callNow) func(...args);
    }) as T;
  }
};
