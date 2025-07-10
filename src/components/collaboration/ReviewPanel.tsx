import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, XCircle, Edit3, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReviewSession {
  id: string;
  projectName: string;
  reviewer: string;
  startedAt: Date;
  status: 'in_progress' | 'completed';
  stats: {
    totalBackings: number;
    reviewed: number;
    approved: number;
    rejected: number;
    modified: number;
  };
}

interface ReviewPanelProps {
  backings: Array<{
    id: string;
    backingType: string;
    dimensions: { width: number; height: number; thickness: number };
    location: { x: number; y: number; z: number };
    componentId: string;
    status: string;
  }>;
  currentUser: {
    id: string;
    name: string;
    email: string;
  };
  drawingId: string;
  onReviewAction: (backingId: string, action: 'approve' | 'reject' | 'modify', modifications?: any) => void;
}

export function ReviewPanel({ backings, currentUser, drawingId, onReviewAction }: ReviewPanelProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewSession, setReviewSession] = useState<ReviewSession>({
    id: crypto.randomUUID(),
    projectName: 'Current Project',
    reviewer: currentUser.name,
    startedAt: new Date(),
    status: 'in_progress',
    stats: {
      totalBackings: backings.length,
      reviewed: 0,
      approved: 0,
      rejected: 0,
      modified: 0
    }
  });
  const [showModifyDialog, setShowModifyDialog] = useState(false);
  const [modificationNotes, setModificationNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const currentBacking = backings[currentIndex];
  const progressPercentage = (reviewSession.stats.reviewed / reviewSession.stats.totalBackings) * 100;

  const handleAction = async (action: 'approve' | 'reject' | 'modify', modifications?: any) => {
    if (!currentBacking) return;

    setIsSubmitting(true);
    try {
      // Create approval record
      const approvalData = {
        drawing_id: drawingId,
        reviewer: currentUser.id,
        status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'conditional',
        conditions: action === 'modify' ? modificationNotes : null,
        timestamp: new Date().toISOString()
      };

      const { error: approvalError } = await supabase
        .from('approvals')
        .insert(approvalData);

      if (approvalError) throw approvalError;

      // Track change
      await supabase
        .from('change_history')
        .insert({
          drawing_id: drawingId,
          user_id: currentUser.id,
          action: action,
          target_type: 'backing',
          target_id: currentBacking.id,
          after_data: { status: action, modifications },
          reason: action === 'modify' ? modificationNotes : `Backing ${action}d during review`
        });

      // Update stats
      setReviewSession(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          reviewed: prev.stats.reviewed + 1,
          [action === 'modify' ? 'modified' : action === 'approve' ? 'approved' : 'rejected']: 
            prev.stats[action === 'modify' ? 'modified' : action === 'approve' ? 'approved' : 'rejected'] + 1
        }
      }));

      // Call the parent handler
      onReviewAction(currentBacking.id, action, modifications);

      // Move to next backing
      if (currentIndex < backings.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setReviewSession(prev => ({ ...prev, status: 'completed' }));
      }

      // Reset form
      setShowModifyDialog(false);
      setModificationNotes('');

      toast({
        title: "Success",
        description: `Backing ${action}d successfully`
      });
    } catch (error) {
      console.error('Error reviewing backing:', error);
      toast({
        title: "Error",
        description: `Failed to ${action} backing`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateReviewReport = async () => {
    try {
      const report = `
BACKING REVIEW REPORT
====================
Project: ${reviewSession.projectName}
Reviewer: ${reviewSession.reviewer}
Date: ${reviewSession.startedAt.toLocaleDateString()}
Duration: ${Math.round((new Date().getTime() - reviewSession.startedAt.getTime()) / (1000 * 60))} minutes

SUMMARY
-------
Total Backings: ${reviewSession.stats.totalBackings}
Reviewed: ${reviewSession.stats.reviewed}
Approved: ${reviewSession.stats.approved} (${Math.round((reviewSession.stats.approved / reviewSession.stats.totalBackings) * 100)}%)
Modified: ${reviewSession.stats.modified} (${Math.round((reviewSession.stats.modified / reviewSession.stats.totalBackings) * 100)}%)
Rejected: ${reviewSession.stats.rejected} (${Math.round((reviewSession.stats.rejected / reviewSession.stats.totalBackings) * 100)}%)

STATUS
------
${reviewSession.status === 'completed' ? 'REVIEW COMPLETED' : 'REVIEW IN PROGRESS'}
      `;

      // Download the report
      const blob = new Blob([report], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `review-report-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Review report generated successfully"
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive"
      });
    }
  };

  if (backings.length === 0) {
    return (
      <Card className="w-80">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No backings to review</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Backing Review
        </CardTitle>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{reviewSession.stats.reviewed} of {reviewSession.stats.totalBackings}</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="w-full" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Review Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-lg font-bold text-green-700">{reviewSession.stats.approved}</div>
            <div className="text-xs text-green-600">Approved</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-lg font-bold text-yellow-700">{reviewSession.stats.modified}</div>
            <div className="text-xs text-yellow-600">Modified</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="text-lg font-bold text-red-700">{reviewSession.stats.rejected}</div>
            <div className="text-xs text-red-600">Rejected</div>
          </div>
        </div>

        {/* Current Backing Review */}
        {currentBacking && reviewSession.status === 'in_progress' && (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/30">
              <h4 className="font-medium mb-3">
                Reviewing Backing {currentIndex + 1} of {backings.length}
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Type:</span>
                  <Badge variant="outline">{currentBacking.backingType}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Size:</span>
                  <span>{currentBacking.dimensions.width}" × {currentBacking.dimensions.height}"</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Height AFF:</span>
                  <span>{currentBacking.location.z}"</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Thickness:</span>
                  <span>{currentBacking.dimensions.thickness}"</span>
                </div>
              </div>
            </div>

            {/* Modification Dialog */}
            {showModifyDialog && (
              <div className="space-y-3 border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                <h5 className="font-medium text-yellow-800">Modification Notes</h5>
                <Textarea
                  placeholder="Describe the required modifications..."
                  value={modificationNotes}
                  onChange={(e) => setModificationNotes(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleAction('modify', { notes: modificationNotes })}
                    disabled={!modificationNotes.trim() || isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Modification'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowModifyDialog(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Review Actions */}
            {!showModifyDialog && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => handleAction('approve')}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => setShowModifyDialog(true)}
                    disabled={isSubmitting}
                    variant="outline"
                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Modify
                  </Button>
                  <Button
                    onClick={() => handleAction('reject')}
                    disabled={isSubmitting}
                    variant="destructive"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>

                {/* Navigation */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                    disabled={currentIndex === 0}
                    className="flex-1"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentIndex(Math.min(backings.length - 1, currentIndex + 1))}
                    disabled={currentIndex === backings.length - 1}
                    className="flex-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Review Complete */}
        {reviewSession.status === 'completed' && (
          <div className="text-center space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-green-700">
              <CheckCircle className="h-12 w-12 mx-auto mb-2" />
              <h4 className="font-medium text-lg">Review Complete!</h4>
              <p className="text-sm">All backings have been reviewed</p>
            </div>
            
            <Button onClick={generateReviewReport} className="w-full">
              <FileText className="h-4 w-4 mr-2" />
              Generate Review Report
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}