import { useState, useMemo } from 'react';
import { 
  Eye, EyeOff, CheckCircle, XCircle, AlertTriangle, Zap, 
  Monitor, Flame, Droplets, Lightbulb, Wind, ChefHat,
  Edit3, Filter, Search, Sliders, FileText, MapPin,
  Tv, Waves, ThermometerSun, Fan, Microwave
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { AIDetectedComponent } from '@/types';

// Mock detected components
const mockDetections: AIDetectedComponent[] = [
  {
    id: '1',
    type: 'tv_mount',
    confidence: 0.95,
    text: '55" TV',
    location: 'Conference Room',
    pageNumber: 2,
    boundingBox: { x: 100, y: 200, width: 50, height: 30 },
    confirmed: false,
    needsBacking: true,
    position: { x: 100, y: 200 },
    properties: { size: '55"', weight: '35 lbs' }
  },
  {
    id: '2',
    type: 'fire_extinguisher',
    confidence: 0.88,
    text: 'FE',
    location: 'Corridor',
    pageNumber: 3,
    boundingBox: { x: 300, y: 150, width: 30, height: 40 },
    confirmed: true,
    needsBacking: true,
    position: { x: 300, y: 150 },
    properties: { type: '5lb ABC', height: '15"' }
  },
  {
    id: '3',
    type: 'sink',
    confidence: 0.92,
    text: 'Kitchen Sink',
    location: 'Kitchen',
    pageNumber: 1,
    boundingBox: { x: 450, y: 300, width: 60, height: 40 },
    confirmed: false,
    needsBacking: false,
    position: { x: 450, y: 300 },
    properties: { material: 'Stainless Steel', bowls: 'Double' }
  },
  {
    id: '4',
    type: 'light_fixture',
    confidence: 0.75,
    text: 'LED Panel',
    location: 'Office',
    pageNumber: 2,
    boundingBox: { x: 200, y: 100, width: 48, height: 48 },
    confirmed: false,
    needsBacking: true,
    position: { x: 200, y: 100 },
    properties: { type: 'LED Panel', wattage: '40W' }
  },
  {
    id: '5',
    type: 'hvac_vent',
    confidence: 0.85,
    text: 'Return Air',
    location: 'Lobby',
    pageNumber: 1,
    boundingBox: { x: 500, y: 50, width: 24, height: 16 },
    confirmed: true,
    needsBacking: false,
    position: { x: 500, y: 50 },
    properties: { size: '24x16', type: 'Return' }
  },
  {
    id: '6',
    type: 'exhaust_fan',
    confidence: 0.91,
    text: 'Exhaust Fan',
    location: 'Restroom',
    pageNumber: 3,
    boundingBox: { x: 350, y: 80, width: 12, height: 12 },
    confirmed: false,
    needsBacking: true,
    position: { x: 350, y: 80 },
    properties: { cfm: '110', noise: '0.3 sones' }
  },
  {
    id: '7',
    type: 'thermostat',
    confidence: 0.89,
    text: 'TSTAT',
    location: 'Hallway',
    pageNumber: 2,
    boundingBox: { x: 150, y: 250, width: 4, height: 6 },
    confirmed: true,
    needsBacking: false,
    position: { x: 150, y: 250 },
    properties: { type: 'Digital', zones: '2' }
  },
  {
    id: '8',
    type: 'smoke_detector',
    confidence: 0.96,
    text: 'SD',
    location: 'Reception',
    pageNumber: 1,
    boundingBox: { x: 250, y: 180, width: 8, height: 8 },
    confirmed: true,
    needsBacking: false,
    position: { x: 250, y: 180 },
    properties: { type: 'Photoelectric', battery: 'Lithium' }
  },
  {
    id: '9',
    type: 'projector',
    confidence: 0.82,
    text: 'Projector',
    location: 'Meeting Room B',
    pageNumber: 2,
    boundingBox: { x: 180, y: 120, width: 24, height: 16 },
    confirmed: false,
    needsBacking: true,
    position: { x: 180, y: 120 },
    properties: { lumens: '3500', resolution: '1080p' }
  },
  {
    id: '10',
    type: 'cabinet',
    confidence: 0.78,
    text: 'Wall Cabinet',
    location: 'Storage',
    pageNumber: 3,
    boundingBox: { x: 400, y: 220, width: 36, height: 48 },
    confirmed: false,
    needsBacking: true,
    position: { x: 400, y: 220 },
    properties: { material: 'Wood', doors: '2' }
  },
  {
    id: '11',
    type: 'outlet',
    confidence: 0.93,
    text: 'GFCI',
    location: 'Kitchen',
    pageNumber: 1,
    boundingBox: { x: 320, y: 280, width: 4, height: 4 },
    confirmed: true,
    needsBacking: false,
    position: { x: 320, y: 280 },
    properties: { type: 'GFCI', voltage: '120V' }
  },
  {
    id: '12',
    type: 'water_heater',
    confidence: 0.87,
    text: 'WH',
    location: 'Utility Room',
    pageNumber: 3,
    boundingBox: { x: 480, y: 350, width: 30, height: 60 },
    confirmed: false,
    needsBacking: false,
    position: { x: 480, y: 350 },
    properties: { capacity: '50 gal', type: 'Electric' }
  }
];

const componentIcons = {
  tv_mount: Monitor,
  fire_extinguisher: Flame,
  sink: Droplets,
  light_fixture: Lightbulb,
  hvac_vent: Wind,
  exhaust_fan: Fan,
  thermostat: ThermometerSun,
  smoke_detector: AlertTriangle,
  projector: Tv,
  cabinet: FileText,
  outlet: Zap,
  water_heater: Waves,
  default: Eye
};

const componentTypes = [
  'tv_mount', 'fire_extinguisher', 'sink', 'light_fixture', 
  'hvac_vent', 'exhaust_fan', 'thermostat', 'smoke_detector',
  'projector', 'cabinet', 'outlet', 'water_heater'
];

interface DetectionReviewStepProps {
  detectedComponents?: AIDetectedComponent[];
  onComponentsChange?: (components: AIDetectedComponent[]) => void;
}

export function DetectionReviewStep({ 
  detectedComponents = mockDetections, 
  onComponentsChange = () => {} 
}: DetectionReviewStepProps) {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'needsReview' | 'confirmed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [confidenceThreshold, setConfidenceThreshold] = useState([0]);
  const [showFilters, setShowFilters] = useState(false);

  const filteredComponents = useMemo(() => {
    let filtered = detectedComponents;

    // Filter by view mode
    switch (viewMode) {
      case 'needsReview':
        filtered = filtered.filter(c => !c.confirmed && c.confidence < 0.9);
        break;
      case 'confirmed':
        filtered = filtered.filter(c => c.confirmed);
        break;
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by component types
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(c => selectedTypes.includes(c.type));
    }

    // Filter by confidence threshold
    filtered = filtered.filter(c => c.confidence >= confidenceThreshold[0] / 100);

    return filtered;
  }, [detectedComponents, viewMode, searchTerm, selectedTypes, confidenceThreshold]);

  const confirmedComponents = detectedComponents.filter(c => c.confirmed);
  const needsReviewComponents = detectedComponents.filter(c => !c.confirmed && c.confidence < 0.9);
  const backingRequiredComponents = detectedComponents.filter(c => c.needsBacking);

  const handleComponentToggle = (componentId: string) => {
    onComponentsChange(
      detectedComponents.map(component =>
        component.id === componentId
          ? { ...component, confirmed: !component.confirmed }
          : component
      )
    );
  };

  const handleComponentTypeChange = (componentId: string, newType: string) => {
    onComponentsChange(
      detectedComponents.map(component =>
        component.id === componentId
          ? { ...component, type: newType }
          : component
      )
    );
  };

  const handleConfirmAll = () => {
    onComponentsChange(
      detectedComponents.map(component => ({ ...component, confirmed: true }))
    );
  };

  const handleRejectAll = () => {
    onComponentsChange(
      detectedComponents.map(component => ({ ...component, confirmed: false }))
    );
  };

  const handleTypeFilter = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedTypes([...selectedTypes, type]);
    } else {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return 'High';
    if (confidence >= 0.7) return 'Medium';
    return 'Low';
  };

  const getComponentIcon = (type: string) => {
    return componentIcons[type as keyof typeof componentIcons] || componentIcons.default;
  };

  const overallConfidence = detectedComponents.length > 0 
    ? detectedComponents.reduce((sum, c) => sum + c.confidence, 0) / detectedComponents.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{detectedComponents.length}</p>
                <p className="text-sm text-muted-foreground">Components Detected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{confirmedComponents.length}</p>
                <p className="text-sm text-muted-foreground">Confirmed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{needsReviewComponents.length}</p>
                <p className="text-sm text-muted-foreground">Needs Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{backingRequiredComponents.length}</p>
                <p className="text-sm text-muted-foreground">Need Backing</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Confidence */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-foreground">Overall Detection Confidence</h4>
            <Badge variant="outline" className={getConfidenceColor(overallConfidence)}>
              {getConfidenceLabel(overallConfidence)} ({Math.round(overallConfidence * 100)}%)
            </Badge>
          </div>
          <Progress value={overallConfidence * 100} className="h-2" />
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by text, location, or component type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="space-y-4 border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Component Type Filters */}
                <div>
                  <h5 className="font-medium mb-2">Component Types</h5>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {componentTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={selectedTypes.includes(type)}
                          onCheckedChange={(checked) => handleTypeFilter(type, checked as boolean)}
                        />
                        <label htmlFor={type} className="text-sm capitalize cursor-pointer">
                          {type.replace('_', ' ')}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Confidence Threshold */}
                <div>
                  <h5 className="font-medium mb-2">
                    Confidence Threshold: {confidenceThreshold[0]}%
                  </h5>
                  <Slider
                    value={confidenceThreshold}
                    onValueChange={setConfidenceThreshold}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Quick Actions */}
                <div>
                  <h5 className="font-medium mb-2">Quick Actions</h5>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedTypes([]);
                        setConfidenceThreshold([0]);
                      }}
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleConfirmAll}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Confirm All
          </Button>
          <Button variant="outline" size="sm" onClick={handleRejectAll}>
            <XCircle className="h-4 w-4 mr-2" />
            Reject All
          </Button>
        </div>

        <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
          <TabsList>
            <TabsTrigger value="all">All ({detectedComponents.length})</TabsTrigger>
            <TabsTrigger value="needsReview">Review ({needsReviewComponents.length})</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed ({confirmedComponents.length})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Components Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredComponents.map((component) => {
          const IconComponent = getComponentIcon(component.type);
          
          return (
            <Card
              key={component.id}
              className={`
                cursor-pointer transition-all duration-200 hover:shadow-md
                ${component.confirmed 
                  ? 'border-green-200 bg-green-50/50' 
                  : component.confidence < 0.7
                  ? 'border-red-200 bg-red-50/50'
                  : 'border-yellow-200 bg-yellow-50/50'
                }
                ${selectedComponent === component.id ? 'ring-2 ring-primary' : ''}
              `}
              onClick={() => setSelectedComponent(
                selectedComponent === component.id ? null : component.id
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-5 w-5 text-primary" />
                    <Select
                      value={component.type}
                      onValueChange={(value) => handleComponentTypeChange(component.id, value)}
                    >
                      <SelectTrigger 
                        className="w-auto h-auto p-0 border-none shadow-none font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {componentTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getConfidenceColor(component.confidence)}`}
                    >
                      {Math.round(component.confidence * 100)}%
                    </Badge>
                    <Checkbox
                      checked={component.confirmed}
                      onCheckedChange={() => handleComponentToggle(component.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Thumbnail placeholder */}
                <div className="w-full h-20 bg-muted rounded-md mb-3 flex items-center justify-center">
                  <IconComponent className="h-8 w-8 text-muted-foreground" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Text:</span>
                    <span className="font-medium">{component.text}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">{component.location}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Page:</span>
                    <span className="font-medium">{component.pageNumber}</span>
                  </div>
                  
                  {component.properties && Object.keys(component.properties).length > 0 && (
                    <div className="space-y-1 pt-2 border-t">
                      {Object.entries(component.properties).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground capitalize">{key}:</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2">
                      {component.needsBacking && (
                        <Badge variant="secondary" className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          Needs Backing
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Edit functionality
                        }}
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleComponentToggle(component.id);
                        }}
                      >
                        {component.confirmed ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredComponents.length === 0 && (
        <div className="text-center py-8">
          <EyeOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Components Found
          </h3>
          <p className="text-muted-foreground">
            {searchTerm || selectedTypes.length > 0 || confidenceThreshold[0] > 0
              ? 'Try adjusting your filters or search terms.'
              : viewMode === 'needsReview' 
              ? 'All components have high confidence scores.'
              : viewMode === 'confirmed'
              ? 'No components have been confirmed yet.'
              : 'No components detected.'
            }
          </p>
        </div>
      )}
    </div>
  );
}