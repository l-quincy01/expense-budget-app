// hooks/useAllUserData.ts
import { useEffect, useState } from "react";
import { useApi } from "@/lib/api";
import { userDataApi } from "@/lib/api-adapters";
import { getErrorMessage } from "@/lib/utils";
import {
  userMonthlyTransactions,
  userMonthlyIncomeExpenseTransactions,
  userMonthlyCategoryExpenditure,
} from "@/types/types";

export function useAllUserData() {
  const fetchApi = useApi();

  const [transactions, setTransactions] = useState<userMonthlyTransactions[]>(
    []
  );
  const [incomeExpense, setIncomeExpense] = useState<
    userMonthlyIncomeExpenseTransactions[]
  >([]);
  const [categories, setCategories] = useState<
    userMonthlyCategoryExpenditure[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);

        const [tx, ie, cats] = await Promise.all([
          userDataApi.allTransactions(fetchApi),
          userDataApi.allIncomeExpense(fetchApi),
          userDataApi.allCategories(fetchApi),
        ]);

        if (!mounted) return;

        setTransactions(tx);
        setIncomeExpense(ie);
        setCategories(cats);
      } catch (e: unknown) {
        if (mounted) setError(getErrorMessage(e, "Failed to load data"));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [fetchApi]);

  return { transactions, incomeExpense, categories, loading, error };
}
