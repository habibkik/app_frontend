import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const taskPrompts: Record<string, (ctx: any) => string> = {
  m1: (ctx) =>
    `You are an outreach operations analyst. Analyze the following campaign data and summarize pending replies that need attention. Prioritize warm leads.
Context: ${JSON.stringify(ctx)}
Focus on: which suppliers responded, which channels have pending replies, and what to prioritize first.`,

  m2: (ctx) =>
    `You are a B2B sales copywriter. Based on the outreach data below, draft 2-3 short suggested responses for the most promising warm leads.
Context: ${JSON.stringify(ctx)}
Focus on: personalized, professional follow-ups that move the conversation forward.`,

  m3: (ctx) =>
    `You are a marketing analytics expert. Review the outreach metrics below and generate a concise dashboard summary. Flag any anomalies or concerning trends.
Context: ${JSON.stringify(ctx)}
Include: open rates assessment, reply rate analysis, channel performance comparison, and actionable insights.`,

  d1: (ctx) =>
    `You are an outreach strategist. Based on the current campaign data, recommend which suppliers to target today and which channels to use for maximum impact.
Context: ${JSON.stringify(ctx)}
Provide: specific supplier recommendations, optimal channel selection, and timing suggestions.`,

  d2: (ctx) =>
    `You are a lead generation specialist. Analyze the current supplier database and suggest strategies for adding new qualified leads.
Context: ${JSON.stringify(ctx)}
Recommend: lead sources, qualification criteria, and segment recommendations for the current pipeline.`,

  d3: (ctx) =>
    `You are a social media engagement strategist. Based on the outreach context, generate specific social media engagement actions to warm up prospects.
Context: ${JSON.stringify(ctx)}
Suggest: which prospects to engage with, what type of interactions (like, comment, share), and talking points.`,

  a1: (ctx) =>
    `You are an A/B testing expert for outreach messages. Based on performance data, suggest 2-3 message template variants to test.
Context: ${JSON.stringify(ctx)}
Provide: variant descriptions, what element is being tested (subject line, CTA, tone), and expected impact.`,

  a2: (ctx) =>
    `You are a database hygiene specialist. Analyze the outreach data and identify contacts that should be cleaned or removed.
Context: ${JSON.stringify(ctx)}
Flag: likely bounced contacts, inactive leads, duplicate patterns, and cleanup rationale.`,

  a3: (ctx) =>
    `You are a CRM pipeline analyst. Based on the campaign data, suggest which leads should move to different pipeline stages.
Context: ${JSON.stringify(ctx)}
Recommend: stage changes, reasoning for each move, and notes to add.`,

  w1: (ctx) =>
    `You are a performance review analyst. Generate a comprehensive weekly performance summary comparing current metrics to expected benchmarks.
Context: ${JSON.stringify(ctx)}
Include: wins, areas for improvement, top-performing channels, and week-over-week trends.`,

  w2: (ctx) =>
    `You are a channel optimization expert. Identify underperforming outreach channels and recommend specific optimizations or pauses.
Context: ${JSON.stringify(ctx)}
Analyze: reply rates by channel, cost-effectiveness, and specific action items for each channel.`,

  w3: (ctx) =>
    `You are a team meeting facilitator. Generate a concise team sync agenda based on the current outreach performance data.
Context: ${JSON.stringify(ctx)}
Structure: key metrics to share, blockers to discuss, wins to celebrate, and action items for next week.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { taskId, context } = await req.json();

    if (!taskId || !taskPrompts[taskId]) {
      return new Response(
        JSON.stringify({ error: `Unknown task: ${taskId}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userPrompt = taskPrompts[taskId](context || {});

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an AI outreach operations assistant. Analyze the provided data and return a structured JSON response.
You MUST respond with valid JSON only, no markdown, no code fences. Use this exact structure:
{
  "summary": "A 2-3 sentence executive summary of your analysis",
  "recommendations": ["Actionable recommendation 1", "Actionable recommendation 2", "Actionable recommendation 3"],
  "suggestedActions": [
    {"label": "Short action label", "detail": "Detailed description of what to do"},
    {"label": "Short action label 2", "detail": "Detailed description"}
  ]
}
Keep recommendations specific and data-driven. Limit to 3-5 recommendations and 2-4 suggested actions.`,
          },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
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
      return new Response(
        JSON.stringify({ error: "AI analysis failed. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // Parse the JSON response
    let parsed;
    try {
      // Strip potential markdown fences
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // Fallback if AI doesn't return valid JSON
      parsed = {
        summary: content.slice(0, 500),
        recommendations: ["Review the AI output manually for insights."],
        suggestedActions: [{ label: "Review", detail: content.slice(0, 200) }],
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("workflow-ai-task error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
