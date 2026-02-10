import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface GenerateContentRequest {
  productName: string;
  productDescription: string;
  targetAudience: string;
  tone: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { productName, productDescription, targetAudience, tone }: GenerateContentRequest = await req.json();

    if (!productName) {
      return new Response(
        JSON.stringify({ error: "Product name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating marketing content for: ${productName}, audience: ${targetAudience}, tone: ${tone}`);

    const toneGuidelines = {
      professional: "Use business-like, formal language. Be trustworthy and use industry terminology. Maintain authority.",
      friendly: "Be conversational, approachable, and relatable. Use warm, welcoming language that connects personally.",
      humorous: "Be witty, entertaining, and memorable. Use playful language and clever wordplay where appropriate.",
      urgent: "Create FOMO with time-sensitive language. Emphasize scarcity and drive immediate action."
    };

    const audienceGuidelines = {
      ecommerce: "Focus on value, variety, and fast shipping. Highlight reviews and easy returns.",
      wholesale: "Emphasize bulk pricing, reliability, and partnership benefits. Focus on volume discounts.",
      retailers: "Highlight margins, display-friendly packaging, and brand strength. Focus on resale potential.",
      b2b: "Focus on ROI, compliance, reliability, and support. Emphasize scalability and business outcomes."
    };

    const systemPrompt = `You are MiroMind, an expert marketing content creator specializing in compelling product marketing across all channels.

PRODUCT: ${productName}
DESCRIPTION: ${productDescription || "No description provided"}
TARGET AUDIENCE: ${targetAudience}
TONE: ${tone}

TONE GUIDELINES:
${toneGuidelines[tone as keyof typeof toneGuidelines] || toneGuidelines.professional}

AUDIENCE GUIDELINES:
${audienceGuidelines[targetAudience as keyof typeof audienceGuidelines] || audienceGuidelines.ecommerce}

Generate comprehensive marketing content following these EXACT specifications:

1. HEADLINES (exactly 5 variations):
   - Make them attention-grabbing and benefit-focused
   - Include elements of: urgency, uniqueness, value proposition
   - Each should be different in approach (emotional, logical, social proof, etc.)

2. AD COPY (3 lengths):
   - Short (~30 words): Strong hook + clear CTA
   - Medium (~75 words): Hook + value proposition + key benefits + CTA
   - Long (~150 words): Full narrative with pain point, solution, benefits, proof, and CTA

3. PRODUCT DESCRIPTIONS (3 lengths):
   - Short (~50 words): What it is and key benefit
   - Medium (~150 words): Features, benefits, and use cases
   - Long (~300 words): Complete with specs, materials, dimensions, care instructions

4. EMAIL CAMPAIGN:
   - 3 subject line variations (time-sensitive, benefit-driven, social proof)
   - Full email body with: hook, value proposition, features, social proof, CTA

5. SOCIAL MEDIA (platform-specific):
   - Instagram: visual-focused caption (150 chars), 10-15 relevant hashtags, appropriate emojis
   - TikTok: trendy hook, casual caption (300 chars max), trending hashtags, sound suggestions
   - Facebook: conversational copy (500 chars), engagement question, clear CTA
   - LinkedIn: professional B2B angle (700 chars), industry insight, connection CTA
   - Twitter/X: witty message (280 chars max), 1-2 hashtags, punchy CTA

6. LANDING PAGE COPY:
   - heroHeadline: Bold, attention-grabbing headline (8-12 words)
   - heroSubheadline: Supporting line that elaborates (15-25 words)
   - valueProposition: 2-3 sentence paragraph explaining why this product matters
   - featureHighlights: 4-6 concise bullet points of key features/benefits
   - ctaText: Action-oriented button text (2-5 words, e.g., "Start Your Free Trial", "Shop Now")

Be creative, compelling, and true to the specified tone and audience throughout all content.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "generate_marketing_content",
          description: "Generate comprehensive marketing content for a product",
          parameters: {
            type: "object",
            properties: {
              headlines: {
                type: "array",
                items: { type: "string" },
                description: "5 attention-grabbing headlines"
              },
              adCopy: {
                type: "object",
                properties: {
                  short: { type: "string", description: "Short ad copy (~30 words)" },
                  medium: { type: "string", description: "Medium ad copy (~75 words)" },
                  long: { type: "string", description: "Long ad copy (~150 words)" }
                },
                required: ["short", "medium", "long"],
                additionalProperties: false
              },
              descriptions: {
                type: "object",
                properties: {
                  short: { type: "string", description: "Short description (~50 words)" },
                  medium: { type: "string", description: "Medium description (~150 words)" },
                  long: { type: "string", description: "Long description (~300 words)" }
                },
                required: ["short", "medium", "long"],
                additionalProperties: false
              },
              emailCampaign: {
                type: "object",
                properties: {
                  subjects: {
                    type: "array",
                    items: { type: "string" },
                    description: "3 email subject line variations"
                  },
                  body: { type: "string", description: "Full email body HTML template" }
                },
                required: ["subjects", "body"],
                additionalProperties: false
              },
              socialMedia: {
                type: "object",
                properties: {
                  instagram: {
                    type: "object",
                    properties: {
                      caption: { type: "string" },
                      hashtags: { type: "array", items: { type: "string" } },
                      emojis: { type: "array", items: { type: "string" } }
                    },
                    required: ["caption", "hashtags", "emojis"],
                    additionalProperties: false
                  },
                  tiktok: {
                    type: "object",
                    properties: {
                      caption: { type: "string" },
                      hashtags: { type: "array", items: { type: "string" } },
                      sounds: { type: "array", items: { type: "string" } }
                    },
                    required: ["caption", "hashtags", "sounds"],
                    additionalProperties: false
                  },
                  facebook: {
                    type: "object",
                    properties: {
                      copy: { type: "string" },
                      cta: { type: "string" },
                      question: { type: "string" }
                    },
                    required: ["copy", "cta", "question"],
                    additionalProperties: false
                  },
                  linkedin: {
                    type: "object",
                    properties: {
                      copy: { type: "string" },
                      cta: { type: "string" }
                    },
                    required: ["copy", "cta"],
                    additionalProperties: false
                  },
                  twitter: {
                    type: "object",
                    properties: {
                      copy: { type: "string" },
                      hashtag: { type: "string" },
                      cta: { type: "string" }
                    },
                    required: ["copy", "hashtag", "cta"],
                    additionalProperties: false
                  }
                },
                required: ["instagram", "tiktok", "facebook", "linkedin", "twitter"],
                additionalProperties: false
              },
              landingPage: {
                type: "object",
                properties: {
                  heroHeadline: { type: "string", description: "Bold, attention-grabbing hero headline for the landing page" },
                  heroSubheadline: { type: "string", description: "Supporting subheadline that elaborates on the hero" },
                  valueProposition: { type: "string", description: "2-3 sentence value proposition paragraph" },
                  featureHighlights: { type: "array", items: { type: "string" }, description: "4-6 key feature/benefit bullet points" },
                  ctaText: { type: "string", description: "Call-to-action button text" }
                },
                required: ["heroHeadline", "heroSubheadline", "valueProposition", "featureHighlights", "ctaText"],
                additionalProperties: false
              }
            },
            required: ["headlines", "adCopy", "descriptions", "emailCampaign", "socialMedia", "landingPage"],
            additionalProperties: false
          }
        }
      }
    ];

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
          { role: "user", content: `Generate comprehensive marketing content for "${productName}". Make it compelling and tailored to ${targetAudience} with a ${tone} tone.` }
        ],
        tools,
        tool_choice: { type: "function", function: { name: "generate_marketing_content" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        console.error("AI credits exhausted");
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
    console.log("AI response received successfully");

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "generate_marketing_content") {
      console.error("Unexpected response format:", JSON.stringify(data));
      throw new Error("Unexpected response format from AI");
    }

    const generatedContent = JSON.parse(toolCall.function.arguments);

    // Build the full response
    const result = {
      productName,
      targetAudience,
      tone,
      ...generatedContent,
      generatedAt: new Date().toISOString()
    };

    console.log("Content generation completed successfully");

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Content generation error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to generate content"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
