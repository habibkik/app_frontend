import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { productName, productCategory, componentsSummary, feasibilityScore, targetMarkets } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `You are a Go-To-Market strategy expert for manufactured products. Generate a comprehensive GTM plan for the following product:

Product: ${productName}
Category: ${productCategory || "General"}
Components: ${componentsSummary || "N/A"}
Feasibility Score: ${feasibilityScore || "N/A"}/100
Target Markets: ${targetMarkets?.join(", ") || "Global"}

Return a JSON object using the tool provided with these fields:
- phases: Array of 4 GTM phases (research, strategy, preparation, launch), each with: id, name, status ("completed"/"in-progress"/"pending"), progress (0-100), tasks (array of {name, completed})
- targetMarkets: Array of {name, penetration (0-100), revenue (string like "$2.4M"), status ("active"/"expanding"/"planned")}
- channelStrategy: Array of {name, allocation (% that sums to 100), leads (number), conversion (% number)}
- milestones: Array of {date (like "Mar 1"), title, status ("completed"/"current"/"upcoming")}
- projectedRevenue: string like "$4.1M"
- daysToLaunch: number
- overallProgress: number 0-100

Make the data realistic and specific to this product. Set the first phase as completed, second as in-progress, rest pending.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a GTM strategy expert. Always use the provided tool to return structured data." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "gtm_strategy",
            description: "Return a complete GTM strategy plan",
            parameters: {
              type: "object",
              properties: {
                phases: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      name: { type: "string" },
                      status: { type: "string", enum: ["completed", "in-progress", "pending"] },
                      progress: { type: "number" },
                      tasks: { type: "array", items: { type: "object", properties: { name: { type: "string" }, completed: { type: "boolean" } }, required: ["name", "completed"] } },
                    },
                    required: ["id", "name", "status", "progress", "tasks"],
                  },
                },
                targetMarkets: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: { name: { type: "string" }, penetration: { type: "number" }, revenue: { type: "string" }, status: { type: "string" } },
                    required: ["name", "penetration", "revenue", "status"],
                  },
                },
                channelStrategy: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: { name: { type: "string" }, allocation: { type: "number" }, leads: { type: "number" }, conversion: { type: "number" } },
                    required: ["name", "allocation", "leads", "conversion"],
                  },
                },
                milestones: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: { date: { type: "string" }, title: { type: "string" }, status: { type: "string", enum: ["completed", "current", "upcoming"] } },
                    required: ["date", "title", "status"],
                  },
                },
                projectedRevenue: { type: "string" },
                daysToLaunch: { type: "number" },
                overallProgress: { type: "number" },
              },
              required: ["phases", "targetMarkets", "channelStrategy", "milestones", "projectedRevenue", "daysToLaunch", "overallProgress"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "gtm_strategy" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      throw new Error(`AI gateway returned ${status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const plan = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ success: true, plan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("GTM strategy error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
