import { useCallback } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/utils/formatters";

/**
 * Returns a formatting function that uses the user's selected currency.
 * Usage: const fc = useFormatCurrency(); fc(245) → "$245.00" or "€245.00"
 */
export function useFormatCurrency() {
  const { currency } = useCurrency();
  return useCallback(
    (amount: number) => formatCurrency(amount, currency),
    [currency]
  );
}
