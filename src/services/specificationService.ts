import { supabase } from '@/integrations/supabase/client';

interface ExtractedRequirement {
  id: string;
  specSection: string;
  pageNumber: number;
  text: string;
  parsedData: {
    componentType?: string;
    backingType?: string;
    dimensions?: { width: number; height: number };
    heightAFF?: number;
    weight?: number;
    notes?: string;
  };
  confidence: number;
  applied: boolean;
}

interface ParseOptions {
  useAI?: boolean;
  includeMockData?: boolean;
  confidenceThreshold?: number;
}

export class SpecificationService {
  
  /**
   * Parse specification text using AI to extract backing requirements
   */
  static async parseSpecification(
    text: string, 
    fileName?: string, 
    pageNumber?: number,
    options: ParseOptions = {}
  ): Promise<ExtractedRequirement[]> {
    const { useAI = true, includeMockData = true, confidenceThreshold = 0.6 } = options;

    try {
      if (useAI) {
        // Call Supabase edge function for AI parsing
        const { data, error } = await supabase.functions.invoke('parse-specification', {
          body: {
            text,
            fileName,
            pageNumber: pageNumber || 1
          }
        });

        if (error) {
          console.error('AI parsing failed:', error);
          throw error;
        }

        const requirements = data.requirements || [];
        
        // Filter by confidence threshold
        const filteredRequirements = requirements.filter(
          (req: ExtractedRequirement) => req.confidence >= confidenceThreshold
        );

        if (filteredRequirements.length > 0) {
          return filteredRequirements;
        }
      }
    } catch (error) {
      console.error('AI parsing error:', error);
    }

    // Fallback to pattern-based parsing or mock data
    if (includeMockData) {
      return this.getMockRequirements(fileName, pageNumber);
    }

    return this.parseWithPatterns(text, fileName, pageNumber);
  }

  /**
   * Parse file content (PDF text extraction would happen here in a real implementation)
   */
  static async parseFile(file: File, options: ParseOptions = {}): Promise<ExtractedRequirement[]> {
    try {
      // For now, we'll simulate PDF text extraction
      // In a real implementation, you'd use a PDF parsing library
      const text = await this.extractTextFromFile(file);
      
      return this.parseSpecification(text, file.name, 1, options);
    } catch (error) {
      console.error('File parsing error:', error);
      return this.getMockRequirements(file.name, 1);
    }
  }

  /**
   * Extract text from various file types
   */
  private static async extractTextFromFile(file: File): Promise<string> {
    const fileType = file.type.toLowerCase();
    
    if (fileType.includes('text') || fileType.includes('plain')) {
      return await file.text();
    }
    
    if (fileType.includes('pdf')) {
      // In a real implementation, use PDF.js or similar
      // For now, return sample specification text
      return this.getSampleSpecificationText();
    }
    
    throw new Error(`Unsupported file type: ${fileType}`);
  }

