import { Card, CardContent } from '@/components/ui/card';

export function FileCardSkeleton() {
  return (
    <Card className="w-full animate-pulse">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-3">
          {/* Thumbnail skeleton */}
          <div className="w-full h-32 bg-muted rounded relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
          
          {/* File info skeleton */}
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
          
          {/* Type selector skeleton */}
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded w-16" />
            <div className="h-8 bg-muted rounded" />
          </div>
          
          {/* Status skeleton */}
          <div className="h-5 bg-muted rounded w-20" />
        </div>
      </CardContent>
    </Card>
  );
}