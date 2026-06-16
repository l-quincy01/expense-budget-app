"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboardRoute = pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  if (isDashboardRoute) {
    return <>{children}</>;
  }

  return (
    <div className="container mx-auto p-4">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
