"use client";

import {
  Student,
  columns,
} from "@/components/docent/students-data-table/columns";
import { DataTable } from "@/components/docent/students-data-table/data-table";
import { useEffect, useState, useCallback } from "react";
import { Users as UsersIcon, RefreshCw } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function StudentsPage() {
  const [data, setData] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch(`${NEXT_PUBLIC_API_URL}/users?role=student`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const { message, data } = await res.json();

      console.log(message);

      if (res.ok) {
        setData(data);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error al cargar los estudiantes");
    } finally {
      setLoading(false);
    }
  }, [NEXT_PUBLIC_API_URL]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  function handleRefresh() {
    fetchStudents();
    toast.success("Se han actualizado los datos");
  }

  return (
    <main className="bg-muted/30 min-h-screen">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4 sticky top-0 bg-white">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-auto" />
        <h1 className="text-lg font-semibold">Estudiantes</h1>
      </header>

      <section className="p-6">
        <section className="mb-8">
          <div className="rounded-md border bg-background shadow-sm px-6 py-7">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <UsersIcon className="w-5 h-5" />
                  </div>

                  <span className="text-sm font-medium text-muted-foreground">
                    Panel de docente
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Listado de estudiantes
                </h1>

                <p className="text-muted-foreground mt-2 text-sm md:text-base">
                  Consulta la información de todos los estudiantes registrados
                  en la plataforma.
                </p>
              </div>
            </div>

            <div className="mt-6 h-px bg-border" />
          </div>
        </section>

        <section className="rounded-md border bg-background shadow-sm p-4 md:p-6">
          <div className="mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="font-semibold text-lg">Estudiantes</h2>
              <p className="text-sm text-muted-foreground">
                Consulta la información disponible de los estudiantes.
              </p>
            </div>

            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Actualizar
            </Button>
          </div>

          <DataTable columns={columns} data={data} />
        </section>
      </section>
    </main>
  );
}

export default StudentsPage;
