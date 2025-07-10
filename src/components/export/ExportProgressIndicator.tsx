import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  Loader2, 
  CheckCircle, 
  XCircle,
  ChevronDown,
  X
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useExportQueue } from '@/hooks/useExportQueue';
import { useToast } from '@/hooks/use-toast';

interface ExportProgressIndicatorProps {
  className?: string;
  variant?: 'compact' | 'expanded';
}

export function ExportProgressIndicator({ 
  className,
  variant = 'compact' 
}: ExportProgressIndicatorProps) {
  const { 
    activeJobs, 
    completedJobs, 
    downloadJob, 
    cancelJob,
    removeJob,
    hasActiveJobs 
  } = useExportQueue();
  const { toast } = useToast();

  if (!hasActiveJobs && completedJobs.length === 0) {
    return null;
  }

  const handleDownload = (jobId: string) => {
    try {
      downloadJob(jobId);
      toast({
        title: 'Download Started',
        description: 'Your export is being downloaded',
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = async (jobId: string) => {
    await cancelJob(jobId);
    toast({
      title: 'Export Cancelled',
      description: 'Export job was cancelled',
    });
  };

  if (variant === 'compact') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn("relative", className)}
          >
            {hasActiveJobs ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Exports
            {(activeJobs.length > 0 || completedJobs.length > 0) && (
              <Badge 
                variant={hasActiveJobs ? "default" : "secondary"}
                className="ml-2 h-5 min-w-5 text-xs"
              >
                {activeJobs.length + completedJobs.length}
              </Badge>
            )}
            <ChevronDown className="w-3 h-3 ml-2" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-4 border-b">
            <h4 className="font-medium">Export Status</h4>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {/* Active Jobs */}
            {activeJobs.map((job) => (
              <div key={job.id} className="p-3 border-b last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium truncate">
                    {job.filename}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancel(job.id)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {job.status === 'preparing' ? 'Preparing...' : 'Generating...'}
                  <span className="ml-auto">{Math.round(job.progress)}%</span>
                </div>
                
                <Progress value={job.progress} className="h-1" />
              </div>
            ))}
            
            {/* Completed Jobs */}
            {completedJobs.slice(0, 3).map((job) => (
              <div key={job.id} className="p-3 border-b last:border-b-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    {job.status === 'complete' ? (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {job.filename}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {job.completedAt?.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {job.status === 'complete' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(job.id)}
                        className="h-6 px-2 text-xs"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeJob(job.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                {job.status === 'failed' && job.error && (
                  <div className="mt-1 text-xs text-red-600 truncate">
                    {job.error}
                  </div>
                )}
              </div>
            ))}
            
            {completedJobs.length === 0 && activeJobs.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No export jobs
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Expanded variant
  return (
    <div className={cn("space-y-3", className)}>
      {activeJobs.map((job) => (
        <div key={job.id} className="bg-card border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">{job.filename}</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCancel(job.id)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            {job.status === 'preparing' ? 'Preparing export...' : 'Generating file...'}
            <span className="ml-auto">{Math.round(job.progress)}%</span>
          </div>
          
          <Progress value={job.progress} className="h-2" />
        </div>
      ))}
      
      {completedJobs.slice(0, 3).map((job) => (
        <div key={job.id} className="bg-card border rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {job.status === 'complete' ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <div>
                <div className="text-sm font-medium">{job.filename}</div>
                <div className="text-xs text-muted-foreground">
                  {job.completedAt?.toLocaleString()}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {job.status === 'complete' && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleDownload(job.id)}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeJob(job.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {job.status === 'failed' && job.error && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 rounded p-2">
              Error: {job.error}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}