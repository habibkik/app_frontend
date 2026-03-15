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
    const authHeader = req.headers.get("Authorization");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader || "" } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, ...params } = await req.json();

    // ACTION: store — summarize and store a knowledge entry
    if (action === "store") {
      const { title, content, type, tags, source_id } = params;
      if (!title || !content) {
        return new Response(JSON.stringify({ error: "title and content are required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Summarize with AI
      const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: "Summarize this procurement document into a concise paragraph capturing key terms, pricing, suppliers, requirements, and outcomes. Keep it under 300 words." },
            { role: "user", content: content.substring(0, 15000) },
          ],
        }),
      });

      let summary = content.substring(0, 500);
      if (aiRes.ok) {
        const aiData = await aiRes.json();
        summary = aiData.choices?.[0]?.message?.content || summary;
      }

      const { data, error } = await supabase.from("procurement_knowledge").insert({
        user_id: user.id,
        title,
        type: type || "rfq",
        content_summary: summary,
        tags: tags || [],
        source_id: source_id || null,
        metadata_json: { original_length: content.length },
      }).select().single();

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: query — find similar past knowledge and generate suggestions
    if (action === "query") {
      const { query_text, type_filter } = params;
      if (!query_text) {
        return new Response(JSON.stringify({ error: "query_text is required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Fetch user's knowledge entries
      let q = supabase.from("procurement_knowledge")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (type_filter) {
        q = q.eq("type", type_filter);
      }

      const { data: entries, error: fetchErr } = await q;
      if (fetchErr) throw fetchErr;

      if (!entries || entries.length === 0) {
        return new Response(JSON.stringify({
          success: true,
          matches: [],
          suggestions: "No past procurement knowledge found. Start adding RFQs, contracts, and bids to build your knowledge base.",
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Use AI to find relevant matches and generate suggestions
      const knowledgeContext = entries.map((e: any, i: number) =>
        `[${i + 1}] Type: ${e.type} | Title: ${e.title} | Tags: ${(e.tags || []).join(", ")} | Summary: ${e.content_summary?.substring(0, 300)}`
      ).join("\n");

      const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
              content: `You are a procurement knowledge assistant. Given past procurement records and a new query, identify the most relevant past entries and provide actionable suggestions. Use the find_knowledge tool to return results.`,
            },
            {
              role: "user",
              content: `Query: "${query_text}"\n\nPast procurement knowledge:\n${knowledgeContext}`,
            },
          ],
          tools: [{
            type: "function",
            function: {
              name: "find_knowledge",
              description: "Return relevant past knowledge and suggestions",
              parameters: {
                type: "object",
                properties: {
                  relevant_indices: {
                    type: "array",
                    items: { type: "number" },
                    description: "1-based indices of relevant entries from the knowledge base",
                  },
                  relevance_explanation: {
                    type: "string",
                    description: "Why these entries are relevant",
                  },
                  suggested_terms: {
                    type: "array",
                    items: { type: "string" },
                    description: "Suggested contract/RFQ terms based on past knowledge",
                  },
                  suggested_pricing: {
                    type: "string",
                    description: "Pricing guidance based on past data",
                  },
                  suggested_suppliers: {
                    type: "array",
                    items: { type: "string" },
                    description: "Supplier names from past dealings that may be relevant",
                  },
                  risk_warnings: {
                    type: "array",
                    items: { type: "string" },
                    description: "Risks or lessons learned from past procurements",
                  },
                },
                required: ["relevant_indices", "relevance_explanation", "suggested_terms"],
                additionalProperties: false,
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "find_knowledge" } },
        }),
      });

      if (!aiRes.ok) {
        if (aiRes.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (aiRes.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error("AI query failed");
      }

      const aiData = await aiRes.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      const aiResult = toolCall?.function?.arguments ? JSON.parse(toolCall.function.arguments) : {};

      // Map indices back to actual entries
      const matchedEntries = (aiResult.relevant_indices || [])
        .filter((idx: number) => idx >= 1 && idx <= entries.length)
        .map((idx: number) => entries[idx - 1]);

      return new Response(JSON.stringify({
        success: true,
        matches: matchedEntries,
        suggestions: {
          explanation: aiResult.relevance_explanation,
          terms: aiResult.suggested_terms || [],
          pricing: aiResult.suggested_pricing || null,
          suppliers: aiResult.suggested_suppliers || [],
          risks: aiResult.risk_warnings || [],
        },
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid action. Use 'store' or 'query'." }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("procurement-knowledge error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
