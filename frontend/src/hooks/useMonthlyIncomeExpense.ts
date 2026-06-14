import { useEffect, useState } from "react";
import { useApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import { userMonthlyIncomeExpenseTransactions } from "@/types/types";

export function useMonthlyIncomeExpense(dashboardName: string) {
  const fetchApi = useApi();
  const [data, setData] = useState<userMonthlyIncomeExpenseTransactions | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dashboardName) return;
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const res = await fetchApi<userMonthlyIncomeExpenseTransactions>(
          `/api/data/income-expense?dashboardName=${encodeURIComponent(
            dashboardName
          )}`
        );
        if (mounted) setData(res);
      } catch (e: unknown) {
        if (mounted)
          setError(getErrorMessage(e, "Failed to load income/expense"));
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
