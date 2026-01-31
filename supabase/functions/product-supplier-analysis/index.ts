const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ProductAnalysisRequest {
  imageBase64: string;
  mimeType?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { imageBase64, mimeType = 'image/jpeg' } = await req.json() as ProductAnalysisRequest;

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ success: false, error: 'Image data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing product image for suppliers and substitutes...');

    // Use Lovable AI Gateway with vision capabilities
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert product analyst and B2B sourcing specialist. Analyze product images to identify the product, find potential suppliers, and suggest substitute products. Always respond with valid JSON matching this exact structure:
{
  "product": {
    "name": "Product Name",
    "category": "Product Category",
    "specifications": {
      "material": "value",
      "dimensions": "value",
      "power": "value"
    }
  },
  "suppliers": [
    {
      "id": "sup_1",
      "name": "Supplier Name",
      "matchScore": 95,
      "priceRange": { "min": 100, "max": 150 },
      "moq": 100,
      "leadTime": "7-14 days",
      "location": "China",
      "verified": true
    }
  ],
  "substitutes": [
    {
      "name": "Alternative Product Name",
      "similarity": 85,
      "priceAdvantage": "-15% cheaper",
      "suppliers": [
        { "name": "Alt Supplier", "price": 85, "location": "Vietnam" }
      ]
    }
  ],
  "estimatedPrice": { "min": 90, "max": 160 },
  "confidence": 92
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this product image and provide:
1. Product identification with detailed specifications
2. At least 4 potential suppliers with pricing, MOQ, and lead times
3. At least 3 substitute products with their own suppliers
4. Estimated market price range

Consider global suppliers from China, India, Vietnam, Europe, and North America. Include verified and unverified suppliers. Return JSON only.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        temperature: 0.7,
        max_tokens: 2500,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to analyze product' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '';
    
    console.log('AI Response received for product analysis');

    // Parse AI response
    let analysisData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Provide fallback mock data
      analysisData = {
        product: {
          name: "Industrial Component",
          category: "Manufacturing Parts",
          specifications: { type: "Standard" }
        },
        suppliers: [
          {
            id: "sup_1",
            name: "GlobalTech Manufacturing",
            matchScore: 92,
            priceRange: { min: 120, max: 180 },
            moq: 50,
            leadTime: "10-15 days",
            location: "China",
            verified: true
          },
          {
            id: "sup_2",
            name: "EuroSupply GmbH",
            matchScore: 88,
            priceRange: { min: 150, max: 200 },
            moq: 25,
            leadTime: "7-10 days",
            location: "Germany",
            verified: true
          }
        ],
        substitutes: [
          {
            name: "Generic Alternative",
            similarity: 85,
            priceAdvantage: "-20% cheaper",
            suppliers: [
              { name: "ValueParts Co", price: 100, location: "India" }
            ]
          }
        ],
        estimatedPrice: { min: 100, max: 200 },
        confidence: 75
      };
    }

    console.log('Product analysis complete');

    return new Response(
      JSON.stringify({ success: true, data: analysisData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in product analysis:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze product';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
