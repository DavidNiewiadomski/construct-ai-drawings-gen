import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExportWizard } from './ExportWizard';
import { NorthArrow, ScaleBar, BackingLegend, GeneralNotes, RevisionTable } from '../viewer/ProfessionalElements';

const mockBackings = [
  { id: '1', type: '2x8', x: 100, y: 100, width: 48, height: 6, heightAFF: 48, status: 'approved' as const },
  { id: '2', type: '2x6', x: 200, y: 150, width: 36, height: 6, heightAFF: 42, status: 'approved' as const },
  { id: '3', type: '3/4_plywood', x: 300, y: 200, width: 24, height: 24, heightAFF: 36, status: 'approved' as const },
  { id: '4', type: 'steel_plate', x: 150, y: 300, width: 12, height: 12, heightAFF: 60, status: 'approved' as const }
];

const sampleElements = {
  northArrow: {
    enabled: true,
    position: { x: 50, y: 50 },
    rotation: 15,
    scale: 1.2
  },
  scaleBar: {
    enabled: true,
    position: { x: 50, y: 400 },
    scale: 48,
    units: 'imperial' as const
  },
  legend: {
    enabled: true,
    position: { x: 600, y: 50 },
    backingTypes: [
      { type: '2x8', color: '#10b981', description: 'Heavy-duty TV mounts', count: 1 },
      { type: '2x6', color: '#3b82f6', description: 'Standard wall mounts', count: 1 },
      { type: '3/4" PLY', color: '#ef4444', description: 'Cabinet backing', count: 1 },
      { type: 'Steel Plate', color: '#6b7280', description: 'Structural reinforcement', count: 1 }
    ]
  },
  generalNotes: {
    enabled: true,
    position: { x: 50, y: 250 },
    notes: [
      'All backing shall be installed per manufacturer specifications and local building codes.',
      'Verify all dimensions in field before installation. Do not scale from drawings.',
      'Coordinate with other trades to avoid conflicts with MEP systems.',
      'All fasteners shall be appropriate for wall construction type.',
      'Contractor shall verify structural adequacy of existing framing.'
    ],
    title: 'GENERAL NOTES'
  },
  revisionTable: {
    enabled: true,
    position: { x: 600, y: 300 },
    revisions: [
      { number: 'A', date: '2024-01-15', description: 'Initial issue for review', by: 'JD' },
      { number: 'B', date: '2024-01-22', description: 'Revised per client comments', by: 'JD' },
      { number: 'C', date: '2024-01-30', description: 'Final issue for construction', by: 'JD' }
    ]
  }
};

export function ProfessionalElementsDemo() {
  const [showElements, setShowElements] = useState(true);
  const [isExportOpen, setIsExportOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Professional Drawing Elements Demo
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowElements(!showElements)}
              >
                {showElements ? 'Hide' : 'Show'} Elements
              </Button>
              <ExportWizard
                isOpen={isExportOpen}
                onOpenChange={setIsExportOpen}
                backings={mockBackings}
                projectName="Demo Project"
              >
                <Button>
                  Export with Professional Elements
                </Button>
              </ExportWizard>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            Professional drawing elements make your exports construction-ready with proper annotations,
            legends, and reference information.
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center">
                🧭
              </div>
              <div className="text-xs font-medium">North Arrow</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center">
                📏
              </div>
              <div className="text-xs font-medium">Graphic Scale</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center">
                🗺️
              </div>
              <div className="text-xs font-medium">Backing Legend</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center">
                📝
              </div>
              <div className="text-xs font-medium">General Notes</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center">
                📋
              </div>
              <div className="text-xs font-medium">Revision Table</div>
            </div>
          </div>

          {/* Drawing Canvas Preview */}
          <div className="relative w-full h-96 bg-gray-50 border border-gray-200 overflow-hidden rounded-lg">
            {/* Drawing Content */}
            <div className="absolute inset-4 border-2 border-dashed border-gray-300 rounded">
              <div className="text-center text-gray-400 mt-20">
                Drawing Content Area
                <br />
                <span className="text-xs">
                  Background drawing would appear here
                </span>
              </div>
              
              {/* Mock backing placements */}
              {mockBackings.map((backing) => (
                <div
                  key={backing.id}
                  className="absolute border-2 border-primary/60 bg-primary/20 rounded"
                  style={{
                    left: backing.x / 4,
                    top: backing.y / 4,
                    width: backing.width / 2,
                    height: backing.height * 2,
                  }}
                >
                  <div className="text-xs text-center p-1 font-medium">
                    {backing.type}
                  </div>
                </div>
              ))}
            </div>

            {/* Professional Elements Overlay */}
            {showElements && (
              <>
                <NorthArrow
                  rotation={sampleElements.northArrow.rotation}
                  position={sampleElements.northArrow.position}
                  scale={0.8}
                />
                
                <ScaleBar
                  position={sampleElements.scaleBar.position}
                  scale={sampleElements.scaleBar.scale / 4}
                  units={sampleElements.scaleBar.units}
                />
                
                <BackingLegend
                  position={sampleElements.legend.position}
                  backingTypes={sampleElements.legend.backingTypes}
                />
                
                <GeneralNotes
                  position={sampleElements.generalNotes.position}
                  notes={sampleElements.generalNotes.notes}
                  title={sampleElements.generalNotes.title}
                />
                
                <RevisionTable
                  position={sampleElements.revisionTable.position}
                  revisions={sampleElements.revisionTable.revisions}
                />
              </>
            )}
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            ✨ Click "Export with Professional Elements" to see these elements in action with full configuration options.
          </div>
        </CardContent>
      </Card>

      {/* Feature Benefits */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Badge className="mb-2">Construction Ready</Badge>
              <h4 className="font-medium mb-2">Professional Quality</h4>
              <p className="text-sm text-muted-foreground">
                Exports meet industry standards for construction documents with proper annotations and reference elements.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Badge className="mb-2" variant="outline">Customizable</Badge>
              <h4 className="font-medium mb-2">Flexible Configuration</h4>
              <p className="text-sm text-muted-foreground">
                All elements are fully configurable with positioning, content, and styling options.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Badge className="mb-2" variant="secondary">Automatic</Badge>
              <h4 className="font-medium mb-2">Smart Legends</h4>
              <p className="text-sm text-muted-foreground">
                Backing legends are automatically generated from your project's backing types and quantities.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}