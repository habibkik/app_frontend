import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message_text } = await req.json();

    if (!message_text || typeof message_text !== "string") {
      return new Response(
        JSON.stringify({ error: "message_text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
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
          {
            role: "system",
            content:
              "You are a pricing data extraction assistant. Extract structured pricing information from competitor/supplier messages. Always use the extract_pricing tool to return results.",
          },
          {
            role: "user",
            content: `Extract pricing data from this message:\n\n"${message_text}"`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_pricing",
              description: "Extract structured pricing data from a message",
              parameters: {
                type: "object",
                properties: {
                  price: {
                    type: "number",
                    description: "The extracted price value (numeric only, no currency symbol)",
                  },
                  currency: {
                    type: "string",
                    description: "Currency code (e.g. USD, EUR, GBP). Default USD if unclear.",
                  },
                  unit_type: {
                    type: "string",
                    description: "Unit type (e.g. per_unit, per_kg, per_box, per_dozen)",
                  },
                  moq: {
                    type: "number",
                    description: "Minimum order quantity if mentioned",
                  },
                  lead_time: {
                    type: "string",
                    description: "Lead time / delivery time if mentioned (e.g. '7-14 days')",
                  },
                  confidence: {
                    type: "number",
                    description:
                      "Confidence score 0-100. Use 90+ for exact prices, 60-89 for approximate, below 60 for vague.",
                  },
                  notes: {
                    type: "string",
                    description: "Any additional pricing notes (bulk discounts, conditions, etc.)",
                  },
                },
                required: ["price", "currency", "confidence"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_pricing" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("No pricing data extracted from message");
    }

    const extracted = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ success: true, data: extracted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-price error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
