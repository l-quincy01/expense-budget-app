import { SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/header/site-header";
import { AppSidebar } from "@/features/dashboard/components/sidebar/app-sidebar";
import { DashboardProvider } from "@/features/dashboard/components/providers/dashboard-provider";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 54)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <DashboardProvider>
        <AppSidebar variant="floating" />
        <div className="container mx-auto p-4">
          <div className="mb-4 sticky">
            <SiteHeader />
          </div>
          {children}
        </div>
      </DashboardProvider>
    </SidebarProvider>
  );
}
