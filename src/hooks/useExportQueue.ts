import { useState, useEffect } from 'react';
import { ExportQueueService } from '@/services/exportQueueService';

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

export function useExportQueue() {
  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const exportQueue = ExportQueueService.getInstance();

  useEffect(() => {
    // Load initial jobs
    setJobs(exportQueue.getAllJobs());

    // Subscribe to job updates
    const unsubscribe = exportQueue.subscribe((updatedJob) => {
      setJobs(exportQueue.getAllJobs());
    });

    return unsubscribe;
  }, [exportQueue]);

  const addJob = async (
    type: ExportJob['type'], 
    settings: any, 
    filename?: string
  ) => {
    setIsLoading(true);
    try {
      const jobId = await exportQueue.addJob(type, settings, filename);
      return jobId;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelJob = async (jobId: string) => {
    await exportQueue.cancelJob(jobId);
  };

  const downloadJob = (jobId: string) => {
    exportQueue.downloadJob(jobId);
  };

  const removeJob = (jobId: string) => {
    exportQueue.removeJob(jobId);
  };

  const clearCompleted = () => {
    exportQueue.clearCompleted();
  };

  const getActiveJobs = () => {
    return jobs.filter(job => 
      job.status === 'preparing' || job.status === 'generating'
    );
  };

  const getCompletedJobs = () => {
    return jobs.filter(job => 
      job.status === 'complete' || job.status === 'failed'
    );
  };

  const getJobById = (jobId: string) => {
    return jobs.find(job => job.id === jobId);
  };

  return {
    jobs,
    activeJobs: getActiveJobs(),
    completedJobs: getCompletedJobs(),
    isLoading,
    addJob,
    cancelJob,
    downloadJob,
    removeJob,
    clearCompleted,
    getJobById,
    hasActiveJobs: getActiveJobs().length > 0,
    hasCompletedJobs: getCompletedJobs().length > 0
  };
}