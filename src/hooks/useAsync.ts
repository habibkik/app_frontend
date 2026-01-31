import { useState, useCallback, useEffect } from "react";

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseAsyncReturn<T, P extends unknown[]> extends AsyncState<T> {
  execute: (...params: P) => Promise<T | null>;
  reset: () => void;
}

export function useAsync<T, P extends unknown[] = []>(
  asyncFunction: (...params: P) => Promise<T>,
  immediate: boolean = false
): UseAsyncReturn<T, P> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: immediate,
    error: null,
  });

  const execute = useCallback(
    async (...params: P): Promise<T | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await asyncFunction(...params);
        setState({ data: result, isLoading: false, error: null });
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setState((prev) => ({ ...prev, isLoading: false, error: err }));
        return null;
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  useEffect(() => {
    if (immediate) {
      execute(...([] as unknown as P));
    }
  }, [immediate, execute]);

  return { ...state, execute, reset };
}
