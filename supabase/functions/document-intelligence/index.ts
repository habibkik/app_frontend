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
    const { document_text, file_name } = await req.json();

    if (!document_text || typeof document_text !== "string") {
      return new Response(
        JSON.stringify({ error: "document_text is required" }),
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
            content: `You are a procurement document intelligence system. Analyze the given document and extract structured data into four categories:
1. Requirements - functional/business requirements
2. Technical Specifications - technical specs, dimensions, materials, standards
3. Compliance Clauses - legal, regulatory, certification requirements
4. Pricing Tables - any pricing, cost, or budget information

Be thorough and extract every relevant item. For each item provide a clear title and description. For pricing items include amounts and units where available.`,
          },
          {
            role: "user",
            content: `Analyze this document (${file_name || "uploaded file"}) and extract all procurement-relevant data:\n\n${document_text.substring(0, 30000)}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_document_intelligence",
              description: "Extract structured procurement data from a document",
              parameters: {
                type: "object",
                properties: {
                  document_summary: {
                    type: "string",
                    description: "Brief summary of the document (2-3 sentences)",
                  },
                  document_type: {
                    type: "string",
                    description: "Type of document (e.g. RFP, specification, contract, invoice, quote, technical manual)",
                  },
                  requirements: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        priority: { type: "string", enum: ["high", "medium", "low"] },
                        category: { type: "string" },
                      },
                      required: ["title", "description", "priority"],
                      additionalProperties: false,
                    },
                    description: "Functional and business requirements",
                  },
                  specifications: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        value: { type: "string" },
                        unit: { type: "string" },
                        standard: { type: "string" },
                      },
                      required: ["title", "value"],
                      additionalProperties: false,
                    },
                    description: "Technical specifications",
                  },
                  compliance_clauses: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        clause: { type: "string" },
                        type: { type: "string", enum: ["legal", "regulatory", "certification", "insurance", "environmental", "other"] },
                        mandatory: { type: "boolean" },
                        reference: { type: "string" },
                      },
                      required: ["clause", "type", "mandatory"],
                      additionalProperties: false,
                    },
                    description: "Compliance and legal clauses",
                  },
                  pricing_items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        item: { type: "string" },
                        amount: { type: "number" },
                        currency: { type: "string" },
                        unit: { type: "string" },
                        notes: { type: "string" },
                      },
                      required: ["item"],
                      additionalProperties: false,
                    },
                    description: "Pricing and cost information",
                  },
                  suggested_rfq_fields: {
                    type: "object",
                    properties: {
                      product_name: { type: "string" },
                      category: { type: "string" },
                      description: { type: "string" },
                      quantity: { type: "number" },
                      budget_min: { type: "number" },
                      budget_max: { type: "number" },
                      delivery_deadline: { type: "string" },
                      quality_standard: { type: "string" },
                    },
                    required: ["product_name"],
                    additionalProperties: false,
                    description: "Suggested fields for auto-filling an RFQ",
                  },
                },
                required: ["document_summary", "document_type", "requirements", "specifications", "compliance_clauses", "pricing_items", "suggested_rfq_fields"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_document_intelligence" } },
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
      throw new Error("No data extracted from document");
    }

    const extracted = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ success: true, data: extracted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("document-intelligence error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
