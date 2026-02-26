import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SEQUENCE_TEMPLATES: Record<string, { day: number; channel: string; style: string }[]> = {
  sourcing: [
    { day: 1, channel: "email", style: "formal introduction email with subject line" },
    { day: 3, channel: "linkedin", style: "short professional LinkedIn connection message" },
    { day: 5, channel: "email", style: "follow-up email with qualification questions" },
    { day: 8, channel: "phone_call", style: "phone call script with talking points" },
    { day: 12, channel: "email", style: "value-add email sharing volume potential" },
    { day: 16, channel: "email", style: "breakup email, polite close" },
  ],
  renewal: [
    { day: 1, channel: "email", style: "soft market check email, position as periodic review" },
    { day: 5, channel: "email", style: "competitor benchmarking mention" },
    { day: 10, channel: "linkedin", style: "LinkedIn professional touch" },
  ],
  esg: [
    { day: 1, channel: "email", style: "formal ESG certification request email" },
    { day: 5, channel: "email", style: "friendly reminder email" },
    { day: 12, channel: "phone_call", style: "escalation phone call script" },
  ],
  dual: [
    { day: 1, channel: "email", style: "capability inquiry email" },
    { day: 3, channel: "linkedin", style: "LinkedIn connection request" },
    { day: 7, channel: "email", style: "qualification follow-up email" },
    { day: 14, channel: "email", style: "RFQ invitation email" },
  ],
  "rfq-followup": [
    { day: 1, channel: "email", style: "RFQ follow-up checking receipt" },
    { day: 4, channel: "phone_call", style: "phone call to confirm RFQ receipt" },
    { day: 8, channel: "email", style: "deadline reminder email" },
  ],
  general: [
    { day: 1, channel: "email", style: "formal business email with subject line" },
    { day: 3, channel: "linkedin", style: "professional networking message" },
    { day: 5, channel: "email", style: "follow-up email" },
    { day: 8, channel: "whatsapp", style: "conversational follow-up" },
    { day: 12, channel: "email", style: "breakup email" },
  ],
};

const TIER_INSTRUCTIONS: Record<string, string> = {
  A: "This is a Tier A Strategic supplier. Use executive-level language, mention long-term partnership, and be highly personalized.",
  B: "This is a Tier B Operational supplier. Use professional procurement language, focus on capabilities and pricing.",
  C: "This is a Tier C Backup supplier. Keep messages concise and automated-friendly, focus on basic qualification.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await anonClient.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = user.id;

    const { suppliers, productName, objective = "general", supplierTier = "B" } = await req.json();

    if (!suppliers || !Array.isArray(suppliers) || suppliers.length === 0) {
      return new Response(JSON.stringify({ error: "No suppliers provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sequenceSteps = SEQUENCE_TEMPLATES[objective] || SEQUENCE_TEMPLATES.general;
    const tierInstruction = TIER_INSTRUCTIONS[supplierTier] || TIER_INSTRUCTIONS.B;
    const allCampaigns: any[] = [];

    for (const supplier of suppliers) {
      const stepsDescription = sequenceSteps.map(
        (s, i) => `Step ${i + 1} (Day ${s.day}, ${s.channel}): ${s.style}`
      ).join("\n");

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
              content: `You are an expert B2B outreach copywriter specializing in procurement. Generate a multi-step outreach sequence for contacting a supplier. Each step should match the channel's tone and character limits. For email steps, include a subject line. ${tierInstruction}`,
            },
            {
              role: "user",
              content: `Supplier: ${supplier.name}\nLocation: ${supplier.location || "Unknown"}\nProduct: ${productName || "General inquiry"}\nSpecializations: ${supplier.specializations?.join(", ") || "N/A"}\nObjective: ${objective}\n\nGenerate messages for this sequence:\n${stepsDescription}`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "return_sequence_messages",
                description: "Return outreach sequence messages",
                parameters: {
                  type: "object",
                  properties: {
                    messages: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          step: { type: "number" },
                          day: { type: "number" },
                          channel: { type: "string" },
                          message: { type: "string" },
                          subject: { type: "string", description: "Only for email channel" },
                        },
                        required: ["step", "day", "channel", "message"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["messages"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "return_sequence_messages" } },
        }),
      });

      if (!aiResponse.ok) {
        if (aiResponse.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (aiResponse.status === 402) {
          return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        console.error("AI error:", aiResponse.status);
        // Fallback
        for (let i = 0; i < sequenceSteps.length; i++) {
          const step = sequenceSteps[i];
          allCampaigns.push({
            user_id: userId,
            supplier_id: supplier.id || supplier.name.toLowerCase().replace(/\s+/g, "-"),
            supplier_name: supplier.name,
            product_name: productName || null,
            channel: step.channel,
            message: `Hi, I'm interested in sourcing ${productName || "products"} from ${supplier.name}. Could we discuss pricing and availability?`,
            subject: step.channel === "email" ? `Sourcing Inquiry - ${productName || "Products"}` : null,
            status: "draft",
            sequence_step: i + 1,
            scheduled_day: step.day,
            objective,
            supplier_tier: supplierTier,
          });
        }
        continue;
      }

      const aiData = await aiResponse.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      let seqMessages: any[] = [];

      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        seqMessages = parsed.messages || [];
      } catch {
        console.error("Failed to parse AI response for", supplier.name);
        seqMessages = sequenceSteps.map((s, i) => ({
          step: i + 1,
          day: s.day,
          channel: s.channel,
          message: `Hi, I'm interested in sourcing ${productName || "products"} from ${supplier.name}. Could we discuss pricing and availability?`,
          subject: s.channel === "email" ? `Sourcing Inquiry - ${productName || "Products"}` : undefined,
        }));
      }

      for (const msg of seqMessages) {
        allCampaigns.push({
          user_id: userId,
          supplier_id: supplier.id || supplier.name.toLowerCase().replace(/\s+/g, "-"),
          supplier_name: supplier.name,
          product_name: productName || null,
          channel: msg.channel,
          message: msg.message,
          subject: msg.subject || null,
          status: "draft",
          sequence_step: msg.step || 1,
          scheduled_day: msg.day || 1,
          objective,
          supplier_tier: supplierTier,
        });
      }
    }

    if (allCampaigns.length > 0) {
      const { error: insertError } = await supabase
        .from("outreach_campaigns")
        .insert(allCampaigns);

      if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error("Failed to save campaigns");
      }
    }

    return new Response(
      JSON.stringify({ success: true, campaigns_created: allCampaigns.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("prepare-outreach-campaigns error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
