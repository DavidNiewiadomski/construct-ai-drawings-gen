import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MessageCircle, MoreHorizontal, Check, User, Clock, Paperclip } from 'lucide-react';
import { ReviewComment, CommentMessage, Point } from '@/types';
import { collaborationService } from '@/services/collaborationService';

interface CommentPinProps {
  comment: ReviewComment;
  pinNumber: number;
  isActive: boolean;
  onToggle: () => void;
  onResolve: () => void;
  onReply: (message: string) => void;
}

export function CommentPin({ 
  comment, 
  pinNumber, 
  isActive, 
  onToggle, 
  onResolve, 
  onReply 
}: CommentPinProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    
    try {
      await onReply(replyText);
      setReplyText('');
      setIsReplying(false);
    } catch (error) {
      console.error('Failed to reply:', error);
    }
  };

  const getPinColor = () => {
    if (comment.status === 'resolved') return 'bg-green-500 border-green-600';
    return isActive ? 'bg-blue-500 border-blue-600' : 'bg-red-500 border-red-600';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <>
      {/* Pin on drawing */}
      <div
        className={`absolute w-8 h-8 rounded-full border-2 ${getPinColor()} 
                   text-white font-bold text-sm flex items-center justify-center 
                   cursor-pointer hover:scale-110 transition-transform z-10`}
        style={{
          left: comment.position.x,
          top: comment.position.y,
          transform: 'translate(-50%, -50%)',
        }}
        onClick={() => {
          onToggle();
          setIsExpanded(true);
        }}
      >
        {pinNumber}
      </div>

      {/* Comment Panel Dialog */}
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Comment #{pinNumber}
                <Badge variant={comment.status === 'resolved' ? 'default' : 'destructive'}>
                  {comment.status}
                </Badge>
              </DialogTitle>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {comment.status === 'open' && (
                    <DropdownMenuItem onClick={onResolve}>
                      <Check className="h-4 w-4 mr-2" />
                      Resolve
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>
                    <Paperclip className="h-4 w-4 mr-2" />
                    Add Attachment
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4">
            {/* Comment Thread */}
            <div className="space-y-3">
              {comment.thread.map((message, index) => (
                <div key={message.id} className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(message.author)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{message.author}</span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(message.timestamp).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-sm">{message.text}</p>
                      
                      {message.mentions.length > 0 && (
                        <div className="mt-2 flex gap-1">
                          {message.mentions.map((mention, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              @{mention}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {message.attachments.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-muted-foreground mb-1">
                            Attachments:
                          </div>
                          {message.attachments.map((attachment, i) => (
                            <div key={i} className="text-xs text-blue-600 hover:underline cursor-pointer">
                              {attachment}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Section */}
            {comment.status === 'open' && (
              <div className="border-t pt-4 space-y-3">
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder="Add a reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onFocus={() => setIsReplying(true)}
                      className="min-h-[80px] resize-none"
                    />
                    
                    {isReplying && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleReply}>
                          Reply
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
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}