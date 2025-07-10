import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  X, 
  Trash2, 
  RefreshCw,
  FileText,
  FileSpreadsheet,
  File,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ExportQueueService } from '@/services/exportQueueService';
import { useToast } from '@/hooks/use-toast';

interface ExportJob {
  id: string;
  type: 'pdf' | 'dwg' | 'csv';
  status: 'preparing' | 'generating' | 'complete' | 'failed';
  progress: number;
  result?: Blob;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
  settings?: any;
  filename?: string;
}

interface ExportQueueProps {
  className?: string;
}

export function ExportQueue({ className }: ExportQueueProps) {
  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const { toast } = useToast();
  const exportQueue = ExportQueueService.getInstance();

  useEffect(() => {
    // Load initial jobs
    setJobs(exportQueue.getAllJobs());

    // Subscribe to job updates
    const unsubscribe = exportQueue.subscribe((updatedJob) => {
      setJobs(exportQueue.getAllJobs());
      
      // Show toast notifications for completed jobs
      if (updatedJob.status === 'complete') {
        toast({
          title: 'Export Complete',
          description: `${updatedJob.filename} is ready for download`,
        });
      } else if (updatedJob.status === 'failed') {
        toast({
          title: 'Export Failed',
          description: updatedJob.error || 'Unknown error occurred',
          variant: 'destructive',
        });
      }
    });

    return unsubscribe;
  }, [exportQueue, toast]);

  const handleDownload = (job: ExportJob) => {
    try {
      exportQueue.downloadJob(job.id);
      toast({
        title: 'Download Started',
        description: `Downloading ${job.filename}`,
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = async (job: ExportJob) => {
    await exportQueue.cancelJob(job.id);
    toast({
      title: 'Export Cancelled',
      description: `${job.filename} export was cancelled`,
    });
  };

  const handleRemove = (job: ExportJob) => {
    exportQueue.removeJob(job.id);
    toast({
      title: 'Export Removed',
      description: `${job.filename} removed from queue`,
    });
  };

  const handleClearCompleted = () => {
    exportQueue.clearCompleted();
    toast({
      title: 'Queue Cleared',
      description: 'All completed exports have been removed',
    });
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      case 'csv':
        return <FileSpreadsheet className="w-4 h-4" />;
      case 'dwg':
        return <File className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'preparing':
      case 'generating':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      preparing: 'secondary',
      generating: 'secondary',
      complete: 'default',
      failed: 'destructive',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const activeJobs = jobs.filter(job => 
    job.status === 'preparing' || job.status === 'generating'
  );
  const completedJobs = jobs.filter(job => 
    job.status === 'complete' || job.status === 'failed'
  );

  if (jobs.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <FileText className="w-8 h-8 mb-2" />
          <p>No export jobs in queue</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Export Queue ({jobs.length})
        </CardTitle>
        {completedJobs.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearCompleted}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Completed
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Active Jobs */}
        {activeJobs.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Active Exports ({activeJobs.length})
            </h4>
            {activeJobs.map((job) => (
              <div key={job.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getFileIcon(job.type)}
                    <div>
                      <p className="font-medium">{job.filename}</p>
                      <p className="text-sm text-muted-foreground">
                        {job.type.toUpperCase()} Export
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(job.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancel(job)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      {getStatusIcon(job.status)}
                      {job.status === 'preparing' ? 'Preparing export...' : 
                       job.status === 'generating' ? 'Generating file...' : 
                       job.status}
                    </span>
                    <span>{Math.round(job.progress)}%</span>
                  </div>
                  <Progress value={job.progress} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Completed Jobs */}
        {completedJobs.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Recent Exports ({completedJobs.length})
            </h4>
            {completedJobs.slice(0, 5).map((job) => (
              <div key={job.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getFileIcon(job.type)}
                    <div>
                      <p className="font-medium">{job.filename}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{job.type.toUpperCase()}</span>
                        {job.completedAt && (
                          <span>• {job.completedAt.toLocaleTimeString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusBadge(job.status)}
                    
                    {job.status === 'complete' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleDownload(job)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(job)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {job.status === 'failed' && job.error && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    Error: {job.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}