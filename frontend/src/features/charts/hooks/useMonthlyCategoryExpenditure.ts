import { useEffect, useState } from "react";
import { useApi } from "@/lib/api";
import { userDataApi } from "@/features/charts/services/user-data-api";
import { getErrorMessage } from "@/lib/utils";
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
        const res = await userDataApi.categories(fetchApi, dashboardName);
        if (mounted) setData(res);
      } catch (e: unknown) {
        if (mounted) setError(getErrorMessage(e, "Failed to load categories"));
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
