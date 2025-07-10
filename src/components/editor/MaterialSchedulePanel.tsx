import React, { useMemo } from 'react';
import { Download, Package, Ruler, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useViewerStore } from '@/stores/viewerStore';
import { BackingPlacement } from '@/types';

interface MaterialSummary {
  type: string;
  size: string;
  count: number;
  totalLength?: number;
  totalArea?: number;
  locations: string[];
}

interface MaterialSchedulePanelProps {
  className?: string;
}

export function MaterialSchedulePanel({ className }: MaterialSchedulePanelProps) {
  const { backings } = useViewerStore();

  // Calculate material summaries from backings
  const materialSummaries = useMemo(() => {
    const summaryMap = new Map<string, MaterialSummary>();

    backings.forEach((backing: BackingPlacement) => {
      const { backingType, dimensions, location } = backing;
      
      // Create unique key for material type and size
      const sizeKey = `${dimensions.width}"x${dimensions.height}"x${dimensions.thickness}"`;
      const materialKey = `${backingType}-${sizeKey}`;
      
      // Generate location description
      const locationDesc = `(${location.x.toFixed(1)}, ${location.y.toFixed(1)}) @ ${location.z}" AFF`;
      
      if (summaryMap.has(materialKey)) {
        const existing = summaryMap.get(materialKey)!;
        existing.count += 1;
        existing.locations.push(locationDesc);
        
        // Update totals based on material type
        if (isLumberType(backingType)) {
          existing.totalLength = (existing.totalLength || 0) + (dimensions.width / 12); // Convert to feet
        } else if (isSheetType(backingType)) {
          existing.totalArea = (existing.totalArea || 0) + ((dimensions.width * dimensions.height) / 144); // Convert to sq ft
        }
      } else {
        const summary: MaterialSummary = {
          type: backingType,
          size: sizeKey,
          count: 1,
          locations: [locationDesc]
        };

        // Calculate initial totals based on material type
        if (isLumberType(backingType)) {
          summary.totalLength = dimensions.width / 12; // Convert to feet
        } else if (isSheetType(backingType)) {
          summary.totalArea = (dimensions.width * dimensions.height) / 144; // Convert to sq ft
        }

        summaryMap.set(materialKey, summary);
      }
    });

    return Array.from(summaryMap.values()).sort((a, b) => {
      // Sort by type first, then by size
      if (a.type !== b.type) {
        return a.type.localeCompare(b.type);
      }
      return a.size.localeCompare(b.size);
    });
  }, [backings]);

  // Helper functions
  const isLumberType = (type: string): boolean => {
    return ['2x4', '2x6', '2x8', '2x10', 'blocking'].includes(type);
  };

  const isSheetType = (type: string): boolean => {
    return ['3/4_plywood', 'steel_plate'].includes(type);
  };

  const formatMaterialType = (type: string): string => {
    const typeMap: Record<string, string> = {
      '2x4': '2x4 Lumber',
      '2x6': '2x6 Lumber', 
      '2x8': '2x8 Lumber',
      '2x10': '2x10 Lumber',
      '3/4_plywood': '3/4" Plywood',
      'steel_plate': 'Steel Plate',
      'blocking': 'Blocking'
    };
    return typeMap[type] || type;
  };

  const getMaterialIcon = (type: string) => {
    if (isLumberType(type)) {
      return <Ruler className="w-4 h-4" />;
    } else if (isSheetType(type)) {
      return <Square className="w-4 h-4" />;
    }
    return <Package className="w-4 h-4" />;
  };

  const getUnitDisplay = (summary: MaterialSummary): string => {
    if (summary.totalLength !== undefined) {
      return `${summary.totalLength.toFixed(1)} linear feet`;
    } else if (summary.totalArea !== undefined) {
      return `${summary.totalArea.toFixed(1)} sq ft`;
    }
    return `${summary.count} pieces`;
  };

  // Calculate totals
  const totalPieces = materialSummaries.reduce((sum, item) => sum + item.count, 0);
  const totalLumberFeet = materialSummaries
    .filter(item => item.totalLength !== undefined)
    .reduce((sum, item) => sum + (item.totalLength || 0), 0);
  const totalSheetArea = materialSummaries
    .filter(item => item.totalArea !== undefined)
    .reduce((sum, item) => sum + (item.totalArea || 0), 0);

  // Export to CSV
  const exportToCsv = () => {
    const headers = ['Material Type', 'Size', 'Count', 'Total Length (ft)', 'Total Area (sq ft)', 'Locations'];
    
    const csvData = materialSummaries.map(summary => [
      formatMaterialType(summary.type),
      summary.size,
      summary.count.toString(),
      summary.totalLength?.toFixed(1) || '',
      summary.totalArea?.toFixed(1) || '',
      summary.locations.join('; ')
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `material_schedule_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5" />
            Material Schedule
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={exportToCsv}
            disabled={materialSummaries.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
        
        {/* Summary Stats */}
        <div className="flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Package className="w-3 h-3" />
            {totalPieces} total pieces
          </div>
          {totalLumberFeet > 0 && (
            <div className="flex items-center gap-1">
              <Ruler className="w-3 h-3" />
              {totalLumberFeet.toFixed(1)} linear feet
            </div>
          )}
          {totalSheetArea > 0 && (
            <div className="flex items-center gap-1">
              <Square className="w-3 h-3" />
              {totalSheetArea.toFixed(1)} sq ft
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {materialSummaries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No materials to display</p>
            <p className="text-sm">Add backing placements to see material calculations</p>
          </div>
        ) : (
          <div className="space-y-3">
            {materialSummaries.map((summary, index) => (
              <div
                key={`${summary.type}-${summary.size}`}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded bg-primary/10">
                    {getMaterialIcon(summary.type)}
                  </div>
                  
                  <div>
                    <div className="font-medium">
                      {formatMaterialType(summary.type)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {summary.size}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-medium">
                    {summary.count} piece{summary.count !== 1 ? 's' : ''}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {getUnitDisplay(summary)}
                  </div>
                </div>

                <Badge variant="secondary" className="ml-4">
                  {summary.locations.length} location{summary.locations.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}