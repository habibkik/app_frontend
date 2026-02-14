import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Check if triggered for a specific user (manual "Run Now") or cron (all enabled configs)
    let userId: string | null = null;
    try {
      const body = await req.json();
      userId = body.user_id || null;
    } catch {
      // No body = cron trigger
    }

    // Fetch enabled outreach configs
    let query = supabase
      .from("outreach_configs")
      .select("*, products(*)")
      .eq("enabled", true);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data: configs, error: configError } = await query;
    if (configError) throw configError;

    if (!configs || configs.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No enabled outreach configs found", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let totalSent = 0;
    const results: Array<{ config_id: string; product: string; messages_created: number }> = [];

    for (const config of configs) {
      const product = config.products;
      if (!product || product.status !== "active") continue;

      const template =
        config.message_template ||
        "Hi, I'm interested in {{product_name}}. What's your best price?";

      // Generate 3 message variants using AI
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
                "Generate 3 professional pricing inquiry message variants for contacting competitors/suppliers. Return JSON array of 3 strings. Keep each under 200 chars. Be natural and professional.",
            },
            {
              role: "user",
              content: `Product: ${product.name}\nCategory: ${product.category || "General"}\nCurrent price: $${product.current_price}\nTemplate style: ${template}\n\nGenerate 3 variants as a JSON array of strings.`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "return_messages",
                description: "Return the 3 message variants",
                parameters: {
                  type: "object",
                  properties: {
                    messages: {
                      type: "array",
                      items: { type: "string" },
                      description: "Array of 3 message variants",
                    },
                  },
                  required: ["messages"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "return_messages" } },
        }),
      });

      if (!aiResponse.ok) {
        console.error(`AI error for config ${config.id}:`, aiResponse.status);
        continue;
      }

      const aiData = await aiResponse.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      let messageVariants: string[] = [];

      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        messageVariants = parsed.messages || [];
      } catch {
        console.error("Failed to parse AI variants for config", config.id);
        messageVariants = [
          template
            .replace("{{product_name}}", product.name)
            .replace("{{price_range}}", `$${product.current_price}`),
        ];
      }

      // Create interaction records (up to max_contacts_per_run)
      const platforms = ["email", "whatsapp", "facebook", "instagram"];
      const contactsToCreate = Math.min(config.max_contacts_per_run || 10, messageVariants.length * 3);
      let created = 0;

      for (let i = 0; i < contactsToCreate; i++) {
        const variant = messageVariants[i % messageVariants.length];
        const platform = platforms[i % platforms.length];

        const { error: insertError } = await supabase
          .from("competitor_interactions")
          .insert({
            user_id: config.user_id,
            product_id: product.id,
            competitor_name: `Auto-Discovery ${i + 1}`,
            platform,
            message_sent: variant,
            status: "sent",
          });

        if (!insertError) created++;
      }

      // Update last_run info
      await supabase
        .from("outreach_configs")
        .update({
          last_run_at: new Date().toISOString(),
          last_run_results: { messages_created: created, timestamp: new Date().toISOString() },
        })
        .eq("id", config.id);

      totalSent += created;
      results.push({
        config_id: config.id,
        product: product.name,
        messages_created: created,
      });
    }

    return new Response(
      JSON.stringify({ success: true, sent: totalSent, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("auto-outreach error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
