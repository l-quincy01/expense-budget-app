/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect } from "react";
import useDashboard from "@/hooks/useDashboard";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CirclePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLanding() {
  const router = useRouter();
  const { userDashboardNames, loading, error } = useDashboard();

  useEffect(() => {
    if (!loading && !error && userDashboardNames.length > 0) {
      router.replace(`/dashboard/${encodeURIComponent(userDashboardNames[0])}`);
    }
  }, [userDashboardNames, loading, error, router]);

  if (error) {
    return (
      <div className="px-6 py-8 text-red-500">
        Failed to load dashboards: {error}
      </div>
    );
  }

  return (
    // <div className="px-6 py-8 text-muted-foreground">
    //   {loading
    //     ? "Loading your dashboards..."
    //     : "Select a dashboard from the sidebar or create a new one to get started."}
    // </div>
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
          <img
            width={600}
            height={400}
            src={"/images/noDashboards.avif"}
            alt="No dashboards"
          />
        </div>
      )}
    </>
  );
}
