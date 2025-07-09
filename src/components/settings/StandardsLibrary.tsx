import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, Search, Upload, Download, Filter, MoreHorizontal, 
  Edit, Trash2, Eye, Copy, Settings
} from 'lucide-react';
import { BackingStandard } from '@/types';
import { settingsService } from '@/services/settingsService';
import { StandardsForm } from './StandardsForm';
import { useToast } from '@/hooks/use-toast';

export function StandardsLibrary() {
  const [standards, setStandards] = useState<BackingStandard[]>([]);
  const [filteredStandards, setFilteredStandards] = useState<BackingStandard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStandard, setEditingStandard] = useState<BackingStandard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadStandards();
  }, []);

  useEffect(() => {
    filterStandards();
  }, [standards, searchQuery, categoryFilter]);

  const loadStandards = async () => {
    try {
      setIsLoading(true);
      const data = await settingsService.getStandards();
      setStandards(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load backing standards",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterStandards = () => {
    let filtered = standards;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (standard) =>
          standard.componentType.toLowerCase().includes(query) ||
          standard.backing.material.toLowerCase().includes(query) ||
          standard.notes.toLowerCase().includes(query) ||
          standard.category.toLowerCase().includes(query)
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((standard) => standard.category === categoryFilter);
    }

    setFilteredStandards(filtered);
  };

  const handleSaveStandard = async (standard: BackingStandard) => {
    try {
      await settingsService.saveStandard(standard);
      await loadStandards();
      setIsFormOpen(false);
      setEditingStandard(null);
      toast({
        title: "Success",
        description: "Backing standard saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save backing standard",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStandard = async (id: string) => {
    try {
      await settingsService.deleteStandard(id);
      await loadStandards();
      toast({
        title: "Success",
        description: "Backing standard deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete backing standard",
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await settingsService.exportStandardsCSV();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'backing-standards.csv';
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: "Success",
        description: "Standards exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export standards",
        variant: "destructive",
      });
    }
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await settingsService.importStandards(file);
      await loadStandards();
      toast({
        title: "Success",
        description: "Standards imported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import standards",
        variant: "destructive",
      });
    }
  };

  const categories = Array.from(new Set(standards.map(s => s.category)));

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search standards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-[300px]"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingStandard(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Standard
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingStandard ? 'Edit Backing Standard' : 'Add New Backing Standard'}
                </DialogTitle>
              </DialogHeader>
              <StandardsForm
                standard={editingStandard}
                onSave={handleSaveStandard}
                onCancel={() => {
                  setIsFormOpen(false);
                  setEditingStandard(null);
                }}
              />
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>

          <Button variant="outline" asChild>
            <label>
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="hidden"
              />
            </label>
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{standards.length}</div>
            <p className="text-xs text-muted-foreground">Total Standards</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">Categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {new Set(standards.map(s => s.componentType)).size}
            </div>
            <p className="text-xs text-muted-foreground">Component Types</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {new Set(standards.map(s => s.backing.material)).size}
            </div>
            <p className="text-xs text-muted-foreground">Backing Types</p>
          </CardContent>
        </Card>
      </div>

      {/* Standards Table */}
      <Card>
        <CardHeader>
          <CardTitle>Standards ({filteredStandards.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component Type</TableHead>
                    <TableHead>Conditions</TableHead>
                    <TableHead>Backing</TableHead>
                    <TableHead>Height AFF</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStandards.map((standard) => (
                    <TableRow key={standard.id}>
                      <TableCell className="font-medium">
                        {standard.componentType}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {standard.conditions.weightMin !== undefined && (
                            <Badge variant="outline" className="text-xs">
                              {standard.conditions.weightMin}-{standard.conditions.weightMax} lbs
                            </Badge>
                          )}
                          {standard.conditions.widthMin !== undefined && (
                            <Badge variant="outline" className="text-xs">
                              {standard.conditions.widthMin}-{standard.conditions.widthMax}"
                            </Badge>
                          )}
                          {standard.conditions.custom && (
                            <Badge variant="outline" className="text-xs">
                              {standard.conditions.custom}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{standard.backing.material}</div>
                          <div className="text-xs text-muted-foreground">
                            {standard.backing.width}" × {standard.backing.height}"
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {standard.backing.fasteners}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{standard.heightAFF}"</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{standard.category}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(standard.updatedAt).toLocaleDateString()}
                        <br />
                        by {standard.updatedBy}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingStandard(standard);
                                setIsFormOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const newStandard = {
                                  ...standard,
                                  id: Date.now().toString(),
                                  updatedAt: new Date().toISOString(),
                                  updatedBy: 'User',
                                };
                                setEditingStandard(newStandard);
                                setIsFormOpen(true);
                              }}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteStandard(standard.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!isLoading && filteredStandards.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No standards found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}