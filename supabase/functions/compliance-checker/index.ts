import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text, documentType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert procurement compliance and risk analyst. Analyze procurement documents for compliance gaps, legal risks, missing certifications, and regulatory issues.

Always respond by calling the compliance_analysis function with your findings.

Be thorough but practical. Focus on actionable findings that procurement teams need to address.`;

    const userPrompt = `Analyze this ${documentType || "procurement"} document for compliance and risk issues:

"""
${text}
"""

Check for:
1. Missing or incomplete legal clauses
2. Missing certifications or quality standards
3. Regulatory compliance gaps
4. Financial/payment risk factors
5. Delivery and warranty risks
6. Data protection / IP concerns
7. Force majeure and termination provisions`;

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
              name: "compliance_analysis",
              description: "Return structured compliance and risk analysis results",
              parameters: {
                type: "object",
                properties: {
                  overallRiskScore: { type: "number", description: "Risk score 0-100 (0=no risk, 100=critical)" },
                  overallRiskLevel: { type: "string", enum: ["low", "medium", "high", "critical"] },
                  summary: { type: "string", description: "Executive summary of findings" },
                  findings: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: { type: "string", enum: ["legal", "certifications", "regulatory", "financial", "delivery", "data_privacy", "general"] },
                        severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
                        title: { type: "string" },
                        description: { type: "string" },
                        suggestedFix: { type: "string" },
                        clause: { type: "string", description: "Relevant text excerpt if applicable" },
                      },
                      required: ["category", "severity", "title", "description", "suggestedFix"],
                    },
                  },
                  missingElements: { type: "array", items: { type: "string" }, description: "Key elements missing from the document" },
                  recommendations: { type: "array", items: { type: "string" }, description: "Top recommendations" },
                },
                required: ["overallRiskScore", "overallRiskLevel", "summary", "findings", "recommendations"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "compliance_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) throw new Error("AI did not return structured output");

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ success: true, data: analysis }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("compliance-checker error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
