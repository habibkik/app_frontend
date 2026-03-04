import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, payload } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "optimize-title":
        systemPrompt = "You are a marketplace listing optimization expert. Rewrite the given product title to be optimized for the specified platform. Return ONLY the optimized title, nothing else.";
        userPrompt = `Platform: ${payload.platform}\nOriginal title: ${payload.title}\nCategory: ${payload.category || "General"}`;
        break;

      case "rewrite-description":
        systemPrompt = `You are a product copywriter. Rewrite the product description in a ${payload.tone || "Professional"} tone. Make it compelling and SEO-friendly. Return ONLY the rewritten description.`;
        userPrompt = `Product: ${payload.title}\nOriginal description: ${payload.description}\nCategory: ${payload.category || "General"}`;
        break;

      case "suggest-tags":
        systemPrompt = "You are an SEO and social media expert. Generate relevant tags/hashtags for the product. Return a JSON array of strings with 10-15 tags.";
        userPrompt = `Product: ${payload.title}\nCategory: ${payload.category || "General"}\nPlatform: ${payload.platform || "general"}\nDescription: ${payload.description || ""}`;
        break;

      case "suggest-price":
        systemPrompt = "You are a pricing strategy expert. Based on the product details, suggest an optimal price range and strategy. Return a JSON object with fields: suggestedPrice (number), lowRange (number), highRange (number), strategy (string: competitive/premium/penetration), reasoning (string).";
        userPrompt = `Product: ${payload.title}\nCategory: ${payload.category || "General"}\nCondition: ${payload.condition || "new"}\nCurrent price: ${payload.price || "not set"}\nCurrency: ${payload.currency || "USD"}`;
        break;

      case "translate":
        systemPrompt = `You are a professional translator specializing in e-commerce. Translate the product listing to ${payload.targetLanguage}. Adapt culturally where appropriate. Return a JSON object with fields: title (string), description (string).`;
        userPrompt = `Title: ${payload.title}\nDescription: ${payload.description}`;
        break;

      case "enhance-image-prompt":
        systemPrompt = "You are a product photography expert. Suggest improvements for the product image. Return a JSON object with fields: suggestions (array of strings), qualityScore (number 1-10), issues (array of strings).";
        userPrompt = `Product: ${payload.title}\nCategory: ${payload.category || "General"}\nImage count: ${payload.imageCount || 1}`;
        break;

      default:
        return new Response(JSON.stringify({ error: `Unknown task type: ${type}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
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
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ result: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("marketplace-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
