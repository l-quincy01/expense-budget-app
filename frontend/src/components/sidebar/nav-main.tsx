"use client";

import { IconArticle } from "@tabler/icons-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import AddDashboard from "./dialogs/add-dashboard";
import useDashboard from "@/hooks/useDashboard";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import DeleteDashboard from "./dialogs/delete-dashboard";

export function NavMain() {
  const {
    userDashboardNames,
    loading,
    error,
    selectedDashboardName,
    refreshDashboardNames,
  } = useDashboard();
  const pathname = usePathname();
  const router = useRouter();

  const handleDashboardDeleted = async (name: string) => {
    const remaining = userDashboardNames.filter((dash) => dash !== name);
    await refreshDashboardNames();
    if (selectedDashboardName === name) {
      const fallback = remaining[0];
      if (fallback) {
        router.push(`/dashboard/${encodeURIComponent(fallback)}`);
      } else {
        router.push("/dashboard");
      }
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <AddDashboard />
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarGroup>
          <SidebarGroupLabel className="">Dashboards</SidebarGroupLabel>
          <SidebarMenu>
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
            {!loading && !error && userDashboardNames.length === 0 && (
              <SidebarMenuItem>
                <SidebarMenuButton disabled>
                  <IconArticle />
                  <span>No dashboards yet</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            {userDashboardNames.map((name) => {
              const encoded = encodeURIComponent(name);
              const isActive =
                pathname === `/dashboard/${encoded}` ||
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
