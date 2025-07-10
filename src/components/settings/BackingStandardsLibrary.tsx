import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Search,
  Download,
  Upload,
  Edit2,
  Trash2,
  SortAsc,
  SortDesc,
  Ruler,
  ChevronDown
} from 'lucide-react';

export interface BackingStandard {
  id: string;
  category: 'Plumbing' | 'Electrical' | 'HVAC' | 'Fire Safety' | 'Accessibility' | 'AV' | 'Custom';
  componentType: string;
  componentIcon: string;
  conditions: {
    weightMin?: number;
    weightMax?: number;
    sizeMin?: number;
    sizeMax?: number;
    custom?: string;
  };
  backing: {
    material: string;
    thickness: string;
    width: number;
    height: number;
    orientation: 'horizontal' | 'vertical';
  };
  mounting: {
    heightAFF: number;
    heightReference: 'center' | 'top' | 'bottom';
    fasteners: string;
    spacing: number;
  };
  notes: string;
  images: string[];
  tags: string[];
  lastUpdated: Date;
  source: 'default' | 'custom' | 'imported';
}

// Pre-populated default standards
const defaultStandards: BackingStandard[] = [
  {
    id: '1',
    category: 'AV',
    componentType: 'TV Mount',
    componentIcon: '📺',
    conditions: { weightMax: 50 },
    backing: { material: '2x6', thickness: '1.5"', width: 16, height: 16, orientation: 'horizontal' },
    mounting: { heightAFF: 60, heightReference: 'center', fasteners: 'Wood screws', spacing: 16 },
    notes: 'For displays up to 50 lbs',
    images: [],
    tags: ['display', 'monitor', 'tv'],
    lastUpdated: new Date(),
    source: 'default'
  },
  {
    id: '2',
    category: 'AV',
    componentType: 'Large TV Mount',
    componentIcon: '📺',
    conditions: { weightMin: 50, weightMax: 100 },
    backing: { material: '2x8', thickness: '1.5"', width: 24, height: 16, orientation: 'horizontal' },
    mounting: { heightAFF: 60, heightReference: 'center', fasteners: 'Lag bolts', spacing: 16 },
    notes: 'For displays 50-100 lbs',
    images: [],
    tags: ['display', 'monitor', 'tv', 'large'],
    lastUpdated: new Date(),
    source: 'default'
  },
  {
    id: '3',
    category: 'Accessibility',
    componentType: 'Grab Bar',
    componentIcon: '🤲',
    conditions: { weightMax: 250 },
    backing: { material: '2x6', thickness: '1.5"', width: 24, height: 6, orientation: 'horizontal' },
    mounting: { heightAFF: 34, heightReference: 'center', fasteners: '#10 Screws', spacing: 12 },
    notes: 'ADA compliant grab bar mounting',
    images: [],
    tags: ['ada', 'accessibility', 'grab', 'safety'],
    lastUpdated: new Date(),
    source: 'default'
  },
  {
    id: '4',
    category: 'Plumbing',
    componentType: 'Wall Hung Lavatory',
    componentIcon: '🚿',
    conditions: { weightMax: 200 },
    backing: { material: '2x10', thickness: '1.5"', width: 24, height: 12, orientation: 'horizontal' },
    mounting: { heightAFF: 32, heightReference: 'top', fasteners: 'Carrier bolts', spacing: 16 },
    notes: 'Standard wall-hung lavatory support',
    images: [],
    tags: ['plumbing', 'sink', 'lavatory'],
    lastUpdated: new Date(),
    source: 'default'
  },
  {
    id: '5',
    category: 'Electrical',
    componentType: 'Panel Board',
    componentIcon: '⚡',
    conditions: { weightMax: 150 },
    backing: { material: '3/4" Plywood', thickness: '0.75"', width: 30, height: 42, orientation: 'vertical' },
    mounting: { heightAFF: 48, heightReference: 'center', fasteners: 'Wood screws', spacing: 16 },
    notes: 'Electrical panel mounting board',
    images: [],
    tags: ['electrical', 'panel', 'breaker'],
    lastUpdated: new Date(),
    source: 'default'
  },
  {
    id: '6',
    category: 'Fire Safety',
    componentType: 'Fire Extinguisher Cabinet',
    componentIcon: '🧯',
    conditions: { weightMax: 75 },
    backing: { material: '2x6', thickness: '1.5"', width: 16, height: 24, orientation: 'vertical' },
    mounting: { heightAFF: 42, heightReference: 'center', fasteners: 'Wood screws', spacing: 16 },
    notes: 'Semi-recessed cabinet support',
    images: [],
    tags: ['fire', 'safety', 'extinguisher', 'cabinet'],
    lastUpdated: new Date(),
    source: 'default'
  },
  {
    id: '7',
    category: 'HVAC',
    componentType: 'Unit Heater',
    componentIcon: '🌡️',
    conditions: { weightMax: 300 },
    backing: { material: 'Steel Angle', thickness: '1/4"', width: 48, height: 8, orientation: 'horizontal' },
    mounting: { heightAFF: 96, heightReference: 'bottom', fasteners: 'Threaded rod', spacing: 24 },
    notes: 'Heavy duty unit heater support',
    images: [],
    tags: ['hvac', 'heater', 'unit', 'suspended'],
    lastUpdated: new Date(),
    source: 'default'
  },
  {
    id: '8',
    category: 'AV',
    componentType: 'Projector Mount',
    componentIcon: '📽️',
    conditions: { weightMax: 30 },
    backing: { material: '2x6', thickness: '1.5"', width: 12, height: 12, orientation: 'horizontal' },
    mounting: { heightAFF: 108, heightReference: 'center', fasteners: 'Lag bolts', spacing: 16 },
    notes: 'Ceiling mounted projector',
    images: [],
    tags: ['projector', 'av', 'ceiling', 'mount'],
    lastUpdated: new Date(),
    source: 'default'
  },
  {
    id: '9',
    category: 'Accessibility',
    componentType: 'Fold Down Seat',
    componentIcon: '🪑',
    conditions: { weightMax: 300 },
    backing: { material: '2x8', thickness: '1.5"', width: 20, height: 16, orientation: 'horizontal' },
    mounting: { heightAFF: 17, heightReference: 'top', fasteners: 'Lag bolts', spacing: 12 },
    notes: 'ADA shower seat mounting',
    images: [],
    tags: ['ada', 'seat', 'shower', 'fold'],
    lastUpdated: new Date(),
    source: 'default'
  },
  {
    id: '10',
    category: 'Plumbing',
    componentType: 'Water Closet',
    componentIcon: '🚽',
    conditions: { weightMax: 400 },
    backing: { material: '2x10', thickness: '1.5"', width: 24, height: 16, orientation: 'horizontal' },
    mounting: { heightAFF: 15, heightReference: 'center', fasteners: 'Carrier bolts', spacing: 12 },
    notes: 'Wall-hung toilet carrier support',
    images: [],
    tags: ['toilet', 'wc', 'carrier', 'wall-hung'],
    lastUpdated: new Date(),
    source: 'default'
  }
];

