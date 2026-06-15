/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useDashboardContext } from "@/features/dashboard/components/providers/dashboard-provider";

export default function DashboardLanding() {
  const { systemTheme } = useTheme();

  const router = useRouter();
  const { dashboardNames, loading, error } = useDashboardContext();

  useEffect(() => {
    if (!loading && !error && dashboardNames.length > 0) {
      router.replace(`/dashboard/${encodeURIComponent(dashboardNames[0])}`);
    }
  }, [dashboardNames, loading, error, router]);

  if (error) {
    return (
      <div className="px-6 py-8 text-red-500">
        Failed to load dashboards: {error}
      </div>
    );
  }

  return (
    <>
      {loading ? (
        <div className="px-6 py-8 text-muted-foreground">
          Loading your dashboards...
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center ">
          <div className="px-6 py-8 text-muted-foreground">
            Select a dashboard from the sidebar or create a new one to get
            started.
          </div>
          {systemTheme === "dark" ? (
            <img
              width={600}
              height={400}
              src={"/images/noDashboards-dark.png"}
              alt="No dashboards"
            />
          ) : (
            <img
              width={600}
              height={400}
              src={"/images/noDashboards-light.avif"}
              alt="No dashboards"
            />
          )}
        </div>
      )}
    </>
  );
}
