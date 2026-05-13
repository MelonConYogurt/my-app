"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  CheckCircle2,
  AlertTriangle,
  Clock3,
  Eye,
  ArrowRight,
  Users,
  FileCheck,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocentStats {
  totalStudents: number;
  totalDeliverables: number;
  completado: number;
  entregado: number;
  pendiente: number;
  rechazado: number;
  recentDeliverables: any[];
}

export default function DocentDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DocentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getStats = async () => {
      try {
        const docentId = session?.user?.id;

        if (!docentId) return;

        const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

        const res = await fetch(
          `${NEXT_PUBLIC_API_URL}/deliverables/docent/${docentId}/stats`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!res.ok) {
          toast.error("Error al cargar las estadísticas");
          return;
        }

        const { data } = await res.json();
        setStats(data);
      } catch (error) {
        toast.error(String(error));
      } finally {
        setLoading(false);
      }
    };

    getStats();
  }, [session?.user?.id]);

  const statCards = [
    {
      label: "Estudiantes asignados",
      value: stats?.totalStudents || 0,
      color: "bg-blue-500",
      icon: Users,
    },
    {
      label: "Total de entregables",
      value: stats?.totalDeliverables || 0,
      color: "bg-slate-500",
      icon: FileCheck,
    },
    {
      label: "En revisión",
      value: stats?.entregado || 0,
      color: "bg-violet-500",
      icon: Eye,
    },
    {
      label: "Aprobados",
      value: stats?.completado || 0,
      color: "bg-emerald-500",
      icon: CheckCircle2,
    },
    {
      label: "Con correcciones",
      value: stats?.rechazado || 0,
      color: "bg-orange-500",
      icon: AlertTriangle,
    },
    {
      label: "Pendientes",
      value: stats?.pendiente || 0,
      color: "bg-amber-500",
      icon: Clock3,
    },
  ];

  return (
    <div className="flex flex-col">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4 sticky top-0 bg-white">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Panel de docente</h1>
      </header>

      <main className="flex-1 p-6 bg-muted/30 min-h-screen">
        <section className="border bg-white p-5 rounded-md mb-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <ClipboardList className="w-5 h-5" />
              </div>

              <span className="text-sm font-medium text-muted-foreground">
                Gestión educativa
              </span>
            </div>

            <div className="flex items-center gap-2 px-4 py-3 rounded-xl border bg-muted/40">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Sistema activo</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground">
              Bienvenido, {session?.user?.email?.split("@")[0]}
            </h2>
            <p className="text-muted-foreground mt-2">
              Aquí tienes un resumen de tus estudiantes y entregas asignadas.
            </p>
          </div>

          <div className="mt-6 h-px bg-border mb-5" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-lg border shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </span>
                    <div
                      className={`p-2 rounded-lg text-white ${stat.color} shrink-0`}
                    >
                      <Icon size={20} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">
                      {stat.value}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {stats?.recentDeliverables && stats.recentDeliverables.length > 0 && (
          <div className="rounded-lg border bg-white shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Entregas recientes</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Últimas asignaciones y entregas
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/docent/deliverable">
                  Ver todos
                  <ArrowRight size={16} />
                </Link>
              </Button>
            </div>

            <div className="space-y-3">
              {stats.recentDeliverables.map((deliverable) => (
                <div
                  key={deliverable._id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {deliverable.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Estudiante: {deliverable.studentName}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        deliverable.status === "completado"
                          ? "bg-emerald-500 text-white"
                          : deliverable.status === "entregado"
                            ? "bg-violet-500 text-white"
                            : deliverable.status === "pendiente"
                              ? "bg-amber-500 text-white"
                              : "bg-orange-500 text-white"
                      }`}
                    >
                      {deliverable.status === "completado"
                        ? "Aprobado"
                        : deliverable.status === "entregado"
                          ? "En revisión"
                          : deliverable.status === "pendiente"
                            ? "Pendiente"
                            : "Con correcciones"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
