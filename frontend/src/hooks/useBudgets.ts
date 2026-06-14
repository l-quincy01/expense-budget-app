"use client";
import { useState, useEffect } from "react";
import { Budget } from "@/types/types";
import { useApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";

export function useBudgets() {
  const fetchApi = useApi();
  const [data, setData] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const result = await fetchApi<Budget[]>("/api/budgets");
        if (mounted) setData(result);
      } catch (e: unknown) {
        if (mounted) setError(getErrorMessage(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [fetchApi]);

  return { data, loading, error };
}
