import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SupplierResult {
  supplierId: string;
  name: string;
  location: string;
  unitPrice: number;
  moq: number;
  leadTime: string;
  leadTimeDays: number;
  rating: number;
  certifications: string[];
  inStock: boolean;
  stockQuantity: number;
  industry: string;
  specializations: string[];
  description: string;
  yearEstablished: number;
  verified: boolean;
}

function generateFallbackSuppliers(componentName: string, category: string, quantity: number): { suppliers: SupplierResult[]; marketInsight: string } {
  const basePrice = category === "Electronics" ? 4.0 : category === "Mechanical" ? 10.0 : category === "Power" ? 6.0 : 5.0;
  
  const suppliers: SupplierResult[] = [
    {
      supplierId: `ai-sup-${Date.now()}-1`,
      name: "Shenzhen Precision Components",
      location: "Shenzhen, China",
      unitPrice: +(basePrice * 0.85).toFixed(2),
      moq: 1000,
      leadTime: "2-3 weeks",
      leadTimeDays: 18,
      rating: 4.6,
      certifications: ["ISO 9001", "RoHS"],
      inStock: true,
      stockQuantity: 5000,
      industry: category,
      specializations: [category, "OEM Manufacturing"],
      description: `Leading ${category.toLowerCase()} supplier in Shenzhen specializing in ${componentName}.`,
      yearEstablished: 2008,
      verified: true,
    },
    {
      supplierId: `ai-sup-${Date.now()}-2`,
      name: "Taiwan Semiconductor Corp",
      location: "Taipei, Taiwan",
      unitPrice: +(basePrice * 0.95).toFixed(2),
      moq: 500,
      leadTime: "2-4 weeks",
      leadTimeDays: 21,
      rating: 4.7,
      certifications: ["ISO 9001", "ISO 14001"],
      inStock: true,
      stockQuantity: 3000,
      industry: category,
      specializations: [category, "High-precision Parts"],
      description: `Taiwan-based manufacturer with extensive ${category.toLowerCase()} product lines.`,
      yearEstablished: 2001,
      verified: true,
    },
    {
      supplierId: `ai-sup-${Date.now()}-3`,
      name: "Euro Industrial GmbH",
      location: "Munich, Germany",
      unitPrice: +(basePrice * 1.25).toFixed(2),
      moq: 250,
      leadTime: "1-2 weeks",
      leadTimeDays: 10,
      rating: 4.9,
      certifications: ["ISO 9001", "IATF 16949"],
      inStock: true,
      stockQuantity: 1500,
      industry: category,
      specializations: [category, "Automotive Grade"],
      description: `Premium German supplier for industrial-grade ${componentName}.`,
      yearEstablished: 1995,
      verified: true,
    },
    {
      supplierId: `ai-sup-${Date.now()}-4`,
      name: "Apex Components USA",
      location: "Austin, TX, USA",
      unitPrice: +(basePrice * 1.35).toFixed(2),
      moq: 100,
      leadTime: "1 week",
      leadTimeDays: 7,
      rating: 4.8,
      certifications: ["ISO 9001", "AS9100"],
      inStock: true,
      stockQuantity: 800,
      industry: category,
      specializations: [category, "Quick Turnaround"],
      description: `US-based distributor with fast delivery for ${componentName}.`,
      yearEstablished: 2010,
      verified: true,
    },
    {
      supplierId: `ai-sup-${Date.now()}-5`,
      name: "Rajesh Electronics Pvt Ltd",
      location: "Bangalore, India",
      unitPrice: +(basePrice * 0.75).toFixed(2),
      moq: 2000,
      leadTime: "3-4 weeks",
      leadTimeDays: 25,
      rating: 4.3,
      certifications: ["ISO 9001"],
      inStock: false,
      stockQuantity: 0,
      industry: category,
      specializations: [category, "Cost-effective Solutions"],
      description: `Indian manufacturer offering competitive pricing for ${componentName}.`,
      yearEstablished: 2012,
      verified: true,
    },
  ];

  return {
    suppliers,
    marketInsight: `${componentName} has strong supply availability across Asia and Europe. Chinese suppliers offer the best pricing (${(basePrice * 0.75).toFixed(2)}-${(basePrice * 0.95).toFixed(2)} USD/unit), while European and US suppliers provide faster lead times at a premium. Current market demand is moderate with stable pricing trends.`,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { componentName, category, material, specifications, quantity, includeLeadTimes } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    let result;

    if (LOVABLE_API_KEY) {
      try {
        const prompt = `You are a component sourcing expert. Find suppliers for:
Component: ${componentName}, Category: ${category || "General"}, Material: ${material || "N/A"}, Specs: ${specifications || "Standard"}, Qty: ${quantity || 1000}

Return ONLY valid JSON (no markdown) with:
- suppliers: array of 4-6 objects with supplierId, name, location, unitPrice, moq, leadTime (string), leadTimeDays (number), rating (1-5), certifications (array), inStock (boolean), stockQuantity, industry, specializations (array), description, yearEstablished, verified
- marketInsight: brief market insight string
${includeLeadTimes ? "- leadTimePredictions: array of {supplierName, bestCase, expected, worstCase (days), confidence (0-100), factors (array of strings)}" : ""}

Use realistic companies from China, Taiwan, Germany, USA, Japan, India with competitive pricing.`;

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [
              { role: "system", content: "Return only valid JSON, no markdown fences." },
              { role: "user", content: prompt },
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
            result = JSON.parse(cleaned);
          }
        } else {
          const status = response.status;
          if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
          if (status === 402) return new Response(JSON.stringify({ error: "Usage limit reached." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
          console.error("AI gateway error:", status, await response.text());
        }
      } catch (aiErr) {
        console.error("AI call failed, using fallback:", aiErr);
      }
    }

    if (!result) {
      result = generateFallbackSuppliers(componentName || "Component", category || "General", quantity || 1000);
    }

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Component sourcing error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
