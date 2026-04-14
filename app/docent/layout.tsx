"use client";

import { DocentSidebar } from "../../components/docent/sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function DocentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DocentSidebar />
      <SidebarInset className="bg-background">{children}</SidebarInset>
    </SidebarProvider>
  );
}
