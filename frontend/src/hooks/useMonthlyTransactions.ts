/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import { userMonthlyTransactions } from "@/types/types";
import { useApi } from "@/lib/api";

export function useMonthlyTransactions() {
  const fetchApi = useApi();
  const [data, setData] = useState<userMonthlyTransactions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const result = await fetchApi<userMonthlyTransactions[]>(
          "/api/monthly-transactions"
        );
        if (mounted) setData(result);
      } catch (e: any) {
        if (mounted) setError(e.message);
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
