"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, FileText, LogOut, BookOpen } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    url: "/student",
    icon: LayoutDashboard,
  },
  {
    title: "Mis entregables",
    url: "/student/entregables",
    icon: FileText,
  },
];

export function StudentSidebar() {
  const { data: session } = useSession();
  const { state } = useSidebar();
  const pathname = usePathname();

  const userEmail = session?.user?.email || "";
  const expanded = state === "expanded";

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div
          className={`flex items-center transition-all duration-300 ${
            expanded ? "gap-3 justify-start" : "justify-center"
          }`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>

          <div
            className={`overflow-hidden transition-all duration-300 ${
              expanded ? "w-auto opacity-100" : "w-0 opacity-0"
            }`}
          >
            <h2 className="whitespace-nowrap text-lg font-semibold text-sidebar-foreground">
              EvaluApp
            </h2>

            <p className="whitespace-nowrap text-xs text-muted-foreground">
              Panel de estudiante
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.url)}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div
          className={`flex transition-all duration-300 ${
            expanded
              ? "items-center gap-3"
              : "flex-col items-center justify-center gap-3"
          }`}
        >
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {userEmail?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>

          <div
            className={`overflow-hidden transition-all duration-300 ${
              expanded ? "flex-1 w-auto opacity-100" : "w-0 opacity-0"
            }`}
          >
            <p className="truncate whitespace-nowrap text-sm font-medium text-sidebar-foreground">
              {userEmail}
            </p>

            <p className="truncate whitespace-nowrap text-xs text-muted-foreground">
              {userEmail}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="h-8 w-8 shrink-0 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Cerrar sesión</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
