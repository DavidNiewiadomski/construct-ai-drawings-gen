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

type ExportJobListener = (job: ExportJob) => void;

export class ExportQueueService {
  private static instance: ExportQueueService;
  private jobs = new Map<string, ExportJob>();
  private listeners = new Set<ExportJobListener>();
  private activeJobs = new Set<string>();

  static getInstance(): ExportQueueService {
    if (!ExportQueueService.instance) {
      ExportQueueService.instance = new ExportQueueService();
    }
    return ExportQueueService.instance;
  }

  /**
   * Add a new export job to the queue
   */
  async addJob(
    type: ExportJob['type'], 
    settings: any, 
    filename?: string
  ): Promise<string> {
    const id = this.generateJobId();
    const job: ExportJob = {
      id,
      type,
      status: 'preparing',
      progress: 0,
      createdAt: new Date(),
      settings,
      filename: filename || `export-${type}-${Date.now()}`
    };

    this.jobs.set(id, job);
    this.notifyListeners(job);

    // Start processing the job
    this.processJob(id);

    return id;
  }

  /**
   * Get a specific job by ID
   */
  getJob(id: string): ExportJob | undefined {
    return this.jobs.get(id);
  }

  /**
   * Get all jobs
   */
  getAllJobs(): ExportJob[] {
    return Array.from(this.jobs.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  /**
   * Get active jobs (preparing or generating)
   */
  getActiveJobs(): ExportJob[] {
    return this.getAllJobs().filter(
      job => job.status === 'preparing' || job.status === 'generating'
    );
  }

  /**
   * Cancel a job
   */
  async cancelJob(id: string): Promise<void> {
    const job = this.jobs.get(id);
    if (!job || job.status === 'complete' || job.status === 'failed') {
      return;
    }

    job.status = 'failed';
    job.error = 'Cancelled by user';
    job.completedAt = new Date();
    
    this.activeJobs.delete(id);
    this.notifyListeners(job);
  }

  /**
   * Remove a job from the queue
   */
  removeJob(id: string): void {
    const job = this.jobs.get(id);
    if (job?.result) {
      URL.revokeObjectURL(URL.createObjectURL(job.result));
    }
    this.jobs.delete(id);
  }

  /**
   * Clear completed jobs
   */
  clearCompleted(): void {
    const completedJobs = Array.from(this.jobs.entries())
      .filter(([_, job]) => job.status === 'complete' || job.status === 'failed');
    
    completedJobs.forEach(([id, job]) => {
      if (job.result) {
        URL.revokeObjectURL(URL.createObjectURL(job.result));
      }
      this.jobs.delete(id);
    });
  }

  /**
   * Download a completed job
   */
  downloadJob(id: string): void {
    const job = this.jobs.get(id);
    if (!job || job.status !== 'complete' || !job.result) {
      throw new Error('Job not ready for download');
    }

    const url = URL.createObjectURL(job.result);
    const a = document.createElement('a');
    a.href = url;
    a.download = job.filename || `export-${job.type}-${Date.now()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Subscribe to job updates
   */
  subscribe(listener: ExportJobListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Process a job asynchronously
   */
  private async processJob(id: string): Promise<void> {
    const job = this.jobs.get(id);
    if (!job) return;

    this.activeJobs.add(id);

    try {
      // Update to generating status
      job.status = 'generating';
      job.progress = 10;
      this.notifyListeners(job);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        if (job.status === 'generating' && job.progress < 90) {
          job.progress += Math.random() * 20;
          job.progress = Math.min(job.progress, 90);
          this.notifyListeners(job);
        }
      }, 500);

      let result: Blob;

      // Process based on job type
      switch (job.type) {
        case 'pdf':
          result = await this.generatePDF(job.settings);
          break;
        case 'dwg':
          result = await this.generateDWG(job.settings);
          break;
        case 'csv':
          result = await this.generateCSV(job.settings);
          break;
        default:
          throw new Error(`Unsupported export type: ${job.type}`);
      }

      clearInterval(progressInterval);

      // Complete the job
      job.status = 'complete';
      job.progress = 100;
      job.result = result;
      job.completedAt = new Date();
      this.notifyListeners(job);

    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.completedAt = new Date();
      this.notifyListeners(job);
    } finally {
      this.activeJobs.delete(id);
    }
  }

  /**
   * Generate PDF export
   */
  private async generatePDF(settings: any): Promise<Blob> {
    // Import the PDF service dynamically to avoid circular dependencies
    const { PDFExportService } = await import('./pdfExportService');
    
    // Simulate some processing time for large files
    await this.delay(1000);
    
    return PDFExportService.generatePDF(settings);
  }

  /**
   * Generate DWG export
   */
  private async generateDWG(settings: any): Promise<Blob> {
    // Simulate DWG generation
    await this.delay(2000);
    
    // Mock DWG content
    const dwgContent = `DWG Export - ${new Date().toISOString()}\n` +
      `Settings: ${JSON.stringify(settings, null, 2)}`;
    
    return new Blob([dwgContent], { type: 'application/octet-stream' });
  }

  /**
   * Generate CSV export
   */
  private async generateCSV(settings: any): Promise<Blob> {
    // Import the CSV service dynamically
    const { CSVExportService } = await import('./csvExportService');
    
    await this.delay(500);
    
    const csvContent = CSVExportService.generateCSV(settings.backings || []);
    return new Blob([csvContent], { type: 'text/csv' });
  }

  /**
   * Utility methods
   */
  private generateJobId(): string {
    return `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private notifyListeners(job: ExportJob): void {
    this.listeners.forEach(listener => listener(job));
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}