"use client";

import { IconArticle } from "@tabler/icons-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import AddDashboard from "./dialogs/add-dashboard";
import useDashboard from "@/hooks/useDashboard";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavMain() {
  const { userDashboardNames, loading, error, selectedDashboardName } =
    useDashboard();
  const pathname = usePathname();

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
                  <SidebarMenuButton
                    asChild
                    tooltip={name}
                    isActive={isActive}
                  >
                    <Link href={`/dashboard/${encoded}`}>
                      <IconArticle />
                      <span>{name}</span>
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
