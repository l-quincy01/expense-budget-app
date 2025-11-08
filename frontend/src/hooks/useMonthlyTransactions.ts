import { useEffect, useState } from "react";
import { useApi } from "@/lib/api";
import { userMonthlyTransactions } from "@/types/types";

export function useMonthlyTransactions(dashboardName: string) {
  const fetchApi = useApi();
  const [data, setData] = useState<userMonthlyTransactions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dashboardName) return;
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const res = await fetchApi<userMonthlyTransactions>(
          `/api/data/transactions?dashboardName=${encodeURIComponent(
            dashboardName
          )}`
        );
        if (mounted) setData(res);
      } catch (e: any) {
        if (mounted) setError(e.message ?? "Failed to load transactions");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [fetchApi, dashboardName]);

  return { data, loading, error };
}
