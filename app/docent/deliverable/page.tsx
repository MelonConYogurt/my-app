"use client";

import { CreateDeliverableDialog } from "@/components/docent/create-deliverable-dialog";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { DataTable } from "@/components/docent/deliverables-data-table/data-table";
import {
  Deliverable,
  columns,
} from "@/components/docent/deliverables-data-table/columns";

import { RefreshCw, FileCheck, CheckCircle2 } from "lucide-react";

function DelivareDocent() {
  const { data: session } = useSession();
  const [data, setData] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(false);

  const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchDeliverableByDocentId = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${NEXT_PUBLIC_API_URL}/deliverables/docent/${session?.user.id}`,
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
    } finally {
      setLoading(false);
    }
  }, [NEXT_PUBLIC_API_URL, session?.user.id]);

  useEffect(() => {
    fetchDeliverableByDocentId();
  }, [fetchDeliverableByDocentId]);

  function handleRefresh() {
    fetchDeliverableByDocentId();
    toast.success("Se han actulizado los datos");
  }

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
                  Gestión de entregables
                </h1>

                <p className="text-muted-foreground mt-2 text-sm md:text-base">
                  Visualiza, evalúa y gestiona los entregables de tus
                  estudiantes en un solo lugar.
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
          <div className="mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="font-semibold text-lg">Listado de entregables</h2>
              <p className="text-sm text-muted-foreground">
                Consulta y evalúa los trabajos enviados por tus estudiantes.
              </p>
            </div>

            <div className="flex gap-5 justify-center items-center">
              <CreateDeliverableDialog />

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
          </div>

          <DataTable columns={columns} data={data} />
        </section>
      </section>
    </main>
  );
}

export default DelivareDocent;
