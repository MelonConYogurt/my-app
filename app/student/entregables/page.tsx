"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  CheckCircle2,
  AlertTriangle,
  Clock3,
  Eye,
  Calendar,
  FileCheck,
  Award,
  File,
} from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import ViewMoreDeliverable from "@/components/student/deliverables/view-more-deliverable";

export type DeliverableStatus =
  | "pendiente"
  | "entregado"
  | "completado"
  | "rechazado";

export interface Docent {
  _id: string;
  name: string;
  email: string;
}

export interface Deliverable {
  _id?: string;
  title: string;
  description: string;
  dueDate: string;
  userId: string;
  docentId: Docent;
  status?: DeliverableStatus;
  file?: string;
  rubricId?: string;
  rating?: number;
  feedback?: string;
  createdAt?: string;
  updatedAt?: string;
}

const statusConfig = {
  completado: {
    label: "Aprobado",
    badge: "bg-emerald-500 text-white",
    border: "border-t-4 border-emerald-500",
    icon: CheckCircle2,
    iconBg: "bg-emerald-500",
  },
  entregado: {
    label: "En revisión",
    badge: "bg-violet-500 text-white",
    border: "border-t-4 border-violet-500",
    icon: Eye,
    iconBg: "bg-violet-500",
  },
  pendiente: {
    label: "Pendiente",
    badge: "bg-amber-500 text-white",
    border: "border-t-4 border-amber-500",
    icon: Clock3,
    iconBg: "bg-amber-500",
  },
  rechazado: {
    label: "Con correcciones",
    badge: "bg-orange-500 text-white",
    border: "border-t-4 border-orange-500",
    icon: AlertTriangle,
    iconBg: "bg-orange-500",
  },
};

