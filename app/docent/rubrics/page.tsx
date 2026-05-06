"use client";

import { Rubric } from "@/components/docent/rubrics-data-table/rubrics-columns";
import { DataTable } from "@/components/docent/rubrics-data-table/rubrics-data-table";
import { CreateRubricDialog } from "@/components/docent/rubrics-data-table/create-rubric-dialog";
import { useEffect, useState, useCallback } from "react";
import { BookOpen, RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";
import { columns } from "@/components/docent/rubrics-data-table/rubrics-columns";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function Rubrics() {
  const [data, setData] = useState<Rubric[]>([]);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
  const docentId = session?.user.id || "";

  const fetchRubrics = useCallback(async () => {
    if (!docentId) return;

    try {
      setLoading(true);

      const res = await fetch(
        `${NEXT_PUBLIC_API_URL}/rubrics?docentId=${docentId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const { message, data } = await res.json();

      console.log(message);

      if (res.ok) {
        setData(data);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error al cargar las rúbricas");
    } finally {
      setLoading(false);
    }
  }, [NEXT_PUBLIC_API_URL, docentId]);

  useEffect(() => {
    fetchRubrics();
  }, [fetchRubrics]);

  function handleRefresh() {
    fetchRubrics();
    toast.success("Se han actualizado los datos");
  }

  return (
    <main className="bg-muted/30 min-h-screen">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4 sticky top-0 bg-white ">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-auto" />
        <h1 className="text-lg font-semibold">Rúbricas</h1>
      </header>

      <section className="p-6">
        <section className="mb-8">
          <div className="rounded-md border bg-background shadow-sm px-6 py-7">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <BookOpen className="w-5 h-5" />
                  </div>

                  <span className="text-sm font-medium text-muted-foreground">
                    Gestión académica
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Control de rúbricas
                </h1>

                <p className="text-muted-foreground mt-2 text-sm md:text-base">
                  Crea y administra rúbricas de evaluación para tus entregables.
                </p>
              </div>

              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border bg-muted/40">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">
                  {data.length} rúbricas
                </span>
              </div>
            </div>

            <div className="mt-6 h-px bg-border" />
          </div>
        </section>

        <section className="rounded-md border bg-background shadow-sm p-4 md:p-6">
          <div className="mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="font-semibold text-lg">Listado de rúbricas</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Administra todas tus rúbricas de evaluación
              </p>
            </div>

            <div className="flex gap-2">
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

              <CreateRubricDialog docentId={docentId} />
            </div>
          </div>

          <DataTable columns={columns} data={data} />
        </section>
      </section>
    </main>
  );
}

export default Rubrics;
