"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { DeliverableCard } from "@/components/student/deliverable-card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface Deliverable {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  status: "pending" | "submitted" | "completed" | "rejected";
  file?: string;
  docentId: {
    name: string;
    email: string;
  };
}

export default function StudentDeliverables() {
  const { data: session } = useSession();
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(false);
  const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchDeliverables = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      const res = await fetch(
        `${NEXT_PUBLIC_API_URL}/deliverables/student/${session.user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const { message, data } = await res.json();

      if (res.ok) {
        setDeliverables(data);
      } else {
        toast.error("Error al cargar los entregables");
      }
    } catch (error) {
      console.error("Error fetching deliverables:", error);
      toast.error("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, NEXT_PUBLIC_API_URL]);

  useEffect(() => {
    fetchDeliverables();
  }, [fetchDeliverables]);

  const handleDeliverableUpdated = () => {
    fetchDeliverables();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "submitted":
        return <FileText className="w-5 h-5 text-blue-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "rejected":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Completado";
      case "submitted":
        return "Enviado";
      case "pending":
        return "Pendiente";
      case "rejected":
        return "Rechazado";
      default:
        return status;
    }
  };

  const pendingCount = deliverables.filter(
    (d) => d.status === "pending",
  ).length;
  const submittedCount = deliverables.filter(
    (d) => d.status === "submitted",
  ).length;

  return (
    <main className="bg-muted/30 min-h-screen">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4 sticky top-0 bg-white">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-auto" />
        <h1 className="text-lg font-semibold">Mis Entregables</h1>
      </header>

      <section className="p-6">
        {/* Estadísticas */}
        <section className="mb-8">
          <div className="rounded-md border bg-background shadow-sm px-6 py-7">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Mis entregables
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  {deliverables.length} entregables
                </h1>
                <p className="text-muted-foreground mt-2 text-sm md:text-base">
                  Sigue el progreso de tus entregas y entrega tus trabajos a
                  tiempo.
                </p>
              </div>

              <div className="flex gap-3">
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl border bg-muted/40">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-muted-foreground">
                      Pendientes
                    </span>
                    <span className="text-lg font-bold">{pendingCount}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl border bg-muted/40">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-muted-foreground">
                      Enviados
                    </span>
                    <span className="text-lg font-bold">{submittedCount}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 h-px bg-border" />
          </div>
        </section>

        {/* Lista de entregables */}
        <section className="rounded-md border bg-background shadow-sm p-4 md:p-6">
          <div className="mb-5">
            <h2 className="font-semibold text-lg">Listado de entregables</h2>
            <p className="text-sm text-muted-foreground">
              Revisa los detalles de cada entregable y sube tus trabajos.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : deliverables.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">
                No tienes entregables asignados aún
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {deliverables.map((deliverable) => (
                <DeliverableCard
                  key={deliverable._id}
                  deliverable={deliverable}
                  onDeliverableUpdated={handleDeliverableUpdated}
                />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