export default function Deliverable() {
  // const mockDeliverables: Deliverable[] = [
  //   {
  //     _id: "1",
  //     title: "Propuesta de Investigación",
  //     description:
  //       "Documento inicial que describe el tema de investigación, objetivos generales y específicos, justificación y alcance del proyecto.",
  //     dueDate: "2025-02-15",
  //     userId: "student-1",
  //     docentId: "docent-1",
  //     status: "completado",
  //     rating: 4.5,
  //     file: "/pdfs/propuesta.pdf",
  //   },
  //   {
  //     _id: "2",
  //     title: "Anteproyecto de Grado",
  //     description:
  //       "Desarrollo detallado del marco teórico, estado del arte, metodología propuesta y cronograma de actividades.",
  //     dueDate: "2025-03-30",
  //     userId: "student-1",
  //     docentId: "docent-1",
  //     status: "completado",
  //     rating: 4.2,
  //     file: "/pdfs/anteproyecto.pdf",
  //   },
  //   {
  //     _id: "3",
  //     title: "Capítulo 1 - Marco Teórico",
  //     description:
  //       "Revisión bibliográfica exhaustiva, conceptos fundamentales y teorías relacionadas con el desarrollo del proyecto.",
  //     dueDate: "2025-05-15",
  //     userId: "student-1",
  //     docentId: "docent-1",
  //     status: "rechazado",
  //     rating: 2.8,
  //     file: "/pdfs/capitulo1.pdf",
  //   },
  //   {
  //     _id: "4",
  //     title: "Capítulo 2 - Diseño y Metodología",
  //     description:
  //       "Descripción de la arquitectura del sistema, diagramas UML, diseño de base de datos y metodología ágil aplicada.",
  //     dueDate: "2025-06-20",
  //     userId: "student-1",
  //     docentId: "docent-1",
  //     status: "entregado",
  //     file: "/pdfs/capitulo2.pdf",
  //   },
  //   {
  //     _id: "5",
  //     title: "Avance de Implementación",
  //     description:
  //       "Presentación del prototipo funcional con las principales funcionalidades implementadas y documentación técnica.",
  //     dueDate: "2025-04-15",
  //     userId: "student-1",
  //     docentId: "docent-1",
  //     status: "pendiente",
  //   },
  //   {
  //     _id: "6",
  //     title: "Documento Final de Tesis",
  //     description:
  //       "Documento completo de tesis incluyendo todos los capítulos, conclusiones, recomendaciones y anexos.",
  //     dueDate: "2025-05-30",
  //     userId: "student-1",
  //     docentId: "docent-1",
  //     status: "pendiente",
  //   },
  // ];
  const { data: session } = useSession();
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);

  useEffect(() => {
    const getDeliverables = async () => {
      try {
        const studentId = session?.user?.id;

        if (!studentId) return;

        const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

        const res = await fetch(
          `${NEXT_PUBLIC_API_URL}/deliverables/student/${studentId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!res.ok) {
          toast.error("Error al intentar cargar los entregables");
          return;
        }

        const { data } = await res.json();

        setDeliverables(data);
      } catch (error) {
        toast.error(String(error));
      }
    };

    getDeliverables();
  }, [session?.user?.id]);

  return (
    <main className="bg-muted/30 min-h-screen">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4 sticky top-0 bg-white">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-auto" />
        <h1 className="text-lg font-semibold">Entregables</h1>
      </header>

      <section className="p-6">
        <section className="mb-8">
          <div className="rounded-md border bg-background shadow-sm px-6 py-7">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <FileCheck className="w-5 h-5" />
                  </div>

                  <span className="text-sm font-medium text-muted-foreground">
                    Gestión educativa
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Mis entregables
                </h1>

                <p className="text-muted-foreground mt-2 text-sm md:text-base">
                  Visualiza el estado de tus entregables y las evaluaciones de
                  tu docente.
                </p>
              </div>

              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border bg-muted/40">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Sistema activo</span>
              </div>
            </div>

            <div className="mt-6 h-px bg-border" />
          </div>
        </section>

        <section className="rounded-md border bg-background shadow-sm p-4 md:p-6">
          <div className="mb-6">
            <h2 className="font-semibold text-lg">Listado de entregables</h2>
            <p className="text-sm text-muted-foreground">
              Consulta el estado, calificaciones y retroalimentación de tus
              trabajos.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {deliverables.map((deliverable) => {
              const config = statusConfig[deliverable.status || "pendiente"];

              const Icon = config.icon;

              return (
                <div
                  key={deliverable._id}
                  className={`rounded-lg bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md border`}
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="line-clamp-2 text-lg font-bold text-foreground">
                        {deliverable.title}
                      </h3>

                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {deliverable.description}
                      </p>
                    </div>

                    <div
                      className={`flex p-2 items-center justify-center rounded-lg text-white shadow-sm ${config.iconBg} shrink-0`}
                    >
                      <Icon size={20} />
                    </div>
                  </div>

                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${config.badge}`}
                    >
                      {config.label}
                    </span>

                    {deliverable.rating && (
                      <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground flex justify-center items-center gap-2">
                        <Award size={16} />
                        {deliverable.rating}/5
                      </span>
                    )}

                    {deliverable.file && (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-7 rounded-full text-xs"
                      >
                        <Link
                          href={`${process.env.NEXT_PUBLIC_API_URL}/deliverables/view/${deliverable.file}`}
                          target="_blank"
                        >
                          <File size={16} />
                          PDF
                        </Link>
                      </Button>
                    )}
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="rounded-md bg-muted p-2">
                          <Calendar size={16} />
                        </div>

                        <span>
                          {new Date(deliverable.dueDate).toLocaleDateString(
                            "es-ES",
                            {
                              day: "2-digit",
                              month: "short",
                            },
                          )}
                        </span>
                      </div>
                      <ViewMoreDeliverable data={deliverable} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {deliverables.length === 0 && (
            <div className="flex h-96 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 text-center">
              <h3 className="text-lg font-semibold text-foreground">
                No hay entregables disponibles
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Cuando tu docente asigne entregables aparecerán aquí.
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
