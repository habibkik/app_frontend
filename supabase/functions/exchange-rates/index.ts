import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// In-memory cache with TTL (1 hour)
let cachedRates: { rates: Record<string, number>; timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CNY", "INR"];

// Frankfurter doesn't support SAR/AED - use pegged rates (they're pegged to USD)
const PEGGED_RATES: Record<string, number> = {
  SAR: 3.75,   // Saudi Riyal is pegged to USD
  AED: 3.6725, // UAE Dirham is pegged to USD
};

async function fetchRates(): Promise<Record<string, number>> {
  // Check cache first
  if (cachedRates && Date.now() - cachedRates.timestamp < CACHE_TTL_MS) {
    console.log("Returning cached exchange rates");
    return cachedRates.rates;
  }

  console.log("Fetching fresh exchange rates from Frankfurter API");

  // Fetch rates with USD as base
  const targets = SUPPORTED_CURRENCIES.filter((c) => c !== "USD").join(",");
  const response = await fetch(
    `https://api.frankfurter.app/latest?from=USD&to=${targets}`
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Frankfurter API error [${response.status}]: ${body}`);
  }

  const data = await response.json();

  // Build rates map (USD = 1) + pegged currencies
  const rates: Record<string, number> = { USD: 1, ...data.rates, ...PEGGED_RATES };

  // Cache
  cachedRates = { rates, timestamp: Date.now() };

  return rates;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const rates = await fetchRates();

    return new Response(
      JSON.stringify({
        base: "USD",
        rates,
        cached: cachedRates
          ? Date.now() - cachedRates.timestamp < 1000
            ? false
            : true
          : false,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error fetching exchange rates:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
