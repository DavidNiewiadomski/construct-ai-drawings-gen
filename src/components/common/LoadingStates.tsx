import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader, FileText, Upload, Zap, CheckCircle, AlertCircle } from 'lucide-react';

// Generic loading spinner
export function LoadingSpinner({ size = 'default' }: { size?: 'sm' | 'default' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <Loader className={`animate-spin ${sizeClasses[size]}`} />
  );
}

// Full page loading
export function PageLoading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

// File upload loading states
export function FileUploadLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 p-4 border rounded-lg">
        <Upload className="h-5 w-5 text-primary animate-pulse" />
        <div className="flex-1">
          <Skeleton className="h-4 w-48 mb-2" />
          <Skeleton className="h-3 w-32" />
        </div>
        <LoadingSpinner size="sm" />
      </div>
      <div className="flex items-center space-x-3 p-4 border rounded-lg">
        <FileText className="h-5 w-5 text-muted-foreground" />
        <div className="flex-1">
          <Skeleton className="h-4 w-56 mb-2" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );
}

// AI processing status
export function AIProcessingStatus({ stage, progress }: { stage: string; progress: number }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Zap className="h-5 w-5 text-primary animate-pulse" />
          <div>
            <h3 className="font-semibold">AI Processing</h3>
            <p className="text-sm text-muted-foreground">{stage}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {progress}% complete
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Drawing viewer loading skeleton
export function DrawingViewerSkeleton() {
  return (
    <div className="h-full bg-muted/30 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-muted rounded-lg mx-auto flex items-center justify-center">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 mx-auto" />
          <Skeleton className="h-3 w-48 mx-auto" />
        </div>
      </div>
    </div>
  );
}

// Settings panel loading
export function SettingsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </div>
    </div>
  );
}

// Success state components
export function SuccessMessage({ 
  title, 
  message, 
  onAction, 
  actionLabel = 'Continue' 
}: { 
  title: string; 
  message: string; 
  onAction?: () => void; 
  actionLabel?: string; 
}) {
  return (
    <div className="text-center space-y-4 p-6">
      <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-muted-foreground">{message}</p>
      </div>
      {onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// Error state components
export function ErrorMessage({ 
  title, 
  message, 
  onRetry, 
  retryLabel = 'Try Again' 
}: { 
  title: string; 
  message: string; 
  onRetry?: () => void; 
  retryLabel?: string; 
}) {
  return (
    <div className="text-center space-y-4 p-6">
      <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}

// Empty state components
export function EmptyState({ 
  icon: Icon, 
  title, 
  message, 
  onAction, 
  actionLabel 
}: { 
  icon: React.ComponentType<any>; 
  title: string; 
  message: string; 
  onAction?: () => void; 
  actionLabel?: string; 
}) {
  return (
    <div className="text-center space-y-4 p-8">
      <Icon className="h-12 w-12 text-muted-foreground mx-auto" />
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-muted-foreground">{message}</p>
      </div>
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}