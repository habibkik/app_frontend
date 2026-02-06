import { useCallback } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/utils/formatters";

/**
 * Returns a formatting function that converts from USD and formats
 * in the user's selected currency using real exchange rates.
 *
 * Usage: const fc = useFormatCurrency(); fc(245) → "$245.00" or "€220.34"
 *
 * All prices in the app are stored as USD. This hook converts them
 * to the selected currency before formatting.
 */
export function useFormatCurrency() {
  const { currency, convert } = useCurrency();
  return useCallback(
    (amountInUSD: number) => formatCurrency(convert(amountInUSD), currency),
    [currency, convert]
  );
}
