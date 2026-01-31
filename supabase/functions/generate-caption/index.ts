import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateCaptionRequest {
  topic: string;
  platforms: string[];
  tone?: "professional" | "casual" | "playful" | "inspirational";
  includeHashtags?: boolean;
  includeEmojis?: boolean;
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

    const { topic, platforms, tone = "casual", includeHashtags = true, includeEmojis = true }: GenerateCaptionRequest = await req.json();

    if (!topic || !platforms || platforms.length === 0) {
      return new Response(
        JSON.stringify({ error: "Topic and at least one platform are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const platformRequirements = platforms.map(p => {
      switch (p.toLowerCase()) {
        case "twitter":
          return "Twitter/X: Max 280 characters, concise and punchy";
        case "facebook":
          return "Facebook: Can be longer (up to 500 chars), conversational tone";
        case "linkedin":
          return "LinkedIn: Professional tone, can include line breaks, up to 700 chars";
        case "instagram":
          return "Instagram: Visual-focused, heavy on emojis and hashtags, up to 2200 chars";
        case "tiktok":
          return "TikTok: Trendy, casual, use popular phrases, max 300 chars";
        default:
          return `${p}: Standard social media post`;
      }
    }).join("\n");

    const systemPrompt = `You are a social media content expert. Generate engaging, platform-optimized captions for social media posts.

For each platform, consider:
- Character limits and formatting rules
- Platform culture and audience expectations
- Optimal hashtag usage
- Emoji conventions

Platform requirements:
${platformRequirements}

Tone: ${tone}
${includeHashtags ? "Include relevant hashtags (3-5 for most platforms, more for Instagram)" : "Do not include hashtags"}
${includeEmojis ? "Include appropriate emojis to increase engagement" : "Do not include emojis"}

Respond with a JSON object containing platform-specific captions.`;

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
          { role: "user", content: `Generate engaging social media captions about: "${topic}"` }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_captions",
              description: "Generate platform-optimized social media captions",
              parameters: {
                type: "object",
                properties: {
                  captions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        platform: { type: "string", description: "Platform name (twitter, facebook, linkedin, instagram, tiktok)" },
                        caption: { type: "string", description: "The optimized caption for this platform" },
                        characterCount: { type: "number", description: "Character count of the caption" }
                      },
                      required: ["platform", "caption", "characterCount"],
                      additionalProperties: false
                    }
                  },
                  universalCaption: {
                    type: "string",
                    description: "A versatile caption that works well across all selected platforms"
                  }
                },
                required: ["captions", "universalCaption"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_captions" } }
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
    
    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "generate_captions") {
      throw new Error("Unexpected response format from AI");
    }

    const generatedContent = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({
        success: true,
        ...generatedContent
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Caption generation error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to generate captions" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
