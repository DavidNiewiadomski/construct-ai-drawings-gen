import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Plus, Filter, Users } from 'lucide-react';
import { CommentPin } from './CommentPin';
import { CommentThread } from './CommentThread';
import { CommentList } from './CommentList';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  position_x: number;
  position_y: number;
  drawingId: string;
  thread: CommentMessage[];
  status: 'open' | 'resolved';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CommentMessage {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
  attachments?: string[];
  mentions?: string[];
}

interface CommentSystemProps {
  drawingId: string;
  currentUser: {
    id: string;
    name: string;
    email: string;
  };
  scale: number;
  pan: { x: number; y: number };
}

export function CommentSystem({ drawingId, currentUser, scale, pan }: CommentSystemProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isPlacingComment, setIsPlacingComment] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load comments on mount
  useEffect(() => {
    loadComments();
    setupRealtimeSubscription();
  }, [drawingId]);

  const loadComments = async () => {
    try {
      // Load comments with their messages
      const { data: commentsData, error: commentsError } = await supabase
        .from('review_comments')
        .select(`
          *,
          comment_messages (
            id,
            text,
            author,
            created_at,
            attachments,
            mentions
          )
        `)
        .eq('drawing_id', drawingId)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;

      const formattedComments = commentsData?.map(comment => ({
        id: comment.id,
        position_x: comment.position_x,
        position_y: comment.position_y,
        drawingId: comment.drawing_id,
        thread: comment.comment_messages.map((msg: any) => ({
          id: msg.id,
          text: msg.text,
          author: msg.author,
          timestamp: new Date(msg.created_at),
          attachments: msg.attachments || [],
          mentions: msg.mentions || []
        })),
        status: comment.status as 'open' | 'resolved',
        createdBy: comment.created_by,
        createdAt: new Date(comment.created_at),
        updatedAt: new Date(comment.updated_at)
      })) || [];

      setComments(formattedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('comments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'review_comments',
          filter: `drawing_id=eq.${drawingId}`
        },
        () => {
          loadComments(); // Reload comments when changes occur
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comment_messages'
        },
        () => {
          loadComments(); // Reload comments when messages change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleCanvasClick = async (event: React.MouseEvent) => {
    if (!isPlacingComment) return;

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (event.clientX - rect.left - pan.x) / scale;
    const y = (event.clientY - rect.top - pan.y) / scale;

    try {
      // Create new comment
      const { data: commentData, error: commentError } = await supabase
        .from('review_comments')
        .insert({
          drawing_id: drawingId,
          position_x: x,
          position_y: y,
          created_by: currentUser.id,
          status: 'open'
        })
        .select()
        .single();

      if (commentError) throw commentError;

      // Create initial message
      const { error: messageError } = await supabase
        .from('comment_messages')
        .insert({
          comment_id: commentData.id,
          text: 'New comment',
          author: currentUser.id
        });

      if (messageError) throw messageError;

      // Track change
      await supabase
        .from('change_history')
        .insert({
          drawing_id: drawingId,
          user_id: currentUser.id,
          action: 'add',
          target_type: 'comment',
          target_id: commentData.id,
          after_data: { position: { x, y }, status: 'open' }
        });

      setIsPlacingComment(false);
      toast({
        title: "Success",
        description: "Comment added successfully"
      });
      
      // Reload comments to get the new one
      loadComments();
    } catch (error) {
      console.error('Error creating comment:', error);
      toast({
        title: "Error",
        description: "Failed to create comment",
        variant: "destructive"
      });
    }
  };

  const addReply = async (commentId: string, text: string) => {
    try {
      const { error } = await supabase
        .from('comment_messages')
        .insert({
          comment_id: commentId,
          text,
          author: currentUser.id
        });

      if (error) throw error;

      loadComments();
      toast({
        title: "Success",
        description: "Reply added successfully"
      });
    } catch (error) {
      console.error('Error adding reply:', error);
      toast({
        title: "Error",
        description: "Failed to add reply",
        variant: "destructive"
      });
    }
  };

  const resolveComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('review_comments')
        .update({ 
          status: 'resolved',
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId);

      if (error) throw error;

      // Track change
      await supabase
        .from('change_history')
        .insert({
          drawing_id: drawingId,
          user_id: currentUser.id,
          action: 'modify',
          target_type: 'comment',
          target_id: commentId,
          after_data: { status: 'resolved' },
          reason: 'Comment resolved'
        });

      setSelectedComment(null);
      loadComments();
      toast({
        title: "Success",
        description: "Comment resolved"
      });
    } catch (error) {
      console.error('Error resolving comment:', error);
      toast({
        title: "Error",
        description: "Failed to resolve comment",
        variant: "destructive"
      });
    }
  };

  const filteredComments = comments.filter(comment => {
    if (filter === 'all') return true;
    return comment.status === filter;
  });

  const openComments = comments.filter(c => c.status === 'open');

  if (isLoading) {
    return (
      <Card className="w-80">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Comment System Panel */}
      <Card className="w-80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments
            {openComments.length > 0 && (
              <Badge variant="secondary">{openComments.length} open</Badge>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Comment Toolbar */}
          <div className="flex items-center gap-2">
            <Button
              variant={isPlacingComment ? "default" : "outline"}
              size="sm"
              onClick={() => setIsPlacingComment(!isPlacingComment)}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isPlacingComment ? 'Cancel' : 'Add Comment'}
            </Button>
            
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {isPlacingComment && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                Click on the drawing to place a comment
              </p>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex border-b">
            {(['all', 'open', 'resolved'] as const).map(filterOption => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  filter === filterOption
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                {filterOption !== 'all' && (
                  <span className="ml-1 text-xs">
                    ({comments.filter(c => c.status === filterOption).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Comment List */}
          <CommentList
            comments={filteredComments}
            selectedComment={selectedComment}
            onSelectComment={setSelectedComment}
            currentUser={currentUser}
          />
        </CardContent>
      </Card>

      {/* Comment Pins Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-20"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }}
        onClick={handleCanvasClick}
      >
        {comments.map((comment, index) => (
          <div
            key={comment.id}
            className={`absolute w-8 h-8 rounded-full border-2 ${
              comment.status === 'resolved' 
                ? 'bg-green-500 border-green-600' 
                : selectedComment?.id === comment.id 
                ? 'bg-blue-500 border-blue-600' 
                : 'bg-red-500 border-red-600'
            } text-white font-bold text-sm flex items-center justify-center cursor-pointer hover:scale-110 transition-transform z-10 pointer-events-auto`}
            style={{
              left: comment.position_x,
              top: comment.position_y,
              transform: 'translate(-50%, -50%)',
            }}
            onClick={() => setSelectedComment(comment)}
          >
            {index + 1}
          </div>
        ))}
      </div>

      {/* Comment Thread Panel */}
      {selectedComment && (
        <CommentThread
          comment={selectedComment}
          currentUser={currentUser}
          onAddReply={(text) => addReply(selectedComment.id, text)}
          onResolve={() => resolveComment(selectedComment.id)}
          onClose={() => setSelectedComment(null)}
        />
      )}
    </>
  );
}