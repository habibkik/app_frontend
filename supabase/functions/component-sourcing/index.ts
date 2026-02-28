import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { componentName, category, material, specifications, quantity, includeLeadTimes } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `You are a component sourcing expert for manufacturing. Find realistic supplier options for:

Component: ${componentName}
Category: ${category || "General"}
Material: ${material || "Not specified"}
Specifications: ${specifications || "Standard"}
Required Quantity: ${quantity || 1000}

${includeLeadTimes ? "Include detailed lead time predictions with confidence intervals." : ""}

Provide 4-6 realistic supplier recommendations with competitive pricing. Use realistic company names from known manufacturing regions (China, Taiwan, Germany, USA, Japan, India). Prices should be realistic for the component type.`;

    const supplierSchema = {
      type: "object",
      properties: {
        supplierId: { type: "string" },
        name: { type: "string" },
        location: { type: "string" },
        unitPrice: { type: "number" },
        moq: { type: "number" },
        leadTime: { type: "string", description: "e.g. '2-3 weeks'" },
        leadTimeDays: { type: "number" },
        rating: { type: "number", description: "1-5 scale" },
        certifications: { type: "array", items: { type: "string" } },
        inStock: { type: "boolean" },
        stockQuantity: { type: "number" },
        industry: { type: "string" },
        specializations: { type: "array", items: { type: "string" } },
        description: { type: "string" },
        yearEstablished: { type: "number" },
        verified: { type: "boolean" },
      },
      required: ["supplierId", "name", "location", "unitPrice", "moq", "leadTime", "leadTimeDays", "rating", "certifications", "inStock"],
    };

    const toolParams: any = {
      type: "object",
      properties: {
        suppliers: { type: "array", items: supplierSchema },
        marketInsight: { type: "string", description: "Brief market insight about this component" },
      },
      required: ["suppliers", "marketInsight"],
    };

    if (includeLeadTimes) {
      toolParams.properties.leadTimePredictions = {
        type: "array",
        items: {
          type: "object",
          properties: {
            supplierName: { type: "string" },
            bestCase: { type: "number", description: "Best case days" },
            expected: { type: "number", description: "Expected days" },
            worstCase: { type: "number", description: "Worst case days" },
            confidence: { type: "number", description: "0-100 confidence" },
            factors: { type: "array", items: { type: "string" } },
          },
          required: ["supplierName", "bestCase", "expected", "worstCase", "confidence"],
        },
      };
      toolParams.required.push("leadTimePredictions");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a component sourcing expert. Always use the provided tool." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "sourcing_results",
            description: "Return supplier recommendations for a component",
            parameters: toolParams,
          },
        }],
        tool_choice: { type: "function", function: { name: "sourcing_results" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Usage limit reached." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway returned ${status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Component sourcing error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
