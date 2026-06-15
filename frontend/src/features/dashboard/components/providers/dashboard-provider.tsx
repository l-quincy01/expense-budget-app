"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useApi } from "@/lib/api";
import { dashboardApi } from "@/features/dashboard/api/dashboard-api";
import { getErrorMessage } from "@/lib/utils";
import { Dashboard } from "@/types/types";
import { sortDashboardMonths } from "@/utils/dashboards/sortDashboard";

type DashboardContextValue = {
  dashboardNames: string[];
  selectedDashboardName?: string;
  selectedDashboard?: Dashboard;
  loading: boolean;
  error: string | null;
  refreshDashboardNames: () => Promise<string[]>;
  refreshDashboard: (dashboardName?: string) => Promise<void>;
  selectDashboard: (dashboardName: string) => void;
};

const DashboardContext = createContext<DashboardContextValue | undefined>(
  undefined
);

function decodeDashboardName(value?: string) {
  if (!value) return undefined;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const api = useApi();
  const router = useRouter();
  const params = useParams<{ dashboardName?: string }>();
  const { isLoaded, isSignedIn } = useUser();

  const selectedDashboardName = useMemo(
    () => decodeDashboardName(params?.dashboardName),
    [params]
  );

  const [dashboardNames, setDashboardNames] = useState<string[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard>();
  const [namesLoading, setNamesLoading] = useState(false);
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
    if (!isLoaded || !isSignedIn) {
      setDashboardNames([]);
      return [];
    }

    try {
      setNamesLoading(true);
      const names = await dashboardApi.listNames(api);
      if (!mountedRef.current) return names;
      setDashboardNames(names);
      setError(null);
      return names;
    } catch (err) {
      if (mountedRef.current) {
        setError(getErrorMessage(err, "Failed to load dashboard names"));
      }
      return [];
    } finally {
      if (mountedRef.current) setNamesLoading(false);
    }
  }, [api, isLoaded, isSignedIn]);

  const refreshDashboard = useCallback(
    async (dashboardName = selectedDashboardName) => {
      if (!isLoaded || !isSignedIn || !dashboardName) {
        setSelectedDashboard(undefined);
        return;
      }

      try {
        setDashboardLoading(true);
        const dashboard = await dashboardApi.get(api, dashboardName);
        if (!mountedRef.current) return;
        setSelectedDashboard(sortDashboardMonths(dashboard));
        setError(null);
      } catch (err) {
        if (mountedRef.current) {
          setError(getErrorMessage(err, "Failed to load dashboard"));
        }
      } finally {
        if (mountedRef.current) setDashboardLoading(false);
      }
    },
    [api, isLoaded, isSignedIn, selectedDashboardName]
  );

  const selectDashboard = useCallback(
    (dashboardName: string) => {
      router.push(`/dashboard/${encodeURIComponent(dashboardName)}`);
    },
    [router]
  );

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setDashboardNames([]);
      setSelectedDashboard(undefined);
      setNamesLoading(false);
      setDashboardLoading(false);
      setError(null);
      return;
    }

    refreshDashboardNames();
  }, [isLoaded, isSignedIn, refreshDashboardNames]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    if (!selectedDashboardName) {
      setSelectedDashboard(undefined);
      return;
    }

    refreshDashboard(selectedDashboardName);
  }, [isLoaded, isSignedIn, refreshDashboard, selectedDashboardName]);

  const value = useMemo<DashboardContextValue>(
    () => ({
      dashboardNames,
      selectedDashboardName,
      selectedDashboard,
      loading: namesLoading || dashboardLoading,
      error,
      refreshDashboardNames,
      refreshDashboard,
      selectDashboard,
    }),
    [
      dashboardNames,
      selectedDashboardName,
      selectedDashboard,
      namesLoading,
      dashboardLoading,
      error,
      refreshDashboardNames,
      refreshDashboard,
      selectDashboard,
    ]
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardContext() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error(
      "useDashboardContext must be used within a DashboardProvider"
    );
  }
  return context;
}
