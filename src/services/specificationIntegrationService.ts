import { supabase } from '@/integrations/supabase/client';

export interface SpecificationRequirement {
  id: string;
  file_id: string;
  requirement_text: string;
  spec_section: string;
  page_number: number;
  component_type?: string;
  backing_type?: string;
  height_aff?: number;
  weight_capacity?: number;
  dimensions?: { width: number; height: number } | null;
  notes?: string;
  confidence: number;
  applied: boolean;
  applied_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BackingRule {
  id: string;
  project_id: string;
  component_type: string;
  backing_type: string;
  height_aff: number;
  weight_min?: number;
  weight_max?: number;
  width_min?: number;
  width_max?: number;
  conditions?: string;
  notes?: string;
  source_type: 'manual' | 'specification' | 'ai_generated' | 'standard';
  source_reference?: string;
  requirement_id?: string;
  priority: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SpecificationFile {
  id: string;
  file_name: string;
  file_url: string;
  is_specification: boolean;
  spec_sections: string[];
  requirements_count?: number;
  applied_count?: number;
}

export class SpecificationIntegrationService {
  
  /**
   * Mark a file as a specification and extract requirements
   */
  static async processSpecificationFile(
    fileId: string, 
    extractRequirements: boolean = true
  ): Promise<{ success: boolean; requirements?: SpecificationRequirement[] }> {
    try {
      // Mark file as specification
      const { error: updateError } = await supabase
        .from('uploaded_files')
        .update({ 
          is_specification: true,
          metadata: { ...{}, processed_for_specs: true }
        })
        .eq('id', fileId);

      if (updateError) throw updateError;

      if (extractRequirements) {
        // Get file details for processing
        const { data: file } = await supabase
          .from('uploaded_files')
          .select('file_name, file_url')
          .eq('id', fileId)
          .single();

        if (file) {
          // Extract requirements using our specification service
          const requirements = await this.extractRequirementsFromFile(fileId, file.file_name);
          return { success: true, requirements };
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error processing specification file:', error);
      return { success: false };
    }
  }

  /**
   * Extract requirements from a specification file
   */
  static async extractRequirementsFromFile(
    fileId: string, 
    fileName: string
  ): Promise<SpecificationRequirement[]> {
    try {
      // This would call our AI service to extract requirements
      // For now, simulate with sample text
      const sampleText = this.getSampleSpecificationText();
      
      const { data, error } = await supabase.functions.invoke('parse-specification', {
        body: {
          text: sampleText,
          fileName,
          pageNumber: 1
        }
      });

      if (error) throw error;

      const extractedRequirements = data.requirements || [];
      
      // Save requirements to database
      const requirementsToInsert = extractedRequirements.map((req: any) => ({
        file_id: fileId,
        requirement_text: req.text,
        spec_section: req.specSection,
        page_number: req.pageNumber,
        component_type: req.parsedData.componentType,
        backing_type: req.parsedData.backingType,
        height_aff: req.parsedData.heightAFF,
        weight_capacity: req.parsedData.weight,
        dimensions: req.parsedData.dimensions,
        notes: req.parsedData.notes,
        confidence: req.confidence,
        applied: false
      }));

      if (requirementsToInsert.length > 0) {
        const { data: savedRequirements, error: insertError } = await supabase
          .from('specification_requirements')
          .insert(requirementsToInsert)
          .select();

        if (insertError) throw insertError;
        
        return (savedRequirements || []).map(req => ({
          ...req,
          dimensions: req.dimensions as { width: number; height: number } | null
        }));
      }

      return [];
    } catch (error) {
      console.error('Error extracting requirements:', error);
      return [];
    }
  }

  /**
   * Get all specification files for a project
   */
  static async getProjectSpecifications(projectId: string): Promise<SpecificationFile[]> {
    try {
      const { data, error } = await supabase
        .from('uploaded_files')
        .select(`
          id,
          file_name,
          file_url,
          is_specification,
          spec_sections,
          specification_requirements(count)
        `)
        .eq('project_id', projectId)
        .eq('is_specification', true);

      if (error) throw error;

      return (data || []).map(file => ({
        ...file,
        spec_sections: Array.isArray(file.spec_sections) 
          ? (file.spec_sections as string[])
          : [],
        requirements_count: file.specification_requirements?.[0]?.count || 0,
        applied_count: 0 // Would need a separate query for this
      }));
    } catch (error) {
      console.error('Error getting project specifications:', error);
      return [];
    }
  }

  /**
   * Get requirements for a specific file
   */
  static async getFileRequirements(fileId: string): Promise<SpecificationRequirement[]> {
    try {
      const { data, error } = await supabase
        .from('specification_requirements')
        .select('*')
        .eq('file_id', fileId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []).map(req => ({
        ...req,
        dimensions: req.dimensions as { width: number; height: number } | null
      }));
    } catch (error) {
      console.error('Error getting file requirements:', error);
      return [];
    }
  }

  /**
   * Apply a requirement and create a backing rule
   */
  static async applyRequirement(
    requirement: SpecificationRequirement, 
    projectId: string
  ): Promise<BackingRule | null> {
    try {
      // Create backing rule from requirement
      const ruleData = {
        project_id: projectId,
        component_type: requirement.component_type!,
        backing_type: requirement.backing_type!,
        height_aff: requirement.height_aff!,
        weight_min: requirement.weight_capacity ? Math.max(0, requirement.weight_capacity - 10) : undefined,
        weight_max: requirement.weight_capacity ? requirement.weight_capacity + 20 : undefined,
        width_min: requirement.dimensions?.width ? requirement.dimensions.width - 2 : undefined,
        width_max: requirement.dimensions?.width ? requirement.dimensions.width + 2 : undefined,
        notes: requirement.notes,
        source_type: 'specification' as const,
        source_reference: requirement.spec_section,
        requirement_id: requirement.id,
        priority: Math.round(requirement.confidence * 10)
      };

      const { data: rule, error: ruleError } = await supabase
        .from('backing_rules')
        .insert(ruleData)
        .select()
        .single();

      if (ruleError) throw ruleError;

      // Type assertion to ensure compatibility
      const typedRule = rule as BackingRule;

      // Mark requirement as applied
      const { error: updateError } = await supabase
        .from('specification_requirements')
        .update({ 
          applied: true, 
          applied_at: new Date().toISOString() 
        })
        .eq('id', requirement.id);

      if (updateError) throw updateError;

      return typedRule;
    } catch (error) {
      console.error('Error applying requirement:', error);
      return null;
    }
  }

  /**
   * Get backing rules for a project with source information
   */
  static async getProjectBackingRules(projectId: string): Promise<BackingRule[]> {
    try {
      const { data, error } = await supabase
        .from('backing_rules')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (error) throw error;
      return (data || []).map(rule => rule as BackingRule);
    } catch (error) {
      console.error('Error getting backing rules:', error);
      return [];
    }
  }

  /**
   * Get specification-driven vs default rules summary
   */
  static async getRulesSummary(projectId: string) {
    try {
      const { data, error } = await supabase
        .from('backing_rules')
        .select('source_type')
        .eq('project_id', projectId)
        .eq('is_active', true);

      if (error) throw error;

      const summary = {
        total: data?.length || 0,
        specification: data?.filter(r => r.source_type === 'specification').length || 0,
        manual: data?.filter(r => r.source_type === 'manual').length || 0,
        ai_generated: data?.filter(r => r.source_type === 'ai_generated').length || 0,
        standard: data?.filter(r => r.source_type === 'standard').length || 0
      };

      return summary;
    } catch (error) {
      console.error('Error getting rules summary:', error);
      return { total: 0, specification: 0, manual: 0, ai_generated: 0, standard: 0 };
    }
  }

  /**
   * Update file specification sections
   */
  static async updateFileSpecSections(fileId: string, sections: string[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('uploaded_files')
        .update({ spec_sections: sections })
        .eq('id', fileId);

      return !error;
    } catch (error) {
      console.error('Error updating spec sections:', error);
      return false;
    }
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