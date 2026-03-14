import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { description, documentTypes } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const requestedDocs = documentTypes || ["rfi", "rfp", "rfq", "sow", "evaluation_matrix", "supplier_email"];

    const systemPrompt = `You are an expert procurement document generator. Given a natural language description of sourcing needs, generate professional procurement documents.

Always respond by calling the generate_rfx_package function with complete, professional content for each document type requested.

For each document, include:
- Professional formatting with sections
- Industry-standard terminology
- Specific technical requirements extracted from the description
- Compliance and quality requirements where applicable
- Clear evaluation criteria with weights
- Professional supplier invitation language`;

    const userPrompt = `Generate a complete RFx procurement package for the following requirement:

"${description}"

Generate these document types: ${requestedDocs.join(", ")}

Make each document comprehensive, professional, and ready to use. Include specific technical specs, quantities, quality standards, and evaluation criteria derived from the requirement description.`;

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
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_rfx_package",
              description: "Generate a complete RFx procurement document package",
              parameters: {
                type: "object",
                properties: {
                  productName: { type: "string", description: "Extracted product/service name" },
                  category: { type: "string", description: "Procurement category" },
                  rfi: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      purpose: { type: "string" },
                      companyBackground: { type: "string" },
                      scopeOfWork: { type: "string" },
                      technicalRequirements: { type: "array", items: { type: "string" } },
                      vendorQualifications: { type: "array", items: { type: "string" } },
                      questions: { type: "array", items: { type: "string" } },
                      submissionDeadline: { type: "string" },
                      responseFormat: { type: "string" },
                    },
                    required: ["title", "purpose", "scopeOfWork", "technicalRequirements", "questions"],
                  },
                  rfp: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      introduction: { type: "string" },
                      projectOverview: { type: "string" },
                      scopeOfWork: { type: "string" },
                      deliverables: { type: "array", items: { type: "string" } },
                      technicalRequirements: { type: "array", items: { type: "string" } },
                      qualifications: { type: "array", items: { type: "string" } },
                      proposalFormat: { type: "array", items: { type: "string" } },
                      evaluationCriteria: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            criterion: { type: "string" },
                            weight: { type: "number" },
                            description: { type: "string" },
                          },
                          required: ["criterion", "weight"],
                        },
                      },
                      timeline: { type: "string" },
                      budget: { type: "string" },
                    },
                    required: ["title", "introduction", "scopeOfWork", "deliverables", "evaluationCriteria"],
                  },
                  rfq: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      lineItems: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            item: { type: "string" },
                            specification: { type: "string" },
                            quantity: { type: "number" },
                            unit: { type: "string" },
                          },
                          required: ["item", "quantity", "unit"],
                        },
                      },
                      deliveryTerms: { type: "string" },
                      paymentTerms: { type: "string" },
                      incoterm: { type: "string" },
                      qualityStandards: { type: "array", items: { type: "string" } },
                      certifications: { type: "array", items: { type: "string" } },
                      submissionDeadline: { type: "string" },
                    },
                    required: ["title", "description", "lineItems"],
                  },
                  sow: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      background: { type: "string" },
                      objectives: { type: "array", items: { type: "string" } },
                      scope: { type: "string" },
                      tasks: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            task: { type: "string" },
                            description: { type: "string" },
                            deliverable: { type: "string" },
                          },
                          required: ["task", "description"],
                        },
                      },
                      acceptanceCriteria: { type: "array", items: { type: "string" } },
                      timeline: { type: "string" },
                      assumptions: { type: "array", items: { type: "string" } },
                    },
                    required: ["title", "objectives", "scope", "tasks"],
                  },
                  evaluation_matrix: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      criteria: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            category: { type: "string" },
                            criterion: { type: "string" },
                            weight: { type: "number" },
                            scoringGuide: { type: "string" },
                          },
                          required: ["category", "criterion", "weight"],
                        },
                      },
                      scoringScale: { type: "string" },
                      minimumScore: { type: "number" },
                    },
                    required: ["title", "criteria"],
                  },
                  supplier_email: {
                    type: "object",
                    properties: {
                      subject: { type: "string" },
                      body: { type: "string" },
                      deadline: { type: "string" },
                    },
                    required: ["subject", "body"],
                  },
                },
                required: ["productName", "category"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_rfx_package" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("AI did not return structured output");
    }

    const rfxPackage = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ success: true, data: rfxPackage }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("rfx-copilot error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
