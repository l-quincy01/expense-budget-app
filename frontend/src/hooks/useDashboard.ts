import { useDashboardContext } from "@/components/providers/dashboard-provider";

export default function useDashboard() {
  const dashboard = useDashboardContext();
  return {
    userDashboard: dashboard.selectedDashboard,
    userDashboardNames: dashboard.dashboardNames,
    selectedDashboardName: dashboard.selectedDashboardName,
    loading: dashboard.loading,
    error: dashboard.error,
    refreshDashboardNames: dashboard.refreshDashboardNames,
    refreshDashboard: dashboard.refreshDashboard,
    selectDashboard: dashboard.selectDashboard,
  };
}
