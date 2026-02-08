import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ValidatePricingRequest {
  productName: string;
  currentPrice: number;
  proposedPrice: number;
  cost: number;
  competitorAverage: number;
  strategy: string;
  dailySales?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const {
      productName,
      currentPrice,
      proposedPrice,
      cost,
      competitorAverage,
      strategy,
      dailySales = 0,
    }: ValidatePricingRequest = await req.json();

    if (!productName || !proposedPrice || !cost) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: productName, proposedPrice, cost" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const margin = ((proposedPrice - cost) / proposedPrice) * 100;
    const vsCompetitor = ((proposedPrice - competitorAverage) / competitorAverage) * 100;
    const priceChange = ((proposedPrice - currentPrice) / currentPrice) * 100;

    console.log(`Validating pricing for ${productName}: $${currentPrice} → $${proposedPrice} (${strategy})`);

    const systemPrompt = `You are MiroThinker, an AI pricing strategist for industrial B2B products. Analyze the proposed price change and provide a validation assessment.

PRODUCT: ${productName}
CURRENT PRICE: $${currentPrice}
PROPOSED PRICE: $${proposedPrice} (${priceChange > 0 ? "+" : ""}${priceChange.toFixed(1)}% change)
COST (COGS): $${cost}
PROPOSED MARGIN: ${margin.toFixed(1)}%
COMPETITOR AVERAGE: $${competitorAverage}
VS COMPETITOR: ${vsCompetitor > 0 ? "+" : ""}${vsCompetitor.toFixed(1)}% ${vsCompetitor > 0 ? "above" : "below"} market
STRATEGY: ${strategy}
DAILY SALES VOLUME: ${dailySales} units

Evaluate this pricing decision considering:
1. Is the margin healthy for this type of industrial product? (typically 25-45% is good)
2. How does the proposed price compare to competitors?
3. Will this strategy achieve its goals (premium/competitive/aggressive)?
4. What are the risks?
5. Is this profitable long-term?`;

    const tools = [
      {
        type: "function",
        function: {
          name: "validate_pricing",
          description: "Validate a pricing strategy and return assessment",
          parameters: {
            type: "object",
            properties: {
              isValid: {
                type: "boolean",
                description: "Whether the pricing strategy is sound and profitable"
              },
              confidence: {
                type: "number",
                description: "Confidence score 0-100 in the validation"
              },
              riskLevel: {
                type: "string",
                enum: ["low", "medium", "high"],
                description: "Overall risk level of this price change"
              },
              summary: {
                type: "string",
                description: "One-sentence summary of the validation result"
              },
              reasoning: {
                type: "string",
                description: "Detailed reasoning for the validation (2-3 sentences)"
              },
              marginAssessment: {
                type: "string",
                enum: ["healthy", "acceptable", "thin", "negative"],
                description: "Assessment of the profit margin"
              },
              competitivePosition: {
                type: "string",
                enum: ["premium", "competitive", "underpriced", "significantly_underpriced"],
                description: "Market position relative to competitors"
              },
              suggestions: {
                type: "array",
                items: { type: "string" },
                description: "1-3 actionable suggestions to improve the pricing strategy"
              },
              estimatedRevenueImpact: {
                type: "string",
                description: "Estimated impact on daily revenue (e.g. '+12%' or '-5%')"
              }
            },
            required: ["isValid", "confidence", "riskLevel", "summary", "reasoning", "marginAssessment", "competitivePosition", "suggestions", "estimatedRevenueImpact"],
            additionalProperties: false
          }
        }
      }
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Validate this pricing decision: Change ${productName} from $${currentPrice} to $${proposedPrice} using the "${strategy}" strategy.` }
        ],
        tools,
        tool_choice: { type: "function", function: { name: "validate_pricing" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall || toolCall.function.name !== "validate_pricing") {
      console.error("Unexpected response format:", JSON.stringify(data));
      throw new Error("Unexpected response format from AI");
    }

    const validation = JSON.parse(toolCall.function.arguments);
    console.log("Pricing validation completed:", validation.isValid ? "VALID" : "RISKY");

    return new Response(
      JSON.stringify(validation),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Pricing validation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to validate pricing" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
