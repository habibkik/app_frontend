import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { platforms, keywords, userProducts } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const platformList = (platforms || []).join(", ") || "Facebook, TikTok, Instagram, Google, YouTube, Pinterest, Twitter";
    const keywordHint = keywords?.length ? `Focus on these keywords: ${keywords.join(", ")}.` : "";
    const productHint = userProducts?.length ? `The seller's current products include: ${userProducts.join(", ")}.` : "";

    const systemPrompt = `You are a demand intelligence analyst. You analyze social media and search platforms to identify demand signals for e-commerce sellers. Return ONLY valid JSON, no markdown.`;

    const userPrompt = `Scan ${platformList} for demand signals. ${keywordHint} ${productHint}

Return a JSON object with this exact structure:
{
  "signals": [
    {
      "id": "unique-id",
      "platform": "facebook"|"tiktok"|"instagram"|"google"|"youtube"|"pinterest"|"twitter",
      "signalType": "trending_product"|"rising_niche"|"geographic_hotspot",
      "name": "Product or niche name",
      "category": "Category",
      "trendScore": 0-100,
      "volume": "high"|"medium"|"low",
      "growth": "surging"|"rising"|"stable"|"declining",
      "region": "Region name",
      "confidence": 0-100,
      "detectedAt": "ISO timestamp",
      "keywords": ["keyword1", "keyword2"],
      "engagementMetrics": { "mentions": number, "hashtags": number, "searchVolume": number }
    }
  ],
  "summary": "2-3 sentence summary of findings",
  "timeline": [
    { "date": "Mon DD", "facebook": 0-100, "tiktok": 0-100, "instagram": 0-100, "google": 0-100, "youtube": 0-100, "pinterest": 0-100, "twitter": 0-100 }
  ]
}

Generate 15-25 realistic signals across all selected platforms with a mix of trending_product (40%), rising_niche (30%), geographic_hotspot (30%). Include 7 timeline entries for the past week. Use today's date: ${new Date().toISOString().split("T")[0]}.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", status, text);
      throw new Error(`AI gateway returned ${status}`);
    }

    const aiData = await response.json();
    const raw = aiData.choices?.[0]?.message?.content || "{}";
    // Strip markdown fences if present
    const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
    const parsed = JSON.parse(cleaned);

    return new Response(JSON.stringify({ ...parsed, scannedAt: new Date().toISOString() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("demand-signal-scan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
