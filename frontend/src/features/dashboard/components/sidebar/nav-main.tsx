"use client";

import { IconArticle, IconSearch } from "@tabler/icons-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import AddDashboard from "@/features/dashboard/components/dialogs/add-dashboard";
import { useDashboardContext } from "@/features/dashboard/components/providers/dashboard-provider";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import DeleteDashboard from "@/features/dashboard/components/dialogs/delete-dashboard";

export function NavMain() {
  const {
    dashboardNames,
    loading,
    error,
    selectedDashboardName,
    refreshDashboardNames,
    selectDashboard,
  } = useDashboardContext();
  const pathname = usePathname();
  const router = useRouter();

  const handleDashboardDeleted = async (name: string) => {
    const remaining = dashboardNames.filter((dash) => dash !== name);
    const refreshedNames = await refreshDashboardNames();
    if (selectedDashboardName === name) {
      const fallback = refreshedNames.find((dash) => dash !== name) ?? remaining[0];
      if (fallback) {
        selectDashboard(fallback);
      } else {
        router.push("/dashboard");
      }
    }
  };

  const handleDashboardCreated = async (name: string) => {
    await refreshDashboardNames();
    selectDashboard(name);
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <AddDashboard onCreated={handleDashboardCreated} />
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarGroup>
          <SidebarGroupLabel className="">Dashboards</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Transactions Search"
                isActive={pathname === "/dashboard/search"}
              >
                <Link href="/dashboard/search">
                  <IconSearch size={16} />
                  <span>Transactions Search</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {loading && (
              <SidebarMenuItem>
                <SidebarMenuButton disabled>
                  <IconArticle />
                  <span>Loading dashboards…</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            {error && !loading && (
              <SidebarMenuItem>
                <SidebarMenuButton disabled>
                  <IconArticle />
                  <span>{error}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            {!loading && !error && dashboardNames.length === 0 && (
              <SidebarMenuItem>
                <SidebarMenuButton disabled>
                  <IconArticle />
                  <span>No dashboards yet</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            {dashboardNames.map((name) => {
              const encoded = encodeURIComponent(name);
              const isActive =
                pathname === `/dashboard/${encoded}` &&
                selectedDashboardName === name;
              return (
                <SidebarMenuItem key={name}>
                  <SidebarMenuButton asChild tooltip={name} isActive={isActive}>
                    <Link
                      className="flex flex-row justify-between items-center"
                      href={`/dashboard/${encoded}`}
                    >
                      <div className="flex flex-row gap-2 items-center">
                        <IconArticle size={16} />
                        <span className=" line-clamp-1">{name}</span>
                      </div>
                      <SidebarMenuAction showOnHover>
                        <DeleteDashboard
                          dashboardName={name}
                          onDeleted={() => handleDashboardDeleted(name)}
                        />
                      </SidebarMenuAction>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
