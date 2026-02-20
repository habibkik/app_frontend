import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ImageRequest {
  productName: string;
  productDescription: string;
  category: string;
  imageType: "social" | "ad" | "landing" | "ecommerce" | "email";
  competitors?: string[];
  pricingInfo?: string;
}

const IMAGE_PROMPTS: Record<string, (p: string, d: string) => string> = {
  social:
    (p, d) =>
      `Create a vibrant, eye-catching social media product photo of "${p}" (${d}). Modern lifestyle setting, bright natural lighting, clean background with soft bokeh. The product should be the clear focal point. Square 1:1 aspect ratio optimized for Instagram/Facebook. Ultra high resolution.`,
  ad:
    (p, d) =>
      `Create a professional advertising banner image for "${p}" (${d}). Clean white/gradient background, dramatic product lighting, premium feel. Space on the right side for text overlay. Wide 16:9 aspect ratio. Ultra high resolution.`,
  landing:
    (p, d) =>
      `Create a stunning hero image for a landing page featuring "${p}" (${d}). Dramatic angle, professional studio lighting, slight reflection on surface. Modern minimalist aesthetic with space for headline text. Wide 16:9 aspect ratio. Ultra high resolution.`,
  ecommerce:
    (p, d) =>
      `Create a clean ecommerce product photo of "${p}" (${d}). Pure white background, even lighting from multiple angles, showing product details clearly. Professional product photography style. Square 1:1 aspect ratio. Ultra high resolution.`,
  email:
    (p, d) =>
      `Create an email marketing header image for "${p}" (${d}). Warm inviting atmosphere, product in use/lifestyle context, subtle brand colors. Horizontal 3:1 aspect ratio optimized for email headers. Ultra high resolution.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { productName, productDescription, category, imageType, competitors, pricingInfo }: ImageRequest =
      await req.json();

    if (!productName || !imageType) {
      return new Response(
        JSON.stringify({ error: "productName and imageType are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const desc = productDescription || category || "product";
    const promptFn = IMAGE_PROMPTS[imageType] || IMAGE_PROMPTS.social;
    let prompt = promptFn(productName, desc);

    if (competitors && competitors.length > 0) {
      prompt += ` The product should look premium and differentiated from competitors like ${competitors.slice(0, 3).join(", ")}.`;
    }

    console.log(`Generating ${imageType} image for: ${productName}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
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
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error("No image generated");
    }

    console.log(`Successfully generated ${imageType} image for ${productName}`);

    return new Response(
      JSON.stringify({ imageUrl, imageType, productName }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Image generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate image" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
