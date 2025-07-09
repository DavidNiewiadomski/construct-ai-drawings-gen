import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { History, Undo2, User, Clock, Edit, Plus, Trash2 } from 'lucide-react';
import { Change } from '@/types';
import { collaborationService } from '@/services/collaborationService';

interface ChangeHistoryProps {
  drawingId: string;
}

export function ChangeHistory({ drawingId }: ChangeHistoryProps) {
  const [changes, setChanges] = useState<Change[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'backing' | 'dimension' | 'note' | 'comment'>('all');

  useEffect(() => {
    loadChanges();
  }, [drawingId]);

  const loadChanges = async () => {
    try {
      setIsLoading(true);
      const data = await collaborationService.getChangeHistory(drawingId);
      setChanges(data);
    } catch (error) {
      console.error('Failed to load change history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevertChange = async (changeId: string) => {
    try {
      await collaborationService.revertChange(changeId);
      await loadChanges(); // Reload changes
    } catch (error) {
      console.error('Failed to revert change:', error);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'add':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'modify':
        return <Edit className="h-4 w-4 text-blue-600" />;
      case 'delete':
        return <Trash2 className="h-4 w-4 text-red-600" />;
      default:
        return <Edit className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'add':
        return 'text-green-600';
      case 'modify':
        return 'text-blue-600';
      case 'delete':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'add':
        return 'Added';
      case 'modify':
        return 'Modified';
      case 'delete':
        return 'Deleted';
      default:
        return action;
    }
  };

  const getTargetTypeLabel = (type: string) => {
    switch (type) {
      case 'backing':
        return 'Backing';
      case 'dimension':
        return 'Dimension';
      case 'note':
        return 'Note';
      case 'comment':
        return 'Comment';
      default:
        return type;
    }
  };

  const formatChangeDescription = (change: Change) => {
    const target = getTargetTypeLabel(change.target.type);
    const action = getActionLabel(change.action);
    
    let description = `${action} ${target.toLowerCase()}`;
    
    if (change.before && change.after) {
      // Show what changed
      if (change.target.type === 'backing') {
        const before = change.before as any;
        const after = change.after as any;
        
        if (before.backingType !== after.backingType) {
          description += ` - Changed backing type from ${before.backingType} to ${after.backingType}`;
        }
        if (before.dimensions?.width !== after.dimensions?.width) {
          description += ` - Resized from ${before.dimensions?.width}" to ${after.dimensions?.width}"`;
        }
      }
    }
    
    return description;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const filteredChanges = filter === 'all' 
    ? changes 
    : changes.filter(change => change.target.type === filter);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Change History
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="backing">Backing</TabsTrigger>
            <TabsTrigger value="dimension">Dimensions</TabsTrigger>
            <TabsTrigger value="note">Notes</TabsTrigger>
            <TabsTrigger value="comment">Comments</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {filteredChanges.map((change, index) => (
                    <div key={change.id}>
                      <div className="flex gap-3 p-3 hover:bg-muted/30 rounded-lg">
                        <div className="flex flex-col items-center">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">
                              {getInitials(change.user)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="w-px bg-border h-6 mt-2" />
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getActionIcon(change.action)}
                              <span className="font-medium text-sm">{change.user}</span>
                              <Badge variant="outline" className="text-xs">
                                {getTargetTypeLabel(change.target.type)}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(change.timestamp).toLocaleString()}
                              </span>
                              
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleRevertChange(change.id)}
                                className="h-6 w-6 p-0"
                              >
                                <Undo2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <p className="text-sm">{formatChangeDescription(change)}</p>
                            
                            {change.reason && (
                              <p className="text-xs text-muted-foreground italic">
                                Reason: {change.reason}
                              </p>
                            )}
                          </div>

                          {(change.before || change.after) && (
                            <div className="bg-muted/30 rounded p-2 text-xs space-y-1">
                              {change.before && (
                                <div className="text-red-600">
                                  <span className="font-medium">Before:</span> {JSON.stringify(change.before, null, 2)}
                                </div>
                              )}
                              {change.after && (
                                <div className="text-green-600">
                                  <span className="font-medium">After:</span> {JSON.stringify(change.after, null, 2)}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {index < filteredChanges.length - 1 && <Separator />}
                    </div>
                  ))}

                  {filteredChanges.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <History className="mx-auto h-12 w-12 mb-2 opacity-50" />
                      <p>No changes found for this filter.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}