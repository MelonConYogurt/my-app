"use client";

import { AdminSidebar } from "@/components/admin/sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AdminSidebar />
      <SidebarInset className="bg-background">{children}</SidebarInset>
    </SidebarProvider>
  );
}