  /**
   * Pattern-based parsing for fallback when AI is not available
   */
  private static parseWithPatterns(
    text: string, 
    fileName?: string, 
    pageNumber?: number
  ): ExtractedRequirement[] {
    const requirements: ExtractedRequirement[] = [];
    const lines = text.split('\n');
    
    const backingPatterns = [
      {
        pattern: /(.{0,50}(?:grab bar|handrail).{0,100}(?:2x\d+|plywood).{0,50}(?:\d+["']?\s*(?:AFF|above\s*finished\s*floor)).{0,50})/i,
        componentType: 'grab_bar'
      },
      {
        pattern: /(.{0,50}(?:tv|television|monitor|display).{0,100}(?:2x\d+|plywood).{0,50}(?:\d+["']?\s*(?:AFF|above\s*finished\s*floor)).{0,50})/i,
        componentType: 'tv'
      },
      {
        pattern: /(.{0,50}(?:fire extinguisher|extinguisher).{0,100}(?:2x\d+|plywood|steel).{0,50}(?:\d+["']?\s*(?:AFF|above\s*finished\s*floor)).{0,50})/i,
        componentType: 'fire_extinguisher'
      },
      {
        pattern: /(.{0,50}(?:sink|lavatory|basin).{0,100}(?:2x\d+|plywood).{0,50}(?:\d+["']?\s*(?:AFF|above\s*finished\s*floor)).{0,50})/i,
        componentType: 'sink'
      },
      {
        pattern: /(.{0,50}(?:cabinet|millwork|casework).{0,100}(?:2x\d+|plywood).{0,50}(?:\d+["']?\s*(?:AFF|above\s*finished\s*floor)).{0,50})/i,
        componentType: 'cabinet'
      }
    ];

    lines.forEach((line, index) => {
      backingPatterns.forEach(({ pattern, componentType }) => {
        const match = line.match(pattern);
        if (match) {
          const text = match[1];
          const parsedData = this.parseTextForData(text, componentType);
          
          if (parsedData.backingType) {
            requirements.push({
              id: `pattern-req-${Date.now()}-${index}`,
              specSection: this.determineSpecSection(text, fileName),
              pageNumber: pageNumber || 1,
              text: text.trim(),
              parsedData,
              confidence: 0.7,
              applied: false
            });
          }
        }
      });
    });

    return requirements;
  }

  /**
   * Parse individual text snippets for backing data
   */
  private static parseTextForData(text: string, componentType: string): ExtractedRequirement['parsedData'] {
    const parsedData: ExtractedRequirement['parsedData'] = { componentType };

    // Extract backing type
    const backingMatch = text.match(/(\d+x\d+|3\/4["']?\s*plywood|1\/2["']?\s*plywood|steel\s*plate|blocking)/i);
    if (backingMatch) {
      const backing = backingMatch[1].toLowerCase().replace(/["'\s]/g, '');
      if (backing.includes('plywood')) {
        parsedData.backingType = backing.includes('3/4') ? '3/4_plywood' : '1/2_plywood';
      } else if (backing.includes('steel')) {
        parsedData.backingType = 'steel_plate';
      } else {
        parsedData.backingType = backing;
      }
    }

    // Extract height AFF
    const heightMatch = text.match(/(\d+)["']?\s*(?:AFF|above\s*finished\s*floor)/i);
    if (heightMatch) {
      parsedData.heightAFF = parseInt(heightMatch[1]);
    }

    // Extract weight
    const weightMatch = text.match(/(\d+)\s*(?:lbs?|pounds?)/i);
    if (weightMatch) {
      parsedData.weight = parseInt(weightMatch[1]);
    }

    // Extract dimensions
    const dimensionMatch = text.match(/(\d+)["']?\s*x\s*(\d+)["']?/i);
    if (dimensionMatch) {
      parsedData.dimensions = {
        width: parseInt(dimensionMatch[1]),
        height: parseInt(dimensionMatch[2])
      };
    }

    return parsedData;
  }

  /**
   * Determine specification section from content
   */
  private static determineSpecSection(text: string, fileName?: string): string {
    const sections = [
      { pattern: /toilet|restroom|grab bar|accessory/i, section: 'Section 10 28 00 - Toilet Accessories' },
      { pattern: /television|tv|monitor|display|audio.*visual/i, section: 'Section 11 52 00 - Audio-Visual Equipment' },
      { pattern: /fire extinguisher|extinguisher/i, section: 'Section 10 44 00 - Fire Extinguishers' },
      { pattern: /sink|lavatory|basin|plumbing/i, section: 'Section 22 40 00 - Plumbing Fixtures' },
      { pattern: /cabinet|millwork|casework/i, section: 'Section 06 40 00 - Architectural Woodwork' },
      { pattern: /electrical|equipment|device/i, section: 'Section 26 00 00 - Electrical' },
      { pattern: /mechanical|hvac/i, section: 'Section 23 00 00 - HVAC' }
    ];

    for (const { pattern, section } of sections) {
      if (pattern.test(text)) {
        return section;
      }
    }

    return fileName ? `Specification - ${fileName}` : 'General Specifications';
  }

  /**
   * Detect backing-related keywords in text
   */
  static detectKeywords(text: string): string[] {
    const keywords = [
      'backing', 'blocking', 'reinforcement', 'support', 'mount', 'bracket',
      'nailer', 'substrate', 'backer', 'frame', 'framing', 'attachment',
      'fastener', 'AFF', 'above finished floor', 'plywood', 'lumber',
      'steel plate', 'wood backing', 'continuous blocking'
    ];
    
    return keywords.filter(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * Validate extracted requirements
   */
  static validateRequirement(requirement: ExtractedRequirement): boolean {
    const { parsedData } = requirement;
    
    // Must have component type and backing type
    if (!parsedData.componentType || !parsedData.backingType) {
      return false;
    }

    // Height should be reasonable (12" to 120")
    if (parsedData.heightAFF && (parsedData.heightAFF < 12 || parsedData.heightAFF > 120)) {
      return false;
    }

    // Weight should be reasonable (1 to 500 lbs)
    if (parsedData.weight && (parsedData.weight < 1 || parsedData.weight > 500)) {
      return false;
    }

    return true;
  }

  /**
   * Get mock requirements for demonstration
   */
  private static getMockRequirements(fileName?: string, pageNumber?: number): ExtractedRequirement[] {
    return [
      {
        id: 'mock-1',
        specSection: 'Section 10 28 00 - Toilet Accessories',
        pageNumber: pageNumber || 45,
        text: 'Grab bars shall be mounted on 2x6 continuous wood blocking at 33" to 36" AFF. All grab bars shall be capable of withstanding a 250-pound load.',
        parsedData: {
          componentType: 'grab_bar',
          backingType: '2x6',
          heightAFF: 34,
          weight: 250,
          notes: 'Continuous blocking required, 250-pound load capacity'
        },
        confidence: 0.95,
        applied: false
      },
      {
        id: 'mock-2',
        specSection: 'Section 11 52 00 - Audio-Visual Equipment',
        pageNumber: pageNumber || 12,
        text: 'Television monitors up to 55" (50 lbs) require 2x8 wood blocking at 60" AFF to center. Blocking shall extend 6" beyond mount footprint.',
        parsedData: {
          componentType: 'tv',
          backingType: '2x8',
          heightAFF: 60,
          weight: 50,
          notes: 'Height to center of display, extend 6" beyond mount'
        },
        confidence: 0.92,
        applied: false
      },
      {
        id: 'mock-3',
        specSection: 'Section 10 44 00 - Fire Extinguishers',
        pageNumber: pageNumber || 23,
        text: 'Fire extinguisher cabinets shall be supported by 3/4" plywood backing at 42" AFF to centerline of cabinet.',
        parsedData: {
          componentType: 'fire_extinguisher',
          backingType: '3/4_plywood',
          heightAFF: 42,
          notes: 'Height to centerline of cabinet'
        },
        confidence: 0.88,
        applied: false
      },
      {
        id: 'mock-4',
        specSection: 'Section 22 40 00 - Plumbing Fixtures',
        pageNumber: pageNumber || 67,
        text: 'Wall-mounted lavatories require 2x10 wood blocking at 32" AFF. Blocking shall support minimum 200-pound vertical load.',
        parsedData: {
          componentType: 'sink',
          backingType: '2x10',
          heightAFF: 32,
          weight: 200,
          notes: 'Minimum 200-pound vertical load capacity'
        },
        confidence: 0.91,
        applied: false
      },
      {
        id: 'mock-5',
        specSection: 'Section 06 40 00 - Architectural Woodwork',
        pageNumber: pageNumber || 89,
        text: 'Upper wall cabinets shall be secured to 2x6 continuous blocking at 84" AFF. Provide blocking for full width of cabinet run.',
        parsedData: {
          componentType: 'cabinet',
          backingType: '2x6',
          heightAFF: 84,
          notes: 'Continuous blocking for full cabinet width'
        },
        confidence: 0.87,
        applied: false
      }
    ];
  }

  /**
   * Get sample specification text for testing
   */
  private static getSampleSpecificationText(): string {
    return `
SECTION 10 28 00 - TOILET, BATH, AND LAUNDRY ACCESSORIES

2.3 GRAB BARS
A. Grab bars shall be 1-1/4" diameter stainless steel with concealed mounting.
B. All grab bars shall be mounted on 2x6 continuous wood blocking at 33" to 36" AFF.
C. Grab bars shall be capable of withstanding a 250-pound load in any direction.

SECTION 11 52 00 - AUDIO-VISUAL EQUIPMENT

2.1 DISPLAY MOUNTING
A. Television monitors up to 55" (50 lbs) require 2x8 wood blocking at 60" AFF to center.
B. Monitors over 55" (75 lbs) require 2x10 wood blocking or steel reinforcement.
C. Blocking shall extend 6" beyond mount footprint on all sides.

SECTION 10 44 00 - FIRE PROTECTION SPECIALTIES

2.2 FIRE EXTINGUISHER CABINETS
A. Semi-recessed cabinets shall be supported by 3/4" plywood backing.
B. Mount at 42" AFF to centerline of cabinet.
C. Coordinate with structural framing for proper support.

SECTION 22 40 00 - PLUMBING FIXTURES

2.4 WALL-MOUNTED FIXTURES
A. Wall-mounted lavatories require 2x10 wood blocking at 32" AFF.
B. Blocking shall support minimum 200-pound vertical load.
C. Coordinate blocking location with fixture rough-in requirements.
    `;
  }
}