import { supabase } from '@/integrations/supabase/client';
import { ReviewComment, CommentMessage, Change, Approval, Point } from '@/types';

class CollaborationService {
  // Comment Management
  async addComment(comment: Omit<ReviewComment, 'id' | 'thread' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('review_comments')
        .insert({
          drawing_id: comment.drawingId,
          position_x: comment.position.x,
          position_y: comment.position.y,
          status: comment.status,
          created_by: user.user.id,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to add comment:', error);
      throw error;
    }
  }

  async replyToComment(commentId: string, message: Omit<CommentMessage, 'id' | 'timestamp'>): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('comment_messages')
        .insert({
          comment_id: commentId,
          text: message.text,
          author: user.user.id,
          mentions: message.mentions,
          attachments: message.attachments,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to reply to comment:', error);
      throw error;
    }
  }

  async resolveComment(commentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('review_comments')
        .update({ status: 'resolved' })
        .eq('id', commentId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to resolve comment:', error);
      throw error;
    }
  }

  async getComments(drawingId: string): Promise<ReviewComment[]> {
    try {
      const { data: comments, error: commentsError } = await supabase
        .from('review_comments')
        .select(`
          *,
          comment_messages (
            id,
            text,
            author,
            mentions,
            attachments,
            created_at
          )
        `)
        .eq('drawing_id', drawingId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      return comments?.map(comment => ({
        id: comment.id,
        drawingId: comment.drawing_id,
        position: { x: comment.position_x, y: comment.position_y },
        status: comment.status as 'open' | 'resolved',
        createdBy: comment.created_by,
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
        thread: comment.comment_messages?.map((msg: any) => ({
          id: msg.id,
          text: msg.text,
          author: msg.author,
          timestamp: msg.created_at,
          mentions: msg.mentions || [],
          attachments: msg.attachments || [],
        })) || [],
      })) || [];
    } catch (error) {
      console.error('Failed to get comments:', error);
      return [];
    }
  }

  // Change History
  async trackChange(change: Omit<Change, 'id' | 'timestamp'>): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // First get the drawing_id from the target if it's a backing or other element
      // For now, we'll assume the drawingId is passed in the change object
      const drawingId = (change as any).drawingId;

      const { error } = await supabase
        .from('change_history')
        .insert({
          drawing_id: drawingId,
          user_id: user.user.id,
          action: change.action,
          target_type: change.target.type,
          target_id: change.target.id,
          before_data: change.before,
          after_data: change.after,
          reason: change.reason,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to track change:', error);
      throw error;
    }
  }

  async getChangeHistory(drawingId: string): Promise<Change[]> {
    try {
      const { data: changes, error } = await supabase
        .from('change_history')
        .select(`
          *,
          profiles!change_history_user_id_fkey (
            full_name
          )
        `)
        .eq('drawing_id', drawingId)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      return changes?.map(change => ({
        id: change.id,
        timestamp: change.timestamp,
        user: (change.profiles as any)?.full_name || 'Unknown User',
        action: change.action as 'add' | 'modify' | 'delete',
        target: {
          type: change.target_type as 'backing' | 'dimension' | 'note' | 'comment',
          id: change.target_id,
        },
        before: change.before_data,
        after: change.after_data,
        reason: change.reason,
      })) || [];
    } catch (error) {
      console.error('Failed to get change history:', error);
      return [];
    }
  }

  async revertChange(changeId: string): Promise<void> {
    try {
      // This would implement the logic to revert a specific change
      // For now, we'll just mark it as reverted in the database
      console.log('Reverting change:', changeId);
    } catch (error) {
      console.error('Failed to revert change:', error);
      throw error;
    }
  }

  // Approval Workflow
  async submitForApproval(drawingId: string): Promise<void> {
    try {
      // This would update the drawing status to "pending approval"
      // and send notifications to reviewers
      console.log('Submitting drawing for approval:', drawingId);
    } catch (error) {
      console.error('Failed to submit for approval:', error);
      throw error;
    }
  }

  async approveDrawing(approval: Omit<Approval, 'id' | 'timestamp'>): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('approvals')
        .insert({
          drawing_id: (approval as any).drawingId,
          reviewer: user.user.id,
          status: approval.status,
          conditions: approval.conditions,
          signature: approval.signature,
          stamp_position_x: approval.stampPosition?.x,
          stamp_position_y: approval.stampPosition?.y,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to approve drawing:', error);
      throw error;
    }
  }

  async getApprovals(drawingId: string): Promise<Approval[]> {
    try {
      const { data: approvals, error } = await supabase
        .from('approvals')
        .select(`
          *,
          profiles!approvals_reviewer_fkey (
            full_name
          )
        `)
        .eq('drawing_id', drawingId)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      return approvals?.map(approval => ({
        id: approval.id,
        reviewer: (approval.profiles as any)?.full_name || 'Unknown Reviewer',
        timestamp: approval.timestamp,
        status: approval.status as 'approved' | 'rejected' | 'conditional',
        conditions: approval.conditions,
        signature: approval.signature,
        stampPosition: approval.stamp_position_x && approval.stamp_position_y
          ? { x: approval.stamp_position_x, y: approval.stamp_position_y }
          : undefined,
      })) || [];
    } catch (error) {
      console.error('Failed to get approvals:', error);
      return [];
    }
  }

  // Real-time subscriptions
  subscribeToComments(drawingId: string, callback: (comment: ReviewComment) => void) {
    return supabase
      .channel(`comments:${drawingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'review_comments',
          filter: `drawing_id=eq.${drawingId}`,
        },
        (payload) => {
          // Convert database row to ReviewComment format
          const comment: ReviewComment = {
            id: payload.new.id,
            drawingId: payload.new.drawing_id,
            position: { x: payload.new.position_x, y: payload.new.position_y },
            status: payload.new.status,
            createdBy: payload.new.created_by,
            createdAt: payload.new.created_at,
            updatedAt: payload.new.updated_at,
            thread: [], // Will be loaded separately
          };
          callback(comment);
        }
      )
      .subscribe();
  }

  subscribeToChanges(drawingId: string, callback: (change: Change) => void) {
    return supabase
      .channel(`changes:${drawingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'change_history',
          filter: `drawing_id=eq.${drawingId}`,
        },
        (payload) => {
          const change: Change = {
            id: payload.new.id,
            timestamp: payload.new.timestamp,
            user: 'User', // Will need to fetch user name
            action: payload.new.action,
            target: {
              type: payload.new.target_type,
              id: payload.new.target_id,
            },
            before: payload.new.before_data,
            after: payload.new.after_data,
            reason: payload.new.reason,
          };
          callback(change);
        }
      )
      .subscribe();
  }
}

export const collaborationService = new CollaborationService();