import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type CurrencyCode = "USD" | "EUR" | "GBP" | "SAR" | "AED" | "JPY" | "CNY" | "INR" | "DZD";

export const supportedCurrencies: { code: CurrencyCode; name: string; symbol: string }[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "DZD", name: "Algerian Dinar", symbol: "د.ج" },
];

interface ExchangeRates {
  [code: string]: number;
}

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  symbol: string;
  /** Convert an amount from USD to the selected currency */
  convert: (amountInUSD: number) => number;
  /** True while exchange rates are being fetched */
  ratesLoading: boolean;
  /** True if rates have been fetched at least once */
  ratesReady: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}

// Cache rates in module scope so they persist across re-renders/remounts
let cachedRates: ExchangeRates | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes client-side

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    try {
      const stored = localStorage.getItem("preferred-currency");
      if (stored && supportedCurrencies.some((c) => c.code === stored)) {
        return stored as CurrencyCode;
      }
    } catch {}
    return "USD";
  });

  const [rates, setRates] = useState<ExchangeRates | null>(cachedRates);
  const [ratesLoading, setRatesLoading] = useState(!cachedRates);

  useEffect(() => {
    // If we have fresh cached rates, skip fetch
    if (cachedRates && Date.now() - cacheTimestamp < CACHE_TTL) {
      setRates(cachedRates);
      setRatesLoading(false);
      return;
    }

    let cancelled = false;
    setRatesLoading(true);

    supabase.functions
      .invoke("exchange-rates")
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.warn("Failed to fetch exchange rates, using 1:1 fallback:", error);
          setRatesLoading(false);
          return;
        }
        if (data?.rates) {
          cachedRates = data.rates;
          cacheTimestamp = Date.now();
          setRates(data.rates);
        }
        setRatesLoading(false);
      })
      .catch((err) => {
        if (!cancelled) {
          console.warn("Exchange rates fetch failed:", err);
          setRatesLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
    localStorage.setItem("preferred-currency", code);
  };

  const symbol = supportedCurrencies.find((c) => c.code === currency)?.symbol || "$";

  const convert = useCallback(
    (amountInUSD: number): number => {
      if (currency === "USD" || !rates) return amountInUSD;
      const rate = rates[currency];
      if (!rate) return amountInUSD;
      return amountInUSD * rate;
    },
    [currency, rates]
  );

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        symbol,
        convert,
        ratesLoading,
        ratesReady: !!rates,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}
