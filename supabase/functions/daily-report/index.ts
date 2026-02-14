import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    let userId: string | null = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
      const { data: { user } } = await anonClient.auth.getUser(token);
      userId = user?.id || null;
    }

    // For cron jobs, process all users with active products
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const targetUserId = userId || body.user_id;

    if (!targetUserId) {
      return new Response(JSON.stringify({ error: "No user context" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Fetch last 24h data
    const [pricesRes, alertsRes, postsRes, engagementRes, productsRes] = await Promise.all([
      supabase.from("competitor_prices").select("*").eq("user_id", targetUserId).gte("collected_at", yesterday.toISOString()),
      supabase.from("competitor_alerts").select("*").eq("user_id", targetUserId).gte("created_at", yesterday.toISOString()),
      supabase.from("scheduled_posts").select("*").eq("user_id", targetUserId).gte("created_at", yesterday.toISOString()),
      supabase.from("post_engagement").select("*").eq("user_id", targetUserId).gte("recorded_at", yesterday.toISOString()),
      supabase.from("products").select("*").eq("user_id", targetUserId).eq("status", "active"),
    ]);

    const prices = pricesRes.data || [];
    const alerts = alertsRes.data || [];
    const posts = postsRes.data || [];
    const engagement = engagementRes.data || [];
    const products = productsRes.data || [];

    // Calculate metrics
    const uniqueCompetitors = [...new Set(prices.map(p => p.competitor_name))];
    const avgPrice = prices.length > 0 ? prices.reduce((s, p) => s + Number(p.price), 0) / prices.length : 0;
    const totalImpressions = engagement.reduce((s, e) => s + (e.impressions || 0), 0);
    const totalEngagement = engagement.reduce((s, e) => s + (e.likes || 0) + (e.comments || 0) + (e.shares || 0), 0);
    const engagementRate = totalImpressions > 0 ? (totalEngagement / totalImpressions * 100) : 0;

    const metrics = {
      productsMonitored: products.length,
      competitorsFound: uniqueCompetitors.length,
      newPricesCollected: prices.length,
      alertsTriggered: alerts.length,
      postsPublished: posts.filter(p => p.status === "published").length,
      totalImpressions,
      totalEngagement,
      engagementRate: Math.round(engagementRate * 100) / 100,
      averageCompetitorPrice: Math.round(avgPrice * 100) / 100,
      priceDrops: alerts.filter(a => a.alert_type === "drop").length,
      priceIncreases: alerts.filter(a => a.alert_type === "increase").length,
    };

    // Generate AI recommendations
    let recommendations: any[] = [];
    if (lovableKey && (prices.length > 0 || alerts.length > 0)) {
      try {
        const prompt = `Analyze this daily market data and provide 3-5 actionable recommendations:

Products monitored: ${metrics.productsMonitored}
New competitor prices collected: ${metrics.newPricesCollected}
Price drops detected: ${metrics.priceDrops}
Price increases detected: ${metrics.priceIncreases}
Average competitor price: $${metrics.averageCompetitorPrice}
Posts published: ${metrics.postsPublished}
Engagement rate: ${metrics.engagementRate}%

Recent alerts: ${JSON.stringify(alerts.slice(0, 5).map(a => ({
  competitor: a.competitor_name, type: a.alert_type, severity: a.severity, message: a.message
})))}

Provide recommendations as JSON array with objects: {title, description, priority: "high"|"medium"|"low", category: "pricing"|"content"|"competitor"|"general"}`;

        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: "You are a business intelligence analyst. Return ONLY a JSON array of recommendations." },
              { role: "user", content: prompt },
            ],
            tools: [{
              type: "function",
              function: {
                name: "provide_recommendations",
                description: "Return daily report recommendations",
                parameters: {
                  type: "object",
                  properties: {
                    recommendations: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          title: { type: "string" },
                          description: { type: "string" },
                          priority: { type: "string", enum: ["high", "medium", "low"] },
                          category: { type: "string", enum: ["pricing", "content", "competitor", "general"] },
                        },
                        required: ["title", "description", "priority", "category"],
                      },
                    },
                  },
                  required: ["recommendations"],
                },
              },
            }],
            tool_choice: { type: "function", function: { name: "provide_recommendations" } },
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
          if (toolCall) {
            const parsed = JSON.parse(toolCall.function.arguments);
            recommendations = parsed.recommendations || [];
          }
        }
      } catch (e) {
        console.error("AI recommendation error:", e);
        recommendations = [
          { title: "Review competitor prices", description: `${metrics.newPricesCollected} new prices collected today. Review for opportunities.`, priority: "medium", category: "pricing" },
        ];
      }
    } else {
      recommendations = [
        { title: "Start monitoring competitors", description: "Add products and competitors to get daily intelligence reports.", priority: "high", category: "general" },
      ];
    }

    const summary = `Daily report: ${metrics.productsMonitored} products monitored, ${metrics.newPricesCollected} prices collected, ${metrics.alertsTriggered} alerts, ${metrics.postsPublished} posts published.`;

    // Store report
    const { data: report, error: insertError } = await supabase
      .from("daily_reports")
      .upsert({
        user_id: targetUserId,
        report_date: now.toISOString().split("T")[0],
        metrics_json: metrics,
        recommendations_json: recommendations,
        summary,
      }, { onConflict: "user_id,report_date" })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, report }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("daily-report error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
