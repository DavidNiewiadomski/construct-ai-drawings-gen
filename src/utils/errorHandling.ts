import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Error info:', errorInfo);
    }

    // Send error report in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo);
    }

    // Call custom error handler
    this.props.onError?.(error, errorInfo);
  }

  private reportError(error: Error, errorInfo: ErrorInfo) {
    // Send error to monitoring service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // In a real app, send to error monitoring service like Sentry
    console.log('Error report:', errorReport);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo!);
      }

      return React.createElement('div', { className: 'min-h-screen flex items-center justify-center bg-background p-4' },
        React.createElement('div', { className: 'max-w-md w-full bg-card border border-border rounded-lg p-6 text-center space-y-4' },
          React.createElement('div', { className: 'text-red-500' },
            React.createElement('div', { className: 'w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center' },
              React.createElement('span', { className: 'text-2xl' }, '⚠️')
            )
          ),
          React.createElement('h2', { className: 'text-xl font-semibold text-foreground' }, 'Something went wrong'),
          React.createElement('p', { className: 'text-muted-foreground' }, "We're sorry, but something unexpected happened. The error has been logged and will be investigated."),
          React.createElement('div', { className: 'flex flex-col sm:flex-row gap-3' },
            React.createElement('button', { 
              onClick: this.handleRetry,
              className: 'px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors'
            }, 'Try Again'),
            React.createElement('button', {
              onClick: this.handleReload,
              className: 'px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors'
            }, 'Reload Page')
          )
        )
      );
    }

    return this.props.children;
  }
}

// API Error handling utilities
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export function handleApiError(error: any): string {
  if (!navigator.onLine) {
    return 'You appear to be offline. Please check your internet connection and try again.';
  }

  if (error?.message) {
    switch (error.message) {
      case 'Network request failed':
        return 'Network error. Please check your connection and try again.';
      case 'JWT expired':
        return 'Your session has expired. Please sign in again.';
      case 'Invalid JWT':
        return 'Authentication error. Please sign in again.';
      default:
        return error.message;
    }
  }

  if (error?.status) {
    switch (error.status) {
      case 400:
        return 'Bad request. Please check your input and try again.';
      case 401:
        return 'You are not authorized to perform this action.';
      case 403:
        return 'Access forbidden. You do not have permission for this action.';
      case 404:
        return 'The requested resource was not found.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return `HTTP Error ${error.status}: ${error.statusText || 'Unknown error'}`;
    }
  }

  if (error?.code) {
    switch (error.code) {
      case 'file-too-large':
        return 'File is too large. Please choose a smaller file.';
      case 'file-invalid-type':
        return 'File type not supported. Please upload a PDF, DWG, or IFC file.';
      case 'upload-failed':
        return 'File upload failed. Please try again.';
      default:
        return error.message || 'An unknown error occurred.';
    }
  }

  return 'An unexpected error occurred. Please try again.';
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
}

export function isOnline(): boolean {
  return navigator.onLine;
}

export const ErrorMessages = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  FILE_TOO_LARGE: 'File is too large. Please choose a smaller file.',
  INVALID_FILE_TYPE: 'File type not supported. Please upload a PDF, DWG, or IFC file.',
  UPLOAD_FAILED: 'File upload failed. Please try again.',
  SAVE_FAILED: 'Failed to save changes. Please try again.',
  LOAD_FAILED: 'Failed to load data. Please refresh the page.',
  AUTH_REQUIRED: 'You must be signed in to perform this action.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
  VALIDATION_ERROR: 'Please check your input and correct any errors.',
  GENERIC_ERROR: 'An unexpected error occurred. Please try again.'
} as const;