import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, fileName, pageNumber } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are an expert construction specification parser specialized in extracting backing and mounting requirements from building specifications.

Your task is to analyze the provided specification text and extract any requirements related to backing, blocking, reinforcement, or mounting supports for various building components.

For each requirement found, extract:
1. Component type (tv, grab_bar, sink, cabinet, fire_extinguisher, equipment, other)
2. Backing/blocking material (2x4, 2x6, 2x8, 2x10, 3/4_plywood, 1/2_plywood, steel_plate, blocking)
3. Height above finished floor (AFF) in inches
4. Weight capacity if mentioned (in lbs)
5. Dimensions if specified (width x height in inches)
6. Additional notes or special requirements

Return ONLY a JSON array of requirements in this exact format:
[
  {
    "text": "exact text from specification",
    "componentType": "tv|grab_bar|sink|cabinet|fire_extinguisher|equipment|other",
    "backingType": "2x4|2x6|2x8|2x10|3/4_plywood|1/2_plywood|steel_plate|blocking",
    "heightAFF": number_in_inches,
    "weight": number_in_lbs_if_mentioned,
    "dimensions": {"width": number, "height": number} or null,
    "notes": "additional requirements or context",
    "confidence": 0.0_to_1.0_confidence_score
  }
]

If no backing requirements are found, return an empty array [].

Focus on terms like: backing, blocking, reinforcement, support, mount, bracket, nailer, substrate, framing, attachment, fastener, AFF, above finished floor.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Parse this specification text for backing requirements:\n\n${text}` }
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    let parsedRequirements = [];
    try {
      parsedRequirements = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('Invalid AI response format');
    }

    // Transform AI response to match our interface
    const requirements: ExtractedRequirement[] = parsedRequirements.map((req: any, index: number) => ({
      id: `ai-req-${Date.now()}-${index}`,
      specSection: determineSpecSection(req.text, fileName),
      pageNumber: pageNumber || 1,
      text: req.text,
      parsedData: {
        componentType: req.componentType,
        backingType: req.backingType,
        dimensions: req.dimensions,
        heightAFF: req.heightAFF,
        weight: req.weight,
        notes: req.notes
      },
      confidence: req.confidence || 0.8,
      applied: false
    }));

    return new Response(JSON.stringify({ requirements }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in parse-specification function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      requirements: [] 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function determineSpecSection(text: string, fileName?: string): string {
  // Common CSI specification sections
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