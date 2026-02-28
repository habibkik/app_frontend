import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { components, productName, productionVolume, region } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const totalMaterialCost = components.reduce((s: number, c: any) => s + (c.totalCost || c.unitCost * c.quantity), 0);
    const componentSummary = components.slice(0, 15).map((c: any) => `${c.name} (${c.material || c.category}): ${c.quantity} ${c.unit || "pcs"} @ $${c.unitCost}`).join("\n");

    const prompt = `You are a manufacturing cost estimator. Analyze the following BOM and provide realistic cost multipliers.

Product: ${productName || "Unknown"}
Production Volume: ${productionVolume || 1000} units
Region: ${region || "Global"}
Total Material Cost: $${totalMaterialCost.toFixed(2)}

Components:
${componentSummary}

Based on the materials, complexity, and production volume, estimate realistic percentage multipliers for:
- laborPercent: Labor cost as % of material cost (typically 20-50% depending on complexity)
- overheadPercent: Factory overhead as % of material cost (typically 10-25%)
- shippingPercent: Logistics/shipping as % of material cost (typically 5-15%)
- toolingPercent: Tooling/setup amortized as % of material cost (typically 3-12%)
- potentialSavingsPercent: Achievable savings through alternative sourcing (typically 10-25%)

Also provide a brief justification for each estimate.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a manufacturing cost estimation expert. Always use the provided tool." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "cost_estimate",
            description: "Return cost estimation multipliers",
            parameters: {
              type: "object",
              properties: {
                laborPercent: { type: "number", description: "Labor as % of material cost" },
                overheadPercent: { type: "number", description: "Overhead as % of material cost" },
                shippingPercent: { type: "number", description: "Shipping as % of material cost" },
                toolingPercent: { type: "number", description: "Tooling as % of material cost" },
                potentialSavingsPercent: { type: "number", description: "Potential savings %" },
                laborJustification: { type: "string" },
                overheadJustification: { type: "string" },
                shippingJustification: { type: "string" },
                toolingJustification: { type: "string" },
                savingsJustification: { type: "string" },
              },
              required: ["laborPercent", "overheadPercent", "shippingPercent", "toolingPercent", "potentialSavingsPercent"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "cost_estimate" } },
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

    const estimate = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ success: true, estimate }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Cost estimate error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
