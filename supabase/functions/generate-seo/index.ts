import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { siteName, tagline, blocks } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build a content summary from blocks for context
    const blockSummaries = (blocks || [])
      .filter((b: any) => b.enabled)
      .map((b: any) => {
        const c = b.config || {};
        switch (b.type) {
          case "hero": return `Hero: ${c.title || ""} - ${c.subtitle || ""}`;
          case "about": return `About: ${(c.content || "").slice(0, 200)}`;
          case "product-catalog": return "Product catalog section";
          case "testimonials": return `Testimonials: ${(c.items || []).map((i: any) => i.quote).join("; ").slice(0, 150)}`;
          case "faq": return `FAQ: ${(c.items || []).map((i: any) => i.question).join(", ").slice(0, 150)}`;
          case "features-grid": return `Features: ${(c.items || []).map((i: any) => i.title).join(", ")}`;
          case "pricing-table": return `Pricing plans: ${(c.plans || []).map((p: any) => `${p.name} ${p.price}`).join(", ")}`;
          case "problem-agitation": return `Problem: ${c.heading || ""} - ${(c.painPoints || []).map((p: any) => p.title).join(", ")}`;
          case "solution": return `Solution: ${c.heading || ""} - ${(c.differentiationPoints || []).join(", ")}`;
          case "offer-pricing": return `Offer: ${c.heading || ""} price ${c.actualPrice || ""}`;
          default: return `${b.type}: ${c.heading || c.title || ""}`;
        }
      })
      .filter(Boolean)
      .join("\n");

    const prompt = `You are an SEO expert. Based on the following website content, generate optimized SEO metadata.

Site Name: ${siteName || "My Store"}
Tagline: ${tagline || ""}

Page Content:
${blockSummaries || "General e-commerce / business landing page"}

Generate a JSON response with:
- metaTitle: SEO-optimized page title (max 60 chars, include primary keyword)
- metaDescription: Compelling meta description (max 160 chars, include CTA)
- metaKeywords: Comma-separated relevant keywords (8-12 keywords)

Return ONLY valid JSON, no markdown.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an SEO specialist. Return only valid JSON." },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "set_seo_metadata",
              description: "Set SEO metadata for the website",
              parameters: {
                type: "object",
                properties: {
                  metaTitle: { type: "string", description: "SEO page title, max 60 chars" },
                  metaDescription: { type: "string", description: "Meta description, max 160 chars" },
                  metaKeywords: { type: "string", description: "Comma-separated keywords" },
                },
                required: ["metaTitle", "metaDescription", "metaKeywords"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "set_seo_metadata" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings → Workspace → Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI generation failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const seo = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(seo), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: parse from content
    const content = data.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const seo = JSON.parse(jsonMatch[0]);
      return new Response(JSON.stringify(seo), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Could not parse AI response");
  } catch (e) {
    console.error("generate-seo error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
