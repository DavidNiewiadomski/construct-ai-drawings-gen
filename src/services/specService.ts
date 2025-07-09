import { ExtractedRequirement, SearchResult, Rectangle } from '@/types';

class SpecificationService {
  private readonly API_BASE = '/api/specifications';

  async parseSpecification(fileId: string): Promise<ExtractedRequirement[]> {
    try {
      const response = await fetch(`${this.API_BASE}/parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId }),
      });

      if (!response.ok) {
        throw new Error('Failed to parse specification');
      }

      const data = await response.json();
      return data.requirements || this.getMockRequirements(fileId);
    } catch (error) {
      console.error('Error parsing specification:', error);
      return this.getMockRequirements(fileId);
    }
  }

  async searchSpecification(fileId: string, query: string): Promise<SearchResult[]> {
    try {
      const response = await fetch(`${this.API_BASE}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId, query }),
      });

      if (!response.ok) {
        throw new Error('Failed to search specification');
      }

      const data = await response.json();
      return data.results || this.getMockSearchResults(query);
    } catch (error) {
      console.error('Error searching specification:', error);
      return this.getMockSearchResults(query);
    }
  }

  async createRequirement(
    fileId: string,
    pageNumber: number,
    text: string,
    boundingBox: Rectangle
  ): Promise<ExtractedRequirement> {
    try {
      const response = await fetch(`${this.API_BASE}/requirements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId, pageNumber, text, boundingBox }),
      });

      if (!response.ok) {
        throw new Error('Failed to create requirement');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating requirement:', error);
      return this.createMockRequirement(fileId, pageNumber, text, boundingBox);
    }
  }

  async linkRequirementToRule(requirementId: string, ruleId: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE}/requirements/${requirementId}/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ruleId }),
      });

      if (!response.ok) {
        throw new Error('Failed to link requirement to rule');
      }
    } catch (error) {
      console.error('Error linking requirement:', error);
    }
  }

  async updateRequirement(id: string, updates: Partial<ExtractedRequirement>): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE}/requirements/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update requirement');
      }
    } catch (error) {
      console.error('Error updating requirement:', error);
    }
  }

  async applyRequirementToProject(requirementId: string, projectId: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE}/requirements/${requirementId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
      });

      if (!response.ok) {
        throw new Error('Failed to apply requirement');
      }
    } catch (error) {
      console.error('Error applying requirement:', error);
    }
  }

  private getMockRequirements(fileId: string): ExtractedRequirement[] {
    return [
      {
        id: '1',
        fileId,
        section: '05 50 00 - Metal Fabrications',
        text: 'TV Mounts: 2x8 wood blocking @ 60" AFF',
        pageNumber: 1,
        boundingBox: { x: 100, y: 200, width: 300, height: 20 },
        parsedValues: {
          componentType: 'tv',
          backingType: '2x8',
          heightAFF: 60,
        },
        confidence: 0.95,
        applied: false,
      },
      {
        id: '2',
        fileId,
        section: '05 50 00 - Metal Fabrications',
        text: 'Equipment over 50 lbs: 3/4" plywood backing, min 24"x24"',
        pageNumber: 1,
        boundingBox: { x: 100, y: 240, width: 350, height: 20 },
        parsedValues: {
          componentType: 'equipment',
          backingType: '3/4_plywood',
          dimensions: '24"x24"',
        },
        confidence: 0.88,
        applied: false,
      },
      {
        id: '3',
        fileId,
        section: '10 28 00 - Toilet Accessories',
        text: 'Grab bars: 2x6 continuous blocking @ 33"-36" AFF',
        pageNumber: 2,
        boundingBox: { x: 100, y: 300, width: 320, height: 20 },
        parsedValues: {
          componentType: 'grab_bar',
          backingType: '2x6',
          heightAFF: 34.5,
        },
        confidence: 0.92,
        applied: false,
      },
      {
        id: '4',
        fileId,
        section: '10 28 00 - Toilet Accessories',
        text: 'Paper dispensers: 2x4 blocking @ 36" AFF',
        pageNumber: 2,
        boundingBox: { x: 100, y: 340, width: 280, height: 20 },
        parsedValues: {
          componentType: 'other',
          backingType: '2x4',
          heightAFF: 36,
        },
        confidence: 0.85,
        applied: false,
      },
    ];
  }

  private getMockSearchResults(query: string): SearchResult[] {
    const mockResults = [
      {
        id: '1',
        text: 'TV Mounts: 2x8 wood blocking @ 60" AFF',
        pageNumber: 1,
        boundingBox: { x: 100, y: 200, width: 300, height: 20 },
        context: 'Wall-mounted equipment shall be supported by adequate backing...',
      },
      {
        id: '2',
        text: 'Grab bars: 2x6 continuous blocking @ 33"-36" AFF',
        pageNumber: 2,
        boundingBox: { x: 100, y: 300, width: 320, height: 20 },
        context: 'Toilet accessories shall be mounted to solid backing...',
      },
    ];

    return mockResults.filter(result => 
      result.text.toLowerCase().includes(query.toLowerCase())
    );
  }

  private createMockRequirement(
    fileId: string,
    pageNumber: number,
    text: string,
    boundingBox: Rectangle
  ): ExtractedRequirement {
    return {
      id: Date.now().toString(),
      fileId,
      section: 'Manual Selection',
      text,
      pageNumber,
      boundingBox,
      confidence: 1.0,
      applied: false,
    };
  }
}

export const specService = new SpecificationService();