import { useApi } from "@/lib/api";
import { dashboard } from "@/types/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { sortDashboardMonths } from "@/utils/sortDashboard";

export default function useDashboard(explicitName?: string) {
  const fetchApi = useApi();
  const params = useParams<{ dashboardName?: string }>();
  const routeDashboardName = useMemo(() => {
    const value = params?.dashboardName;
    if (!value) return undefined;
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }, [params]);
  const dashboardName = explicitName ?? routeDashboardName;

  const [userDashboard, setUserDashboard] = useState<dashboard>();
  const [userDashboardNames, setUserDashboardNames] = useState<string[]>([]);
  const [namesLoading, setNamesLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refreshDashboardNames = useCallback(async () => {
    try {
      setNamesLoading(true);
      const names = await fetchApi<string[]>(`/api/dashboarddata/names`);
      if (!mountedRef.current) return;
      setUserDashboardNames(names);
      setError(null);
    } catch (e) {
      if (mountedRef.current)
        setError(
          e instanceof Error ? e.message : "Failed to load dashboard names"
        );
    } finally {
      if (mountedRef.current) setNamesLoading(false);
    }
  }, [fetchApi]);

  useEffect(() => {
    refreshDashboardNames();
  }, [refreshDashboardNames]);

  useEffect(() => {
    if (!dashboardName) {
      setUserDashboard(undefined);
      setError(null);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        setDashboardLoading(true);
        const dash = await fetchApi<dashboard>(
          `/api/dashboarddata/${encodeURIComponent(dashboardName)}`
        );
        if (!mounted) return;
        setUserDashboard(sortDashboardMonths(dash));
        setError(null);
      } catch (e) {
        if (mounted)
          setError(e instanceof Error ? e.message : "Failed to load dashboard");
      } finally {
        if (mounted) setDashboardLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [fetchApi, dashboardName]);

  return {
    userDashboard,
    userDashboardNames,
    selectedDashboardName: dashboardName,
    loading: namesLoading || dashboardLoading,
    error,
    refreshDashboardNames,
  };
}
