import type { StandardDetail } from '@/types';

export const standardDetails: StandardDetail[] = [
  // TV MOUNT DETAILS
  {
    id: 'tv_mount_small',
    name: 'Small TV Mount Backing',
    description: '2x6 backing for TVs under 50 lbs (32"-43")',
    category: 'tv_mount',
    image: '/details/tv_mount_small.svg',
    dwgFile: '/details/tv_mount_small.dwg',
    specifications: {
      backingType: '2x6',
      dimensions: { width: 24, height: 16, thickness: 5.5 },
      heightAFF: 48,
      fasteners: '3" wood screws @ 16" O.C.',
      spacing: 16,
      loadRating: 75,
      notes: [
        'Center backing behind TV mount location',
        'Verify stud locations before installation',
        'Use appropriate wall anchors for TV weight'
      ]
    },
    applicability: {
      componentTypes: ['tv', 'monitor', 'display'],
      weightRange: { min: 20, max: 50 },
      sizeRange: { minWidth: 28, maxWidth: 43, minHeight: 16, maxHeight: 24 },
      wallTypes: ['drywall', 'gypsum_board']
    },
    references: {
      code: 'IBC 1604.8.2',
      standard: 'VESA mounting standards',
      manufacturer: 'Generic'
    },
    tags: ['tv', 'mount', 'residential', 'light_duty'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  {
    id: 'tv_mount_large',
    name: 'Large TV Mount Backing',
    description: '2x8 backing for TVs over 50 lbs (55"-75")',
    category: 'tv_mount',
    image: '/details/tv_mount_large.svg',
    dwgFile: '/details/tv_mount_large.dwg',
    specifications: {
      backingType: '2x8',
      dimensions: { width: 32, height: 24, thickness: 7.25 },
      heightAFF: 54,
      fasteners: '3.5" wood screws @ 12" O.C.',
      spacing: 12,
      loadRating: 150,
      notes: [
        'Extend backing full width of TV',
        'Install between studs with blocking',
        'Consider conduit chase for cable management'
      ]
    },
    applicability: {
      componentTypes: ['tv', 'large_display', 'video_wall'],
      weightRange: { min: 50, max: 150 },
      sizeRange: { minWidth: 48, maxWidth: 75, minHeight: 27, maxHeight: 42 },
      wallTypes: ['drywall', 'gypsum_board', 'masonry']
    },
    references: {
      code: 'IBC 1604.8.2',
      standard: 'VESA mounting standards',
      manufacturer: 'Generic'
    },
    tags: ['tv', 'mount', 'commercial', 'heavy_duty'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // GRAB BAR DETAILS
  {
    id: 'grab_bar_standard',
    name: 'ADA Grab Bar Backing',
    description: '2x8 backing for ADA compliant grab bars',
    category: 'grab_bar',
    image: '/details/grab_bar_standard.svg',
    dwgFile: '/details/grab_bar_standard.dwg',
    specifications: {
      backingType: '2x8',
      dimensions: { width: 42, height: 8, thickness: 7.25 },
      heightAFF: 36,
      fasteners: '#12 x 3" wood screws @ 6" O.C.',
      spacing: 6,
      loadRating: 250,
      notes: [
        'Must support 250 lbs minimum per ADA',
        'Backing extends 12" beyond grab bar ends',
        'Coordinate with plumbing rough-in'
      ]
    },
    applicability: {
      componentTypes: ['grab_bar', 'safety_rail', 'handrail'],
      weightRange: { min: 5, max: 10 },
      sizeRange: { minWidth: 18, maxWidth: 42, minHeight: 1.5, maxHeight: 2 },
      wallTypes: ['drywall', 'tile_backer', 'cement_board']
    },
    references: {
      code: 'ADA 2010 Standards 609.8',
      standard: 'ICC A117.1',
      manufacturer: 'Generic'
    },
    tags: ['grab_bar', 'ada', 'accessibility', 'bathroom'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  {
    id: 'grab_bar_shower',
    name: 'Shower Grab Bar Backing',
    description: '2x10 backing for shower grab bars',
    category: 'grab_bar',
    image: '/details/grab_bar_shower.svg',
    dwgFile: '/details/grab_bar_shower.dwg',
    specifications: {
      backingType: '2x10',
      dimensions: { width: 48, height: 10, thickness: 9.25 },
      heightAFF: 38,
      fasteners: '#12 x 3.5" wood screws @ 6" O.C.',
      spacing: 6,
      loadRating: 300,
      notes: [
        'Waterproof membrane behind backing',
        'Use stainless steel fasteners',
        'Coordinate with shower valve location'
      ]
    },
    applicability: {
      componentTypes: ['grab_bar', 'shower_rail', 'safety_bar'],
      weightRange: { min: 5, max: 15 },
      sizeRange: { minWidth: 24, maxWidth: 48, minHeight: 1.5, maxHeight: 2 },
      wallTypes: ['cement_board', 'tile_backer', 'waterproof_membrane']
    },
    references: {
      code: 'ADA 2010 Standards 608.3',
      standard: 'ICC A117.1',
      manufacturer: 'Generic'
    },
    tags: ['grab_bar', 'shower', 'wet_area', 'heavy_duty'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // CABINET DETAILS
  {
    id: 'upper_cabinet_standard',
    name: 'Upper Cabinet Backing',
    description: '2x4 backing for standard upper cabinets',
    category: 'cabinet',
    image: '/details/upper_cabinet.svg',
    dwgFile: '/details/upper_cabinet.dwg',
    specifications: {
      backingType: '2x4',
      dimensions: { width: 30, height: 4, thickness: 3.5 },
      heightAFF: 84,
      fasteners: '2.5" wood screws @ 16" O.C.',
      spacing: 16,
      loadRating: 100,
      notes: [
        'Position backing at cabinet rail location',
        'Coordinate with electrical rough-in',
        'Consider under-cabinet lighting'
      ]
    },
    applicability: {
      componentTypes: ['cabinet', 'upper_cabinet', 'wall_cabinet'],
      weightRange: { min: 25, max: 75 },
      sizeRange: { minWidth: 12, maxWidth: 48, minHeight: 30, maxHeight: 42 },
      wallTypes: ['drywall', 'gypsum_board']
    },
    references: {
      code: 'IRC R502.3',
      standard: 'KCMA Standards',
      manufacturer: 'Generic'
    },
    tags: ['cabinet', 'kitchen', 'upper', 'residential'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  {
    id: 'heavy_cabinet_backing',
    name: 'Heavy Cabinet Backing',
    description: '2x6 backing for heavy wall-mounted cabinets',
    category: 'cabinet',
    image: '/details/heavy_cabinet.svg',
    dwgFile: '/details/heavy_cabinet.dwg',
    specifications: {
      backingType: '2x6',
      dimensions: { width: 36, height: 6, thickness: 5.5 },
      heightAFF: 84,
      fasteners: '3" wood screws @ 12" O.C.',
      spacing: 12,
      loadRating: 200,
      notes: [
        'For cabinets with stone countertops',
        'Use full-width backing for even load distribution',
        'Install additional blocking at corners'
      ]
    },
    applicability: {
      componentTypes: ['cabinet', 'heavy_cabinet', 'stone_cabinet'],
      weightRange: { min: 75, max: 200 },
      sizeRange: { minWidth: 24, maxWidth: 60, minHeight: 30, maxHeight: 42 },
      wallTypes: ['drywall', 'gypsum_board', 'masonry']
    },
    references: {
      code: 'IRC R502.3',
      standard: 'KCMA Standards',
      manufacturer: 'Generic'
    },
    tags: ['cabinet', 'heavy_duty', 'stone', 'commercial'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // EQUIPMENT DETAILS
  {
    id: 'fire_extinguisher_cabinet',
    name: 'Fire Extinguisher Cabinet Backing',
    description: '2x6 backing for recessed fire extinguisher cabinets',
    category: 'equipment',
    image: '/details/fire_extinguisher.svg',
    dwgFile: '/details/fire_extinguisher.dwg',
    specifications: {
      backingType: '2x6',
      dimensions: { width: 20, height: 30, thickness: 5.5 },
      heightAFF: 48,
      fasteners: '3" wood screws @ 8" O.C.',
      spacing: 8,
      loadRating: 150,
      notes: [
        'Recess cabinet 4" into wall',
        'Coordinate with fire department requirements',
        'Maintain visibility per code'
      ]
    },
    applicability: {
      componentTypes: ['fire_extinguisher', 'emergency_equipment', 'safety_cabinet'],
      weightRange: { min: 15, max: 25 },
      sizeRange: { minWidth: 12, maxWidth: 24, minHeight: 27, maxHeight: 36 },
      wallTypes: ['drywall', 'masonry', 'concrete_block']
    },
    references: {
      code: 'NFPA 10',
      standard: 'IFC 906.3',
      manufacturer: 'Larsen'
    },
    tags: ['fire_safety', 'emergency', 'recessed', 'code_required'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  {
    id: 'electrical_panel_backing',
    name: 'Electrical Panel Backing',
    description: '3/4" plywood backing for electrical panels',
    category: 'equipment',
    image: '/details/electrical_panel.svg',
    dwgFile: '/details/electrical_panel.dwg',
    specifications: {
      backingType: '3/4_plywood',
      dimensions: { width: 24, height: 42, thickness: 0.75 },
      heightAFF: 60,
      fasteners: '2.5" wood screws @ 6" O.C.',
      spacing: 6,
      loadRating: 100,
      notes: [
        'Use fire-rated plywood',
        'Coordinate with electrical rough-in',
        'Maintain required clearances per NEC'
      ]
    },
    applicability: {
      componentTypes: ['electrical_panel', 'breaker_panel', 'disconnect'],
      weightRange: { min: 25, max: 75 },
      sizeRange: { minWidth: 14, maxWidth: 30, minHeight: 20, maxHeight: 42 },
      wallTypes: ['drywall', 'gypsum_board', 'masonry']
    },
    references: {
      code: 'NEC 110.26',
      standard: 'UL 67',
      manufacturer: 'Generic'
    },
    tags: ['electrical', 'panel', 'fire_rated', 'commercial'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // FIXTURE DETAILS
  {
    id: 'toilet_paper_holder',
    name: 'Toilet Paper Holder Backing',
    description: '2x4 backing for toilet paper dispensers',
    category: 'fixture',
    image: '/details/tp_holder.svg',
    dwgFile: '/details/tp_holder.dwg',
    specifications: {
      backingType: '2x4',
      dimensions: { width: 12, height: 4, thickness: 3.5 },
      heightAFF: 26,
      fasteners: '2.5" wood screws @ 6" O.C.',
      spacing: 6,
      loadRating: 50,
      notes: [
        'Position per ADA requirements',
        'Coordinate with toilet location',
        'Consider commercial vs residential use'
      ]
    },
    applicability: {
      componentTypes: ['toilet_paper_holder', 'paper_dispenser', 'bathroom_accessory'],
      weightRange: { min: 2, max: 8 },
      sizeRange: { minWidth: 4, maxWidth: 12, minHeight: 4, maxHeight: 8 },
      wallTypes: ['drywall', 'tile_backer', 'cement_board']
    },
    references: {
      code: 'ADA 2010 Standards 604.7',
      standard: 'ICC A117.1',
      manufacturer: 'Generic'
    },
    tags: ['bathroom', 'accessory', 'ada', 'fixture'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  {
    id: 'towel_bar_backing',
    name: 'Towel Bar Backing',
    description: '2x4 backing for towel bars and hooks',
    category: 'fixture',
    image: '/details/towel_bar.svg',
    dwgFile: '/details/towel_bar.dwg',
    specifications: {
      backingType: '2x4',
      dimensions: { width: 30, height: 4, thickness: 3.5 },
      heightAFF: 48,
      fasteners: '2.5" wood screws @ 8" O.C.',
      spacing: 8,
      loadRating: 75,
      notes: [
        'Extend backing 3" beyond towel bar ends',
        'Position at standard height 48" AFF',
        'Consider multiple towel bars'
      ]
    },
    applicability: {
      componentTypes: ['towel_bar', 'towel_hook', 'bathroom_accessory'],
      weightRange: { min: 2, max: 10 },
      sizeRange: { minWidth: 18, maxWidth: 36, minHeight: 1, maxHeight: 4 },
      wallTypes: ['drywall', 'tile_backer', 'cement_board']
    },
    references: {
      code: 'IRC R307.1',
      standard: 'ANSI Z124.3',
      manufacturer: 'Generic'
    },
    tags: ['bathroom', 'towel', 'accessory', 'residential'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // STRUCTURAL DETAILS
  {
    id: 'heavy_equipment_mount',
    name: 'Heavy Equipment Mounting',
    description: 'Steel plate backing for heavy equipment over 200 lbs',
    category: 'structural',
    image: '/details/heavy_equipment.svg',
    dwgFile: '/details/heavy_equipment.dwg',
    specifications: {
      backingType: 'steel_plate',
      dimensions: { width: 24, height: 24, thickness: 0.25 },
      heightAFF: 96,
      fasteners: '1/2" through-bolts @ 6" O.C.',
      spacing: 6,
      loadRating: 500,
      notes: [
        'Requires structural engineering review',
        'Coordinate with structural framing',
        'Use appropriate anchors for wall type'
      ]
    },
    applicability: {
      componentTypes: ['hvac_unit', 'mechanical_equipment', 'heavy_fixture'],
      weightRange: { min: 200, max: 1000 },
      sizeRange: { minWidth: 18, maxWidth: 48, minHeight: 18, maxHeight: 48 },
      wallTypes: ['masonry', 'concrete', 'steel_stud']
    },
    references: {
      code: 'IBC 1613',
      standard: 'AISC 360',
      manufacturer: 'Structural Engineer'
    },
    tags: ['structural', 'heavy_duty', 'engineered', 'commercial'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

/**
 * Filter standard details by category
 */
export function getDetailsByCategory(category: StandardDetail['category']): StandardDetail[] {
  return standardDetails.filter(detail => detail.category === category);
}

/**
 * Search standard details by component type
 */
export function getDetailsForComponent(componentType: string): StandardDetail[] {
  return standardDetails.filter(detail => 
    detail.applicability.componentTypes.includes(componentType)
  );
}

/**
 * Find details by weight and size requirements
 */
export function findApplicableDetails(
  componentType: string, 
  weight: number, 
  width: number, 
  height: number
): StandardDetail[] {
  return standardDetails.filter(detail => {
    const isComponentMatch = detail.applicability.componentTypes.includes(componentType);
    const isWeightMatch = weight >= detail.applicability.weightRange.min && 
                         weight <= detail.applicability.weightRange.max;
    const isSizeMatch = width >= detail.applicability.sizeRange.minWidth &&
                       width <= detail.applicability.sizeRange.maxWidth &&
                       height >= detail.applicability.sizeRange.minHeight &&
                       height <= detail.applicability.sizeRange.maxHeight;
    
    return isComponentMatch && isWeightMatch && isSizeMatch;
  });
}

/**
 * Get all available categories
 */
export function getCategories(): Array<{ id: StandardDetail['category']; name: string; count: number }> {
  const categories = [
    { id: 'tv_mount' as const, name: 'TV Mounts' },
    { id: 'grab_bar' as const, name: 'Grab Bars' },
    { id: 'cabinet' as const, name: 'Cabinets' },
    { id: 'equipment' as const, name: 'Equipment' },
    { id: 'fixture' as const, name: 'Fixtures' },
    { id: 'structural' as const, name: 'Structural' }
  ];

  return categories.map(cat => ({
    ...cat,
    count: getDetailsByCategory(cat.id).length
  }));
}

/**
 * Get detail by ID
 */
export function getDetailById(id: string): StandardDetail | undefined {
  return standardDetails.find(detail => detail.id === id);
}