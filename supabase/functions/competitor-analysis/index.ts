const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface CompetitorAnalysisRequest {
  websiteUrl: string;
  competitorName?: string;
}

interface CompetitorAnalysisResult {
  success: boolean;
  data?: {
    name: string;
    website: string;
    summary: string;
    products: string[];
    pricing: {
      strategy: string;
      range: string;
      competitiveness: string;
    };
    strengths: string[];
    weaknesses: string[];
    marketPosition: string;
    recommendations: string[];
  };
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { websiteUrl, competitorName } = await req.json() as CompetitorAnalysisRequest;

    if (!websiteUrl) {
      return new Response(
        JSON.stringify({ success: false, error: 'Website URL is required' }),
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

    // Format URL
    let formattedUrl = websiteUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    // Extract domain for naming
    const domain = new URL(formattedUrl).hostname.replace('www.', '');
    const displayName = competitorName || domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);

    console.log('Analyzing competitor:', formattedUrl);

    // Use Lovable AI Gateway for analysis
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
            content: `You are a competitive intelligence analyst. Analyze businesses based on their website URL and provide strategic insights. Always respond with valid JSON matching this exact structure:
{
  "name": "Company Name",
  "summary": "2-3 sentence company overview",
  "products": ["product1", "product2", "product3"],
  "pricing": {
    "strategy": "premium/mid-market/budget",
    "range": "$X - $Y",
    "competitiveness": "above/at/below market average"
  },
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "marketPosition": "market leader/challenger/niche player/new entrant",
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
}`
          },
          {
            role: 'user',
            content: `Analyze this competitor website and provide strategic intelligence: ${formattedUrl}
            
Based on the domain name and typical business patterns, provide realistic competitive analysis including:
- Company overview and main business focus
- Key products or services they likely offer
- Pricing strategy assessment
- Competitive strengths and weaknesses
- Market positioning
- Recommendations for competing against them

Return the analysis as JSON only, no additional text.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to analyze competitor' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '';
    
    console.log('AI Response received');

    // Parse AI response
    let analysisData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Provide fallback analysis based on domain
      analysisData = {
        name: displayName,
        summary: `${displayName} is a business operating at ${domain}. Further analysis requires more detailed information about their operations.`,
        products: ['Products/Services pending detailed analysis'],
        pricing: {
          strategy: 'Unknown',
          range: 'Analysis required',
          competitiveness: 'Pending assessment'
        },
        strengths: ['Established web presence'],
        weaknesses: ['Limited public information available'],
        marketPosition: 'Requires further research',
        recommendations: ['Monitor their website for updates', 'Research their customer reviews', 'Analyze their social media presence']
      };
    }

    const result: CompetitorAnalysisResult = {
      success: true,
      data: {
        name: analysisData.name || displayName,
        website: domain,
        summary: analysisData.summary,
        products: analysisData.products || [],
        pricing: analysisData.pricing || { strategy: 'Unknown', range: 'N/A', competitiveness: 'Unknown' },
        strengths: analysisData.strengths || [],
        weaknesses: analysisData.weaknesses || [],
        marketPosition: analysisData.marketPosition || 'Unknown',
        recommendations: analysisData.recommendations || [],
      }
    };

    console.log('Analysis complete for:', displayName);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in competitor analysis:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze competitor';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
