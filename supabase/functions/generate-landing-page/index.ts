import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TONE_INSTRUCTIONS: Record<string, string> = {
  luxury: "Use sophisticated, refined language. Emphasize exclusivity, craftsmanship, and premium quality. Avoid urgency tactics—focus on desire and aspiration.",
  bold: "Use confident, direct language with strong verbs. Be assertive and energetic. Emphasize standing out.",
  minimal: "Use clean, concise language. Every word must earn its place. Favor clarity over persuasion tricks.",
  aggressive: "Use urgency-driven language. Create FOMO. Emphasize limited availability, competitive advantage, and immediate action.",
  innovative: "Use forward-thinking language. Emphasize technology, disruption, and being ahead of the curve.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Rewrite mode: rewrite a single block's content
    if (body.mode === "rewriteBlock") {
      return await handleRewrite(body, LOVABLE_API_KEY);
    }

    // Full generation mode
    return await handleFullGeneration(body, LOVABLE_API_KEY);
  } catch (e) {
    console.error("generate-landing-page error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleRewrite(body: any, apiKey: string) {
  const { blockType, currentConfig, instruction } = body;

  const systemPrompt = `You are a conversion copywriter. Rewrite the content for a "${blockType}" section of a landing page.
Instruction: ${instruction}
Return the rewritten config using the provided tool.`;

  const toolSchema = getRewriteToolSchema(blockType);
  const payload: any = {
    model: "google/gemini-3-flash-preview",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Current config:\n${JSON.stringify(currentConfig, null, 2)}\n\nRewrite it following the instruction.` },
    ],
  };

  if (toolSchema) {
    payload.tools = [toolSchema];
    payload.tool_choice = { type: "function", function: { name: toolSchema.function.name } };
  }

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const status = response.status;
    if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (status === 402) return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const t = await response.text();
    console.error("AI error:", status, t);
    throw new Error("AI generation failed");
  }

  const data = await response.json();
  let result = currentConfig;
  try {
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall) {
      result = JSON.parse(toolCall.function.arguments);
    }
  } catch { /* use original */ }

  return new Response(JSON.stringify({ config: result }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleFullGeneration(body: any, apiKey: string) {
  const { productData, marketIntelligence } = body;

  const toneInstruction = TONE_INSTRUCTIONS[productData.brandTone] || TONE_INSTRUCTIONS.bold;

  const systemPrompt = `You are an elite conversion copywriter and landing page architect. Generate a high-conversion landing page using proven persuasion frameworks: AIDA (Attention, Interest, Desire, Action), PAS (Problem, Agitation, Solution), Social Proof, and Scarcity.

BRAND TONE: ${productData.brandTone}
${toneInstruction}

RULES:
- Headlines must be benefit-driven using the formula: "Achieve [Desired Result] Without [Main Pain Point]"
- Every section must serve a conversion purpose
- Use emotional triggers aligned with the brand tone
- If market intelligence data is provided, reference competitive advantages and pricing gaps
- Generate 3 pain points that resonate with the target audience
- Transform features into emotional benefits
- If testimonials are provided, use them; otherwise generate credible proof statements
- Generate FAQ items that address buying objections

${marketIntelligence ? `MARKET INTELLIGENCE DATA:\n${JSON.stringify(marketIntelligence, null, 2)}\nUse this to inform competitive positioning, pricing strategy, and CTA urgency.` : ""}`;

  const userPrompt = `Generate a complete high-conversion landing page for this product:

${JSON.stringify(productData, null, 2)}

Use the generate_landing_page tool to return ALL sections.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
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
            name: "generate_landing_page",
            description: "Generate all sections of a high-conversion landing page",
            parameters: {
              type: "object",
              properties: {
                hero: {
                  type: "object",
                  properties: {
                    title: { type: "string", description: "Benefit-driven headline" },
                    subtitle: { type: "string", description: "Emotional hook subheadline" },
                    ctaText: { type: "string", description: "Primary CTA text" },
                  },
                  required: ["title", "subtitle", "ctaText"],
                },
                problemAgitation: {
                  type: "object",
                  properties: {
                    heading: { type: "string" },
                    intro: { type: "string", description: "Opening text exposing frustration" },
                    painPoints: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          icon: { type: "string", description: "An emoji icon" },
                          title: { type: "string" },
                          description: { type: "string" },
                        },
                        required: ["icon", "title", "description"],
                      },
                    },
                    reinforcement: { type: "string", description: "Emotional reinforcement closing text" },
                  },
                  required: ["heading", "intro", "painPoints", "reinforcement"],
                },
                solution: {
                  type: "object",
                  properties: {
                    heading: { type: "string" },
                    intro: { type: "string" },
                    differentiationPoints: { type: "array", items: { type: "string" } },
                    credibilityText: { type: "string" },
                  },
                  required: ["heading", "intro", "differentiationPoints", "credibilityText"],
                },
                featureBenefits: {
                  type: "object",
                  properties: {
                    content: { type: "string", description: "Feature-to-benefit transformation text formatted as readable paragraphs" },
                  },
                  required: ["content"],
                },
                testimonials: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      quote: { type: "string" },
                      author: { type: "string" },
                    },
                    required: ["quote", "author"],
                  },
                },
                offerPricing: {
                  type: "object",
                  properties: {
                    heading: { type: "string" },
                    valueItems: { type: "array", items: { type: "string" } },
                    anchorPrice: { type: "string" },
                    actualPrice: { type: "string" },
                    scarcityText: { type: "string" },
                    ctaText: { type: "string" },
                  },
                  required: ["heading", "valueItems", "anchorPrice", "actualPrice", "ctaText"],
                },
                faqItems: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      question: { type: "string" },
                      answer: { type: "string" },
                    },
                    required: ["question", "answer"],
                  },
                },
                finalCta: {
                  type: "object",
                  properties: {
                    heading: { type: "string", description: "Final emotional closing headline" },
                  },
                  required: ["heading"],
                },
                seo: {
                  type: "object",
                  properties: {
                    title: { type: "string", description: "SEO title under 60 chars" },
                    metaDescription: { type: "string", description: "Meta description under 160 chars" },
                  },
                  required: ["title", "metaDescription"],
                },
              },
              required: ["hero", "problemAgitation", "solution", "featureBenefits", "testimonials", "offerPricing", "faqItems", "finalCta", "seo"],
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "generate_landing_page" } },
    }),
  });

  if (!response.ok) {
    const status = response.status;
    if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (status === 402) return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const t = await response.text();
    console.error("AI error:", status, t);
    throw new Error("AI generation failed");
  }

  const data = await response.json();
  let result: any = {};
  try {
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall) {
      result = JSON.parse(toolCall.function.arguments);
    }
  } catch (e) {
    console.error("Failed to parse AI result:", e);
    throw new Error("Failed to parse AI-generated content");
  }

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getRewriteToolSchema(blockType: string) {
  const schemas: Record<string, any> = {
    hero: {
      type: "function",
      function: {
        name: "rewrite_hero",
        description: "Rewrite hero block content",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string" },
            subtitle: { type: "string" },
            ctaText: { type: "string" },
          },
          required: ["title", "subtitle", "ctaText"],
        },
      },
    },
    "problem-agitation": {
      type: "function",
      function: {
        name: "rewrite_problem",
        description: "Rewrite problem agitation block",
        parameters: {
          type: "object",
          properties: {
            heading: { type: "string" },
            intro: { type: "string" },
            painPoints: { type: "array", items: { type: "object", properties: { icon: { type: "string" }, title: { type: "string" }, description: { type: "string" } }, required: ["icon", "title", "description"] } },
            reinforcement: { type: "string" },
          },
          required: ["heading", "intro", "painPoints", "reinforcement"],
        },
      },
    },
    solution: {
      type: "function",
      function: {
        name: "rewrite_solution",
        description: "Rewrite solution block",
        parameters: {
          type: "object",
          properties: {
            heading: { type: "string" },
            intro: { type: "string" },
            differentiationPoints: { type: "array", items: { type: "string" } },
            credibilityText: { type: "string" },
          },
          required: ["heading", "intro", "differentiationPoints", "credibilityText"],
        },
      },
    },
    about: {
      type: "function",
      function: {
        name: "rewrite_about",
        description: "Rewrite about block",
        parameters: {
          type: "object",
          properties: {
            content: { type: "string" },
          },
          required: ["content"],
        },
      },
    },
    testimonials: {
      type: "function",
      function: {
        name: "rewrite_testimonials",
        description: "Rewrite testimonials",
        parameters: {
          type: "object",
          properties: {
            items: { type: "array", items: { type: "object", properties: { quote: { type: "string" }, author: { type: "string" } }, required: ["quote", "author"] } },
          },
          required: ["items"],
        },
      },
    },
    faq: {
      type: "function",
      function: {
        name: "rewrite_faq",
        description: "Rewrite FAQ items",
        parameters: {
          type: "object",
          properties: {
            items: { type: "array", items: { type: "object", properties: { question: { type: "string" }, answer: { type: "string" } }, required: ["question", "answer"] } },
          },
          required: ["items"],
        },
      },
    },
    "offer-pricing": {
      type: "function",
      function: {
        name: "rewrite_offer",
        description: "Rewrite offer/pricing block",
        parameters: {
          type: "object",
          properties: {
            heading: { type: "string" },
            valueItems: { type: "array", items: { type: "string" } },
            anchorPrice: { type: "string" },
            actualPrice: { type: "string" },
            scarcityText: { type: "string" },
            ctaText: { type: "string" },
          },
          required: ["heading", "valueItems", "anchorPrice", "actualPrice", "ctaText"],
        },
      },
    },
    contact: {
      type: "function",
      function: {
        name: "rewrite_contact",
        description: "Rewrite contact heading",
        parameters: {
          type: "object",
          properties: {
            heading: { type: "string" },
          },
          required: ["heading"],
        },
      },
    },
  };
  return schemas[blockType] || null;
}
