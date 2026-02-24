import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CHANNELS = [
  { id: "email", label: "Email", maxLen: 2000, style: "formal business email with subject line" },
  { id: "linkedin", label: "LinkedIn", maxLen: 500, style: "professional networking message" },
  { id: "whatsapp", label: "WhatsApp", maxLen: 500, style: "conversational and concise" },
  { id: "sms", label: "SMS", maxLen: 160, style: "ultra-brief, max 160 characters" },
  { id: "phone_call", label: "Phone Call", maxLen: 1000, style: "phone call script with talking points" },
  { id: "facebook", label: "Facebook", maxLen: 500, style: "social media inquiry, friendly" },
  { id: "instagram", label: "Instagram", maxLen: 500, style: "DM style, casual professional" },
  { id: "tiktok", label: "TikTok", maxLen: 300, style: "casual business, trendy" },
  { id: "twitter", label: "Twitter/X", maxLen: 280, style: "short pitch, under 280 chars" },
];

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

    // Validate JWT explicitly
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

    const { suppliers, productName } = await req.json();

    if (!suppliers || !Array.isArray(suppliers) || suppliers.length === 0) {
      return new Response(JSON.stringify({ error: "No suppliers provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const allCampaigns: any[] = [];

    for (const supplier of suppliers) {
      const channelDescriptions = CHANNELS.map(
        (c) => `- ${c.id}: ${c.style} (max ${c.maxLen} chars)`
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
              content: `You are an expert B2B outreach copywriter. Generate personalized outreach messages for contacting a supplier across multiple channels. Each message should be appropriate for its channel's tone and length limit. For email, also provide a subject line.`,
            },
            {
              role: "user",
              content: `Supplier: ${supplier.name}\nLocation: ${supplier.location || "Unknown"}\nProduct: ${productName || "General inquiry"}\nSpecializations: ${supplier.specializations?.join(", ") || "N/A"}\n\nGenerate messages for these channels:\n${channelDescriptions}`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "return_outreach_messages",
                description: "Return outreach messages for all channels",
                parameters: {
                  type: "object",
                  properties: {
                    messages: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          channel: { type: "string" },
                          message: { type: "string" },
                          subject: { type: "string", description: "Only for email channel" },
                        },
                        required: ["channel", "message"],
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
          tool_choice: { type: "function", function: { name: "return_outreach_messages" } },
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
        continue;
      }

      const aiData = await aiResponse.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      let channelMessages: any[] = [];

      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        channelMessages = parsed.messages || [];
      } catch {
        console.error("Failed to parse AI response for", supplier.name);
        // Fallback: create basic messages
        channelMessages = CHANNELS.map((c) => ({
          channel: c.id,
          message: `Hi, I'm interested in sourcing ${productName || "products"} from ${supplier.name}. Could we discuss pricing and availability?`,
          subject: c.id === "email" ? `Sourcing Inquiry - ${productName || "Products"}` : undefined,
        }));
      }

      // Insert campaigns into DB
      for (const msg of channelMessages) {
        const campaign = {
          user_id: userId,
          supplier_id: supplier.id || supplier.name.toLowerCase().replace(/\s+/g, "-"),
          supplier_name: supplier.name,
          product_name: productName || null,
          channel: msg.channel,
          message: msg.message,
          subject: msg.subject || null,
          status: "draft",
        };
        allCampaigns.push(campaign);
      }
    }

    // Bulk insert
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
