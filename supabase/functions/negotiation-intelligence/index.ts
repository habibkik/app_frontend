import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { supplierQuotes, productName, targetPrice, marketBenchmark, evaluationCriteria } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a senior procurement negotiation advisor with 20+ years of experience in automotive OEM purchasing and strategic sourcing. You provide data-driven negotiation intelligence.

Your responses must be structured JSON using the provided tool schema. Be specific, actionable, and reference the actual quote data provided.

Key principles:
- Always analyze total cost of ownership, not just unit price
- Identify negotiation levers specific to the supplier's position
- Provide ready-to-use scripts that are professional and collaborative
- Consider supplier relationship preservation
- Flag risks and counter-arguments the supplier might use`;

    const userPrompt = `Analyze these supplier quotes and generate negotiation intelligence:

Product: ${productName || "Not specified"}
Target Price: ${targetPrice ? `$${targetPrice}` : "Not specified"}
Market Benchmark: ${marketBenchmark ? `$${marketBenchmark}` : "Not specified"}

Supplier Quotes:
${JSON.stringify(supplierQuotes, null, 2)}

${evaluationCriteria ? `Evaluation Criteria: ${JSON.stringify(evaluationCriteria)}` : ""}

Generate:
1. A negotiation strategy summary
2. 3-5 specific negotiation tactics with priority ranking
3. 2-3 ready-to-use negotiation scripts for different scenarios
4. Key cost drivers to challenge
5. Risk assessment for each supplier`;

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
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "negotiation_intelligence",
              description: "Return structured negotiation intelligence",
              parameters: {
                type: "object",
                properties: {
                  strategySummary: {
                    type: "string",
                    description: "2-3 sentence high-level negotiation strategy recommendation",
                  },
                  overallLeverage: {
                    type: "string",
                    enum: ["strong", "moderate", "weak"],
                    description: "Overall buyer leverage position",
                  },
                  potentialSavings: {
                    type: "string",
                    description: "Estimated savings range e.g. '8-15%'",
                  },
                  tactics: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        priority: { type: "string", enum: ["high", "medium", "low"] },
                        lever: { type: "string", description: "The negotiation lever category" },
                        expectedImpact: { type: "string" },
                      },
                      required: ["title", "description", "priority", "lever", "expectedImpact"],
                      additionalProperties: false,
                    },
                  },
                  scripts: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        scenario: { type: "string" },
                        script: { type: "string" },
                        tone: { type: "string", enum: ["collaborative", "firm", "exploratory"] },
                        useWhen: { type: "string" },
                      },
                      required: ["scenario", "script", "tone", "useWhen"],
                      additionalProperties: false,
                    },
                  },
                  costDrivers: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        driver: { type: "string" },
                        challenge: { type: "string" },
                        question: { type: "string" },
                      },
                      required: ["driver", "challenge", "question"],
                      additionalProperties: false,
                    },
                  },
                  supplierRisks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        supplierName: { type: "string" },
                        riskLevel: { type: "string", enum: ["low", "medium", "high"] },
                        strengths: { type: "array", items: { type: "string" } },
                        weaknesses: { type: "array", items: { type: "string" } },
                        recommendation: { type: "string" },
                      },
                      required: ["supplierName", "riskLevel", "strengths", "weaknesses", "recommendation"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["strategySummary", "overallLeverage", "potentialSavings", "tactics", "scripts", "costDrivers", "supplierRisks"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "negotiation_intelligence" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No structured response from AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("negotiation-intelligence error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
