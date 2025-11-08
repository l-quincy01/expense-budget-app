import { useEffect, useState } from "react";
import { useApi } from "@/lib/api";
import { userMonthlyCategoryExpenditure } from "@/types/types";

export function useMonthlyCategoryExpenditure(dashboardName: string) {
  const fetchApi = useApi();
  const [data, setData] = useState<userMonthlyCategoryExpenditure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dashboardName) return;
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const res = await fetchApi<userMonthlyCategoryExpenditure[]>(
          `/api/data/categories?dashboardName=${encodeURIComponent(
            dashboardName
          )}`
        );
        if (mounted) setData(res);
      } catch (e: any) {
        if (mounted) setError(e.message ?? "Failed to load categories");
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
