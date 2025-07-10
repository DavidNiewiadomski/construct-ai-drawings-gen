import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { X, Reply, Check, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommentThreadProps {
  comment: {
    id: string;
    thread: Array<{
      id: string;
      text: string;
      author: string;
      timestamp: Date;
      attachments?: string[];
      mentions?: string[];
    }>;
    status: 'open' | 'resolved';
    createdBy: string;
    createdAt: Date;
  };
  currentUser: {
    id: string;
    name: string;
    email: string;
  };
  onAddReply: (text: string) => void;
  onResolve: () => void;
  onClose: () => void;
}

export function CommentThread({ 
  comment, 
  currentUser, 
  onAddReply, 
  onResolve, 
  onClose 
}: CommentThreadProps) {
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddReply(replyText);
      setReplyText('');
      setIsReplying(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAuthorInitials = (authorId: string) => {
    // In a real app, you'd look up the user's name
    return authorId.substring(0, 2).toUpperCase();
  };

  const getAuthorName = (authorId: string) => {
    // In a real app, you'd look up the user's name
    return authorId === currentUser.id ? currentUser.name : `User ${authorId.substring(0, 8)}`;
  };

  return (
    <Card className="absolute top-4 right-4 w-96 max-h-[600px] shadow-xl z-40">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            Comment Thread
            <Badge variant={comment.status === 'resolved' ? 'default' : 'secondary'}>
              {comment.status}
            </Badge>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Thread Messages */}
        <ScrollArea className="max-h-80">
          <div className="space-y-4">
            {comment.thread.map((message, index) => (
              <div key={message.id} className="space-y-2">
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {getAuthorInitials(message.author)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">
                        {getAuthorName(message.author)}
                      </span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                    
                    <div className="bg-muted p-3 rounded-lg text-sm">
                      {message.text}
                    </div>

                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {message.attachments.map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`Attachment ${idx + 1}`}
                            className="w-16 h-16 object-cover rounded border"
                          />
                        ))}
                      </div>
                    )}

                    {/* Mentions */}
                    {message.mentions && message.mentions.length > 0 && (
                      <div className="flex gap-1 text-xs">
                        <span className="text-muted-foreground">Mentioned:</span>
                        {message.mentions.map((mention, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            @{mention}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {index < comment.thread.length - 1 && (
                  <div className="ml-11 border-l border-muted pl-3" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Reply Form */}
        {comment.status === 'open' && (
          <div className="space-y-3 border-t pt-4">
            {isReplying ? (
              <div className="space-y-3">
                <Textarea
                  placeholder="Type your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSubmitReply}
                    disabled={!replyText.trim() || isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsReplying(false);
                      setReplyText('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsReplying(true)}
                  className="flex-1"
                >
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </Button>
                <Button
                  size="sm"
                  onClick={onResolve}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Resolve
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Resolved Status */}
        {comment.status === 'resolved' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-700">
              <Check className="h-4 w-4" />
              <span className="text-sm font-medium">
                This comment has been resolved
              </span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              Resolved {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}