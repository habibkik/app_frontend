import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function generateFallbackPlan(productName: string, productCategory: string, targetMarkets: string[]) {
  const markets = (targetMarkets || ["North America", "Europe"]).map((name, i) => ({
    name,
    penetration: i === 0 ? 45 : i === 1 ? 28 : i === 2 ? 12 : 0,
    revenue: i === 0 ? "$2.4M" : i === 1 ? "$1.2M" : i === 2 ? "$450K" : "$0",
    status: i < 2 ? "active" : i === 2 ? "expanding" : "planned",
  }));

  return {
    phases: [
      { id: "research", name: "Market Research", status: "completed", progress: 100, tasks: [
        { name: `Identify target segments for ${productCategory}`, completed: true },
        { name: "Analyze competitor positioning", completed: true },
        { name: "Survey potential customers", completed: true },
        { name: "Define buyer personas", completed: true },
      ]},
      { id: "strategy", name: "Strategy Development", status: "in-progress", progress: 65, tasks: [
        { name: `Define value proposition for ${productName}`, completed: true },
        { name: "Set pricing strategy", completed: true },
        { name: "Choose distribution channels", completed: false },
        { name: "Create messaging framework", completed: false },
      ]},
      { id: "preparation", name: "Launch Preparation", status: "pending", progress: 0, tasks: [
        { name: "Develop marketing materials", completed: false },
        { name: "Set up sales enablement", completed: false },
        { name: "Configure analytics tracking", completed: false },
        { name: "Train sales team", completed: false },
      ]},
      { id: "launch", name: "Market Launch", status: "pending", progress: 0, tasks: [
        { name: "Execute launch campaign", completed: false },
        { name: "Activate PR strategy", completed: false },
        { name: "Monitor initial metrics", completed: false },
        { name: "Gather early feedback", completed: false },
      ]},
    ],
    targetMarkets: markets,
    channelStrategy: [
      { name: "Direct Sales", allocation: 40, leads: 234, conversion: 12 },
      { name: "Partner Network", allocation: 25, leads: 156, conversion: 8 },
      { name: "Digital Marketing", allocation: 20, leads: 892, conversion: 3 },
      { name: "Trade Shows", allocation: 15, leads: 67, conversion: 18 },
    ],
    milestones: [
      { date: "Week 1", title: "Market Research Complete", status: "completed" },
      { date: "Week 3", title: "Pricing Strategy Finalized", status: "completed" },
      { date: "Week 5", title: "Channel Partners Signed", status: "current" },
      { date: "Week 7", title: "Marketing Launch", status: "upcoming" },
      { date: "Week 9", title: "First 100 Customers", status: "upcoming" },
      { date: "Week 12", title: "International Expansion", status: "upcoming" },
    ],
    projectedRevenue: "$4.1M",
    daysToLaunch: 28,
    overallProgress: 41,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { productName, productCategory, componentsSummary, feasibilityScore, targetMarkets } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    let plan;

    if (LOVABLE_API_KEY) {
      try {
        const prompt = `You are a Go-To-Market strategy expert. Generate a GTM plan for:
Product: ${productName}, Category: ${productCategory || "General"}, Components: ${componentsSummary || "N/A"}, Feasibility: ${feasibilityScore || "N/A"}/100, Markets: ${(targetMarkets || ["Global"]).join(", ")}

Return ONLY valid JSON (no markdown) with: phases (4 items: research/strategy/preparation/launch with id, name, status, progress 0-100, tasks array), targetMarkets (name, penetration, revenue string, status), channelStrategy (name, allocation %, leads, conversion %), milestones (date, title, status), projectedRevenue string, daysToLaunch number, overallProgress number. First phase completed, second in-progress, rest pending.`;

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [
              { role: "system", content: "Return only valid JSON, no markdown fences." },
              { role: "user", content: prompt },
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
            plan = JSON.parse(cleaned);
          }
        } else {
          const status = response.status;
          if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
          if (status === 402) return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
          console.error("AI gateway error:", status, await response.text());
        }
      } catch (aiErr) {
        console.error("AI call failed, using fallback:", aiErr);
      }
    }

    // Fallback if AI failed
    if (!plan) {
      plan = generateFallbackPlan(productName || "Product", productCategory || "General", targetMarkets || []);
    }

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
