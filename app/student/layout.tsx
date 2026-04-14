"use client";

import { StudentSidebar } from "../../components/student/sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <StudentSidebar />
      <SidebarInset className="bg-background">{children}</SidebarInset>
    </SidebarProvider>
  );
}
