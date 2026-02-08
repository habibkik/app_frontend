import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SellerMetrics {
  totalProducts: number;
  totalRevenue: number;
  totalUnitsSold: number;
  avgPrice: number;
  priceChanges: number;
  postsPublished: number;
  totalImpressions: number;
  totalEngagement: number;
  topProduct: string;
  recentStrategies: string[];
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

    const metrics: SellerMetrics = await req.json();

    console.log("Generating seller insights for:", {
      products: metrics.totalProducts,
      revenue: metrics.totalRevenue,
      priceChanges: metrics.priceChanges,
    });

    const systemPrompt = `You are MiroRL, an AI business intelligence agent for B2B sellers. Based on the seller's performance data, generate actionable learning insights and recommendations.

SELLER PERFORMANCE DATA:
- Total Products: ${metrics.totalProducts}
- Total Revenue: $${metrics.totalRevenue.toFixed(2)}
- Units Sold: ${metrics.totalUnitsSold}
- Average Product Price: $${metrics.avgPrice.toFixed(2)}
- Price Changes Made: ${metrics.priceChanges}
- Posts Published: ${metrics.postsPublished}
- Total Impressions: ${metrics.totalImpressions}
- Total Engagement (likes+comments+shares): ${metrics.totalEngagement}
- Top Product: ${metrics.topProduct || "N/A"}
- Recent Pricing Strategies Used: ${metrics.recentStrategies.join(", ") || "None"}

Analyze this data and provide strategic insights. Consider:
1. Revenue optimization opportunities
2. Content/marketing effectiveness
3. Pricing strategy learnings
4. Growth recommendations
5. Risk areas to watch`;

    const tools = [
      {
        type: "function",
        function: {
          name: "generate_seller_insights",
          description: "Generate AI-powered business insights for a seller",
          parameters: {
            type: "object",
            properties: {
              overallScore: {
                type: "number",
                description: "Overall business health score 0-100"
              },
              overallLabel: {
                type: "string",
                enum: ["excellent", "good", "fair", "needs_attention"],
                description: "Label for the overall health"
              },
              insights: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    category: {
                      type: "string",
                      enum: ["revenue", "pricing", "marketing", "growth", "risk"],
                    },
                    title: { type: "string", description: "Short insight title" },
                    description: { type: "string", description: "1-2 sentence insight" },
                    impact: { type: "string", enum: ["high", "medium", "low"] },
                    actionable: { type: "boolean" },
                  },
                  required: ["category", "title", "description", "impact", "actionable"],
                  additionalProperties: false,
                },
                description: "4-6 key insights"
              },
              recommendations: {
                type: "array",
                items: { type: "string" },
                description: "3-5 prioritized action items"
              },
              pricingLearning: {
                type: "string",
                description: "Key learning from pricing strategies (1-2 sentences)"
              },
              contentLearning: {
                type: "string",
                description: "Key learning from content/social performance (1-2 sentences)"
              },
              weeklyFocus: {
                type: "string",
                description: "One sentence describing what to focus on this week"
              },
            },
            required: ["overallScore", "overallLabel", "insights", "recommendations", "pricingLearning", "contentLearning", "weeklyFocus"],
            additionalProperties: false,
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
          { role: "user", content: "Analyze my seller performance data and generate insights." },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "generate_seller_insights" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
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

    if (!toolCall || toolCall.function.name !== "generate_seller_insights") {
      console.error("Unexpected response format:", JSON.stringify(data));
      throw new Error("Unexpected AI response format");
    }

    const insights = JSON.parse(toolCall.function.arguments);
    console.log("Seller insights generated:", insights.overallLabel, insights.overallScore);

    return new Response(
      JSON.stringify(insights),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Seller insights error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate insights" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
