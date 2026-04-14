"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

import { useSession } from "next-auth/react";

export default function StudentDashboard() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Panel de estudiante</h1>
      </header>

      <main className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            Bienvenido, {session?.user?.email?.split(" ")[0]}
          </h2>
          <p className="text-muted-foreground">
            Aquí tienes un resumen de tus entregables y calificaciones.
          </p>
        </div>
      </main>
    </div>
  );
}
