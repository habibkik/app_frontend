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
  imageType: string;
  competitors?: string[];
  pricingInfo?: string;
  referenceImageUrl?: string;
}

const GLOBAL_SUFFIX = " No distortion, no hallucinated features, accurate branding. Hyper-realistic, photorealistic materials and textures, commercial product photography, high detail, sharp focus, advertising quality, 8k resolution.";

const IMAGE_PROMPTS: Record<string, (p: string, d: string) => string> = {
  // ── Original Marketing Channel Prompts ──
  social: (p, d) =>
    `Create a vibrant, eye-catching social media product photo of "${p}" (${d}). Modern lifestyle setting, bright natural lighting, clean background with soft bokeh. The product should be the clear focal point. Square 1:1 aspect ratio optimized for Instagram/Facebook. Ultra high resolution.`,
  ad: (p, d) =>
    `Create a professional advertising banner image for "${p}" (${d}). Clean white/gradient background, dramatic product lighting, premium feel. Space on the right side for text overlay. Wide 16:9 aspect ratio. Ultra high resolution.`,
  landing: (p, d) =>
    `Create a stunning hero image for a landing page featuring "${p}" (${d}). Dramatic angle, professional studio lighting, slight reflection on surface. Modern minimalist aesthetic with space for headline text. Wide 16:9 aspect ratio. Ultra high resolution.`,
  ecommerce: (p, d) =>
    `Create a clean ecommerce product photo of "${p}" (${d}). Pure white background, even lighting from multiple angles, showing product details clearly. Professional product photography style. Square 1:1 aspect ratio. Ultra high resolution.`,
  email: (p, d) =>
    `Create an email marketing header image for "${p}" (${d}). Warm inviting atmosphere, product in use/lifestyle context, subtle brand colors. Horizontal 3:1 aspect ratio optimized for email headers. Ultra high resolution.`,

  // ── Packshot (Background Removal) ──
  "packshot-front": (p, d) =>
    `Professional packshot of "${p}" (${d}) on a pure white background. Front-facing view, perfectly centered. Studio lighting with soft shadows. Product isolated, no background elements. Accurate proportions, texture, logo and color.${GLOBAL_SUFFIX}`,
  "packshot-side": (p, d) =>
    `Professional packshot of "${p}" (${d}) on a pure white background. Side profile view showing depth and thickness. Even studio lighting. Product isolated with clean edges. Maintain exact product shape and branding.${GLOBAL_SUFFIX}`,
  "packshot-back": (p, d) =>
    `Professional packshot of "${p}" (${d}) on a pure white background. Rear/back view showing labels, ports, or back design. Studio lighting, clean cutout. Accurate details and text on product.${GLOBAL_SUFFIX}`,
  "packshot-45deg": (p, d) =>
    `Professional packshot of "${p}" (${d}) on a pure white background. 45-degree perspective angle showing both front and side. Professional studio lighting with subtle shadow. Three-quarter view revealing product dimensionality.${GLOBAL_SUFFIX}`,
  "packshot-top": (p, d) =>
    `Professional packshot of "${p}" (${d}) on a pure white background. Top-down bird's eye view. Flat lay style, even overhead lighting. Product centered, no background elements. Show top surface details clearly.${GLOBAL_SUFFIX}`,

  // ── UGC Lifestyle ──
  "ugc-outdoor": (p, d) =>
    `Authentic UGC-style photo of a person using "${p}" (${d}) outdoors in a park or urban setting. Natural sunlight, candid moment, slightly imperfect smartphone photography aesthetic. Diverse model, genuine smile. The product must be clearly visible and accurate.${GLOBAL_SUFFIX}`,
  "ugc-home": (p, d) =>
    `Authentic UGC-style photo of someone using "${p}" (${d}) at home on a cozy couch or desk. Warm natural window light, casual relaxed atmosphere. Real-life messy but aesthetic background. Smartphone quality but sharp. Product clearly shown.${GLOBAL_SUFFIX}`,
  "ugc-social": (p, d) =>
    `Authentic UGC-style selfie/mirror photo of a person holding "${p}" (${d}). Social media influencer aesthetic, natural lighting, casual pose. Trendy background, authentic feel. Product is the hero but feels organic.${GLOBAL_SUFFIX}`,
  "ugc-unboxing": (p, d) =>
    `Authentic UGC-style unboxing photo of "${p}" (${d}). Hands pulling product from packaging, excitement visible. Natural overhead lighting, kitchen counter or bed background. Packaging and product both visible. Smartphone photography feel.${GLOBAL_SUFFIX}`,
  "ugc-action": (p, d) =>
    `Authentic UGC-style action photo of someone actively using "${p}" (${d}) during daily activity. Motion blur slight, candid capture moment. Natural environment, real-world context. Product in use, not posed.${GLOBAL_SUFFIX}`,

  // ── Real-Life Usage ──
  "usage-morning": (p, d) =>
    `Cinematic photo of "${p}" (${d}) being used in a morning routine scene. Golden hour soft light through windows, warm tones. Person naturally interacting with product. Storytelling composition with depth of field. Lifestyle editorial photography.${GLOBAL_SUFFIX}`,
  "usage-work": (p, d) =>
    `Cinematic photo of "${p}" (${d}) being used in a modern workspace/office. Clean desk setup, professional environment. Natural light mixed with ambient. Product integrated into work workflow. Editorial style composition.${GLOBAL_SUFFIX}`,
  "usage-commute": (p, d) =>
    `Cinematic photo of "${p}" (${d}) being used while commuting - on a train, bus, or walking in the city. Urban backdrop, dynamic movement feel. Natural outdoor lighting, street photography style. Product clearly visible in context.${GLOBAL_SUFFIX}`,
  "usage-leisure": (p, d) =>
    `Cinematic photo of "${p}" (${d}) being used during leisure time - at a café, reading, or relaxing. Warm ambient lighting, bokeh background. Relaxed mood, lifestyle magazine aesthetic. Product shown in natural use.${GLOBAL_SUFFIX}`,
  "usage-evening": (p, d) =>
    `Cinematic photo of "${p}" (${d}) being used in an evening setting. Warm ambient indoor lighting, cozy atmosphere. Moody cinematic tones, golden lamplight. Person using product comfortably. Editorial storytelling composition.${GLOBAL_SUFFIX}`,

  // ── Studio Commercial ──
  "studio-hero": (p, d) =>
    `Premium studio hero shot of "${p}" (${d}). Dramatic three-point lighting setup with rim light and key light. Dark gradient background. Product floating or elevated, luxury brand aesthetic. Reflections on glossy surface. Advertising campaign quality.${GLOBAL_SUFFIX}`,
  "studio-detail": (p, d) =>
    `Premium studio macro/detail shot of "${p}" (${d}). Extreme close-up showing material texture, stitching, buttons or key features. Shallow depth of field, professional lighting. Luxury brand detail photography. Tactile quality visible.${GLOBAL_SUFFIX}`,
  "studio-lifestyle": (p, d) =>
    `Premium studio lifestyle shot of "${p}" (${d}) with carefully styled props and accessories. Curated set design, professional softbox lighting. Magazine editorial quality. Color-coordinated scene, aspirational mood.${GLOBAL_SUFFIX}`,
  "studio-dramatic": (p, d) =>
    `Premium studio dramatic shot of "${p}" (${d}). Low-key lighting with strong shadows and highlights. Moody, cinematic atmosphere. Product as the star, dark background with single spotlight effect. High contrast, luxury feel.${GLOBAL_SUFFIX}`,
  "studio-flat": (p, d) =>
    `Premium studio flat lay of "${p}" (${d}) with complementary accessories arranged geometrically. Top-down view, even professional lighting. Clean organized composition. Marble or textured surface. Instagram-worthy product flat lay.${GLOBAL_SUFFIX}`,
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

    const { productName, productDescription, category, imageType, competitors, referenceImageUrl }: ImageRequest =
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

    console.log(`Generating ${imageType} image for: ${productName}${referenceImageUrl ? " (with reference)" : ""}`);

    // Build message content - multimodal if reference image provided
    let messageContent: any;
    if (referenceImageUrl) {
      messageContent = [
        {
          type: "text",
          text: `Using the provided product image as reference, generate a new image. Maintain the exact product appearance (shape, color, branding, proportions, logos, text). ${prompt}`,
        },
        {
          type: "image_url",
          image_url: { url: referenceImageUrl },
        },
      ];
    } else {
      messageContent = prompt;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: messageContent }],
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
    let imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    // Retry once if no image was returned (model sometimes returns text-only)
    if (!imageUrl) {
      console.warn(`No image in first attempt for ${imageType}, retrying...`);
      const retryResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [{ role: "user", content: messageContent }],
          modalities: ["image", "text"],
        }),
      });

      if (retryResponse.ok) {
        const retryData = await retryResponse.json();
        imageUrl = retryData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      }
    }

    if (!imageUrl) {
      throw new Error("No image generated after retry");
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
