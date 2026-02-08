import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simulated competitor sources — replace with real scraping/API calls
const COMPETITOR_SOURCES = [
  { name: "TechSupply Co", platform: "Amazon", location: "San Francisco, CA", basePrice: 39.99 },
  { name: "PartsPlus Direct", platform: "Facebook", location: "Chicago, IL", basePrice: 41.50 },
  { name: "GlobalParts Inc", platform: "Website", location: "New York, NY", basePrice: 44.00 },
  { name: "MegaTrade", platform: "OLX", location: "Phoenix, AZ", basePrice: 38.50 },
  { name: "Algiers Industrial", platform: "Ouedkniss", location: "Algiers, Algeria", basePrice: 43.25 },
  { name: "Industrial Direct", platform: "Website", location: "Dallas, TX", basePrice: 46.99 },
  { name: "QuickParts", platform: "Amazon", location: "Seattle, WA", basePrice: 40.25 },
  { name: "BulkSupply Pro", platform: "Website", location: "Houston, TX", basePrice: 37.99 },
  { name: "Oran Supplies", platform: "Ouedkniss", location: "Oran, Algeria", basePrice: 45.50 },
  { name: "FastShip Parts", platform: "Facebook", location: "Miami, FL", basePrice: 42.75 },
];

function simulatePrice(basePrice: number): number {
  const variance = (Math.random() - 0.5) * basePrice * 0.08; // ±4%
  return Number((basePrice + variance).toFixed(2));
}

function randomStock(): string {
  const r = Math.random();
  if (r < 0.65) return "in_stock";
  if (r < 0.85) return "limited";
  if (r < 0.95) return "pre_order";
  return "out_of_stock";
}

function determineAlertType(
  oldPrice: number | null,
  newPrice: number,
  yourPrice: number,
  oldStock: string | null,
  newStock: string
): { type: string; severity: string; message: string } | null {
  if (oldPrice === null) return null;

  const pctChange = ((newPrice - oldPrice) / oldPrice) * 100;

  // Price drop > 5%
  if (pctChange < -5) {
    const severity = newPrice < yourPrice ? "critical" : "high";
    return {
      type: "drop",
      severity,
      message: `${Math.abs(pctChange).toFixed(1)}% price drop${newPrice < yourPrice ? " — now below your price!" : ""}`,
    };
  }

  // Price increase > 8%
  if (pctChange > 8) {
    return {
      type: "increase",
      severity: "medium",
      message: `${pctChange.toFixed(1)}% price increase — opportunity to gain share`,
    };
  }

  // Stock change
  if (oldStock && oldStock !== "out_of_stock" && newStock === "out_of_stock") {
    return {
      type: "out_of_stock",
      severity: "medium",
      message: "Competitor went out of stock — capture their customers!",
    };
  }

  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    console.log("[MiroFlow] Starting competitor monitoring cycle...");

    // 1. Get all enabled monitor configs
    const { data: configs, error: configError } = await supabase
      .from("monitor_configs")
      .select("*, products(id, name, current_price, user_id)")
      .eq("enabled", true);

    if (configError) {
      console.error("[MiroFlow] Error fetching configs:", configError);
      throw configError;
    }

    if (!configs || configs.length === 0) {
      console.log("[MiroFlow] No active monitor configs found. Running demo cycle for all products...");
      
      // Fallback: get all products and run monitoring for them
      const { data: products, error: prodError } = await supabase
        .from("products")
        .select("id, name, current_price, user_id");

      if (prodError || !products || products.length === 0) {
        console.log("[MiroFlow] No products found. Skipping cycle.");
        return new Response(
          JSON.stringify({ success: true, message: "No products to monitor", processed: 0 }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Process each product
      let totalPrices = 0;
      let totalAlerts = 0;

      for (const product of products) {
        const result = await processProduct(supabase, product, 5);
        totalPrices += result.prices;
        totalAlerts += result.alerts;
      }

      console.log(`[MiroFlow] Cycle complete: ${totalPrices} prices, ${totalAlerts} alerts across ${products.length} products`);

      return new Response(
        JSON.stringify({ success: true, processed: products.length, prices: totalPrices, alerts: totalAlerts }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process configured monitors
    let totalPrices = 0;
    let totalAlerts = 0;

    for (const config of configs) {
      const product = config.products;
      if (!product) continue;

      const result = await processProduct(supabase, product, config.price_drop_threshold);
      totalPrices += result.prices;
      totalAlerts += result.alerts;
    }

    console.log(`[MiroFlow] Cycle complete: ${totalPrices} prices, ${totalAlerts} alerts across ${configs.length} configs`);

    return new Response(
      JSON.stringify({ success: true, processed: configs.length, prices: totalPrices, alerts: totalAlerts }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[MiroFlow] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function processProduct(
  supabase: ReturnType<typeof createClient>,
  product: { id: string; name: string; current_price: number; user_id: string },
  dropThreshold: number
): Promise<{ prices: number; alerts: number }> {
  console.log(`[MiroFlow] Processing: ${product.name} (${product.id})`);

  // Get last known prices for comparison
  const { data: lastPrices } = await supabase
    .from("competitor_prices")
    .select("competitor_name, price, stock_status")
    .eq("product_id", product.id)
    .eq("user_id", product.user_id)
    .order("collected_at", { ascending: false })
    .limit(COMPETITOR_SOURCES.length);

  const lastPriceMap = new Map(
    (lastPrices || []).map((p: { competitor_name: string; price: number; stock_status: string }) => [
      p.competitor_name,
      { price: p.price, stock: p.stock_status },
    ])
  );

  // Simulate collecting prices from all sources
  const newPrices = COMPETITOR_SOURCES.map((src) => ({
    user_id: product.user_id,
    product_id: product.id,
    competitor_name: src.name,
    competitor_platform: src.platform,
    price: simulatePrice(src.basePrice),
    currency: "USD",
    stock_status: randomStock(),
    location: src.location,
    source: "miroflow",
  }));

  // Insert price observations
  const { error: insertError } = await supabase
    .from("competitor_prices")
    .insert(newPrices);

  if (insertError) {
    console.error(`[MiroFlow] Price insert error for ${product.name}:`, insertError);
    return { prices: 0, alerts: 0 };
  }

  // Check for alerts
  const alerts: {
    user_id: string;
    product_id: string;
    competitor_name: string;
    alert_type: string;
    severity: string;
    old_price: number | null;
    new_price: number;
    message: string;
  }[] = [];

  for (const np of newPrices) {
    const last = lastPriceMap.get(np.competitor_name);
    const alert = determineAlertType(
      last ? Number(last.price) : null,
      np.price,
      Number(product.current_price),
      last?.stock || null,
      np.stock_status
    );

    if (alert) {
      alerts.push({
        user_id: product.user_id,
        product_id: product.id,
        competitor_name: np.competitor_name,
        alert_type: alert.type,
        severity: alert.severity,
        old_price: last ? Number(last.price) : null,
        new_price: np.price,
        message: alert.message,
      });
    }
  }

  if (alerts.length > 0) {
    const { error: alertError } = await supabase
      .from("competitor_alerts")
      .insert(alerts);

    if (alertError) {
      console.error(`[MiroFlow] Alert insert error:`, alertError);
    } else {
      console.log(`[MiroFlow] ${alerts.length} alerts created for ${product.name}`);
    }
  }

  return { prices: newPrices.length, alerts: alerts.length };
}
