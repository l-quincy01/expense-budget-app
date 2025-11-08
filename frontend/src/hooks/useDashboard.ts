import { useApi } from "@/lib/api";
import { dashboard } from "@/types/types";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

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

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setNamesLoading(true);
        const names = await fetchApi<string[]>(`/api/dashboarddata/names`);
        if (!mounted) return;
        setUserDashboardNames(names);
        setError(null);
      } catch (e) {
        if (mounted)
          setError(
            e instanceof Error ? e.message : "Failed to load dashboard names"
          );
      } finally {
        if (mounted) setNamesLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [fetchApi]);

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
        setUserDashboard(dash);
        setError(null);
      } catch (e) {
        if (mounted)
          setError(
            e instanceof Error ? e.message : "Failed to load dashboard"
          );
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
  };
}
