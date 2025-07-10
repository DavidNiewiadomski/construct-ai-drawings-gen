import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Clock, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommentListProps {
  comments: Array<{
    id: string;
    position_x: number;
    position_y: number;
    thread: Array<{
      id: string;
      text: string;
      author: string;
      timestamp: Date;
    }>;
    status: 'open' | 'resolved';
    createdBy: string;
    createdAt: Date;
  }>;
  selectedComment: any;
  onSelectComment: (comment: any) => void;
  currentUser: {
    id: string;
    name: string;
    email: string;
  };
}

export function CommentList({ 
  comments, 
  selectedComment, 
  onSelectComment, 
  currentUser 
}: CommentListProps) {
  const getAuthorInitials = (authorId: string) => {
    return authorId.substring(0, 2).toUpperCase();
  };

  const getAuthorName = (authorId: string) => {
    return authorId === currentUser.id ? currentUser.name : `User ${authorId.substring(0, 8)}`;
  };

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No comments yet</p>
        <p className="text-xs">Click "Add Comment" to get started</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-64">
      <div className="space-y-2">
        {comments.map((comment, index) => {
          const isSelected = selectedComment?.id === comment.id;
          const latestMessage = comment.thread[comment.thread.length - 1];
          
          return (
            <div
              key={comment.id}
              onClick={() => onSelectComment(comment)}
              className={`
                p-3 rounded-lg border cursor-pointer transition-all duration-200
                ${isSelected 
                  ? 'bg-primary/10 border-primary shadow-sm' 
                  : 'bg-muted/30 border-muted hover:bg-muted/50 hover:border-muted-foreground/30'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="text-xs">
                    {getAuthorInitials(comment.createdBy)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      Comment #{index + 1}
                    </span>
                    <Badge 
                      variant={comment.status === 'resolved' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {comment.status}
                    </Badge>
                    {comment.thread.length > 1 && (
                      <Badge variant="outline" className="text-xs">
                        {comment.thread.length} replies
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {latestMessage?.text || 'No message'}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span>{getAuthorName(comment.createdBy)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                    </div>
                    <div className="flex items-center gap-1">
                      <span>@({Math.round(comment.position_x)}, {Math.round(comment.position_y)})</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}