"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useApi } from "@/lib/api";
import { budgetApi } from "@/features/budgets/services/budget-api";
import { getErrorMessage } from "@/lib/utils";
import { Budget } from "@/types/types";

export function useBudgetList(dashboardName?: string) {
  const api = useApi();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refreshBudgets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await budgetApi.list(api, dashboardName);
      if (isMountedRef.current) {
        setBudgets(data);
      }
    } catch (err: unknown) {
      if (isMountedRef.current) {
        setError(getErrorMessage(err, "Failed to load budgets"));
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [api, dashboardName]);

  useEffect(() => {
    refreshBudgets();
  }, [refreshBudgets]);

  return {
    budgets,
    loading,
    error,
    refreshBudgets,
  };
}