type SortField = 'componentType' | 'category' | 'heightAFF' | 'lastUpdated';
type SortDirection = 'asc' | 'desc';

export function BackingStandardsLibrary() {
  const [standards, setStandards] = useState<BackingStandard[]>(defaultStandards);
  const [filteredStandards, setFilteredStandards] = useState<BackingStandard[]>(defaultStandards);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('componentType');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const { toast } = useToast();

  // Filter and sort standards
  useEffect(() => {
    let filtered = standards;

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(std => std.category === selectedCategory);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(std => 
        std.componentType.toLowerCase().includes(term) ||
        std.notes.toLowerCase().includes(term) ||
        std.tags.some(tag => tag.toLowerCase().includes(term)) ||
        std.backing.material.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortField) {
        case 'componentType':
          aVal = a.componentType.toLowerCase();
          bVal = b.componentType.toLowerCase();
          break;
        case 'category':
          aVal = a.category.toLowerCase();
          bVal = b.category.toLowerCase();
          break;
        case 'heightAFF':
          aVal = a.mounting.heightAFF;
          bVal = b.mounting.heightAFF;
          break;
        case 'lastUpdated':
          aVal = a.lastUpdated.getTime();
          bVal = b.lastUpdated.getTime();
          break;
        default:
          aVal = a.componentType.toLowerCase();
          bVal = b.componentType.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredStandards(filtered);
  }, [standards, searchTerm, selectedCategory, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ChevronDown className="h-4 w-4 opacity-50" />;
    return sortDirection === 'asc' ? 
      <SortAsc className="h-4 w-4" /> : 
      <SortDesc className="h-4 w-4" />;
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(standards, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'backing-standards.json';
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Standards Exported",
      description: "Your backing standards have been exported successfully."
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedStandards = JSON.parse(e.target?.result as string);
        setStandards(prev => [...prev, ...importedStandards.map((std: any) => ({
          ...std,
          id: `imported_${Date.now()}_${Math.random()}`,
          source: 'imported',
          lastUpdated: new Date()
        }))]);
        toast({
          title: "Standards Imported",
          description: `Imported ${importedStandards.length} backing standards.`
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Invalid file format. Please upload a valid JSON file.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const getConditionsText = (conditions: BackingStandard['conditions']) => {
    const parts = [];
    if (conditions.weightMin && conditions.weightMax) {
      parts.push(`${conditions.weightMin}-${conditions.weightMax} lbs`);
    } else if (conditions.weightMax) {
      parts.push(`≤ ${conditions.weightMax} lbs`);
    } else if (conditions.weightMin) {
      parts.push(`≥ ${conditions.weightMin} lbs`);
    }
    if (conditions.custom) {
      parts.push(conditions.custom);
    }
    return parts.join(', ') || 'No conditions';
  };

  const getBackingSpec = (backing: BackingStandard['backing']) => {
    return `${backing.material} (${backing.width}" × ${backing.height}")`;
  };

  const categories = ['all', 'Plumbing', 'Electrical', 'HVAC', 'Fire Safety', 'Accessibility', 'AV', 'Custom'];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Ruler className="h-5 w-5" />
              Backing Standards Library
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your backing requirements and installation standards
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{standards.length}</div>
            <div className="text-xs text-muted-foreground">Standards</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search components, notes, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <Button size="sm" variant="outline" asChild>
              <label>
                <Upload className="h-4 w-4 mr-2" />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </Button>
            
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Standard
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-semibold">{filteredStandards.length}</div>
            <div className="text-xs text-muted-foreground">Showing</div>
          </div>
          {categories.slice(1).map(category => (
            <div key={category} className="text-center">
              <div className="text-lg font-semibold">
                {standards.filter(std => std.category === category).length}
              </div>
              <div className="text-xs text-muted-foreground">{category}</div>
            </div>
          ))}
        </div>

        {/* Standards Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('componentType')}
                >
                  <div className="flex items-center gap-2">
                    Component
                    {getSortIcon('componentType')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center gap-2">
                    Category
                    {getSortIcon('category')}
                  </div>
                </TableHead>
                <TableHead>Conditions</TableHead>
                <TableHead>Backing Spec</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('heightAFF')}
                >
                  <div className="flex items-center gap-2">
                    Height AFF
                    {getSortIcon('heightAFF')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('lastUpdated')}
                >
                  <div className="flex items-center gap-2">
                    Updated
                    {getSortIcon('lastUpdated')}
                  </div>
                </TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStandards.map((standard) => (
                <TableRow key={standard.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{standard.componentIcon}</span>
                      <div>
                        <div className="font-medium">{standard.componentType}</div>
                        {standard.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {standard.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {standard.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{standard.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{standard.category}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {getConditionsText(standard.conditions)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {getBackingSpec(standard.backing)}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono">{standard.mounting.heightAFF}"</span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {standard.lastUpdated.toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={standard.source === 'default' ? 'default' : 'outline'}
                      className="text-xs"
                    >
                      {standard.source}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredStandards.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Ruler className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No standards found matching your criteria.</p>
            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}