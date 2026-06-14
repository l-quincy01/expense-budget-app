import { useApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import { Dashboard } from "@/types/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { sortDashboardMonths } from "@/utils/dashboards/sortDashboard";

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

  const [userDashboard, setUserDashboard] = useState<Dashboard>();
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
      const dashboardNames = await fetchApi<string[]>(`/api/dashboards/names`);
      if (!mountedRef.current) return;
      setUserDashboardNames(dashboardNames);
      setError(null);
    } catch (e) {
      if (mountedRef.current)
        setError(getErrorMessage(e, "Failed to load dashboard names"));
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
        const dashboard = await fetchApi<Dashboard>(
          `/api/dashboards/${encodeURIComponent(dashboardName)}`
        );
        if (!mounted) return;
        setUserDashboard(sortDashboardMonths(dashboard));
        setError(null);
      } catch (e) {
        if (mounted)
          setError(getErrorMessage(e, "Failed to load dashboard"));
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
