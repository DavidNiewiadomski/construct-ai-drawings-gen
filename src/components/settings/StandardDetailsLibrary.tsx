import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Plus,
  FileText,
  Tv,
  ShieldCheck,
  Package,
  Wrench,
  Home,
  Building
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { standardDetails, getCategories, getDetailsByCategory } from '@/data/standardDetails';
import type { StandardDetail } from '@/types';

interface StandardDetailsLibraryProps {
  onSelectDetail?: (detail: StandardDetail) => void;
  onAddToProject?: (detail: StandardDetail) => void;
  className?: string;
}

export function StandardDetailsLibrary({ 
  onSelectDetail, 
  onAddToProject,
  className 
}: StandardDetailsLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDetail, setSelectedDetail] = useState<StandardDetail | null>(null);

  const categories = getCategories();

  const filteredDetails = useMemo(() => {
    let details = selectedCategory === 'all' 
      ? standardDetails 
      : getDetailsByCategory(selectedCategory as StandardDetail['category']);

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      details = details.filter(detail => 
        detail.name.toLowerCase().includes(term) ||
        detail.description.toLowerCase().includes(term) ||
        detail.tags.some(tag => tag.toLowerCase().includes(term)) ||
        detail.specifications.backingType.toLowerCase().includes(term)
      );
    }

    return details;
  }, [selectedCategory, searchTerm]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tv_mount': return <Tv className="w-4 h-4" />;
      case 'grab_bar': return <ShieldCheck className="w-4 h-4" />;
      case 'cabinet': return <Package className="w-4 h-4" />;
      case 'equipment': return <Wrench className="w-4 h-4" />;
      case 'fixture': return <Home className="w-4 h-4" />;
      case 'structural': return <Building className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleDetailClick = (detail: StandardDetail) => {
    setSelectedDetail(detail);
    onSelectDetail?.(detail);
  };

  const renderDetailCard = (detail: StandardDetail) => (
    <Card 
      key={detail.id}
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        selectedDetail?.id === detail.id && "ring-2 ring-primary"
      )}
      onClick={() => handleDetailClick(detail)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getCategoryIcon(detail.category)}
            <CardTitle className="text-base">{detail.name}</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            {detail.specifications.backingType}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{detail.description}</p>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Image placeholder */}
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>

          {/* Specifications */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="font-medium">Size:</span> {detail.specifications.dimensions.width}"×{detail.specifications.dimensions.height}"
            </div>
            <div>
              <span className="font-medium">Load:</span> {detail.specifications.loadRating} lbs
            </div>
            <div>
              <span className="font-medium">Height:</span> {detail.specifications.heightAFF}" AFF
            </div>
            <div>
              <span className="font-medium">Spacing:</span> {detail.specifications.spacing}"
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {detail.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                {tag}
              </Badge>
            ))}
            {detail.tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                +{detail.tags.length - 3}
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                handleDetailClick(detail);
              }}
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
            {onAddToProject && (
              <Button 
                size="sm" 
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToProject(detail);
                }}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderDetailView = (detail: StandardDetail) => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold">{detail.name}</h3>
          <p className="text-muted-foreground">{detail.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            DWG
          </Button>
          {onAddToProject && (
            <Button size="sm" onClick={() => onAddToProject(detail)}>
              <Plus className="w-4 h-4 mr-2" />
              Add to Project
            </Button>
          )}
        </div>
      </div>

      {/* Image */}
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <FileText className="w-16 h-16 text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Detail Drawing</span>
      </div>

      {/* Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Specifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium">Backing Type:</span> {detail.specifications.backingType}
            </div>
            <div>
              <span className="font-medium">Dimensions:</span> {detail.specifications.dimensions.width}" × {detail.specifications.dimensions.height}" × {detail.specifications.dimensions.thickness}"
            </div>
            <div>
              <span className="font-medium">Height AFF:</span> {detail.specifications.heightAFF}"
            </div>
            <div>
              <span className="font-medium">Fasteners:</span> {detail.specifications.fasteners}
            </div>
            <div>
              <span className="font-medium">Spacing:</span> {detail.specifications.spacing}" O.C.
            </div>
            <div>
              <span className="font-medium">Load Rating:</span> {detail.specifications.loadRating} lbs
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Applicability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium">Component Types:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {detail.applicability.componentTypes.map(type => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {type.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <span className="font-medium">Weight Range:</span> {detail.applicability.weightRange.min} - {detail.applicability.weightRange.max} lbs
            </div>
            <div>
              <span className="font-medium">Size Range:</span> {detail.applicability.sizeRange.minWidth}"×{detail.applicability.sizeRange.minHeight}" to {detail.applicability.sizeRange.maxWidth}"×{detail.applicability.sizeRange.maxHeight}"
            </div>
            <div>
              <span className="font-medium">Wall Types:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {detail.applicability.wallTypes.map(type => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {type.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Installation Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {detail.specifications.notes.map((note, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* References */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">References</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {detail.references.code && (
            <div><span className="font-medium">Code:</span> {detail.references.code}</div>
          )}
          {detail.references.standard && (
            <div><span className="font-medium">Standard:</span> {detail.references.standard}</div>
          )}
          {detail.references.manufacturer && (
            <div><span className="font-medium">Manufacturer:</span> {detail.references.manufacturer}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Standard Details Library</h2>
          <p className="text-muted-foreground">Pre-approved backing details for common applications</p>
        </div>
        <Badge variant="outline">
          {filteredDetails.length} detail{filteredDetails.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search details, tags, or backing types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Content */}
      <Tabs value={selectedDetail ? 'detail' : 'library'} className="space-y-4">
        <TabsList>
          <TabsTrigger value="library">Library</TabsTrigger>
          {selectedDetail && (
            <TabsTrigger value="detail">Detail View</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="library" className="space-y-4">
          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="all" className="text-xs">
                All ({standardDetails.length})
              </TabsTrigger>
              {categories.map(category => (
                <TabsTrigger key={category.id} value={category.id} className="text-xs">
                  {getCategoryIcon(category.id)}
                  <span className="ml-1 hidden sm:inline">{category.name}</span>
                  <span className="ml-1">({category.count})</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredDetails.map(renderDetailCard)}
              </div>

              {filteredDetails.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No details found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or selected category.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {selectedDetail && (
          <TabsContent value="detail">
            {renderDetailView(selectedDetail)}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}