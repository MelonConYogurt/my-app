"use client";

import { User, columns } from "@/components/admin/users-data-table/columns";
import { DataTable } from "@/components/admin/users-data-table/data-table";
import { CreateUserDialog } from "@/components/admin/users-data-table/create-user-dialog";
import { useEffect, useState, useCallback } from "react";
import { Users as UsersIcon, ShieldCheck, RefreshCw } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function Users() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch(`${NEXT_PUBLIC_API_URL}/users`, {
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
    } finally {
      setLoading(false);
    }
  }, [NEXT_PUBLIC_API_URL]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function handleRefresh() {
    fetchUsers();
    toast.success("Se han actulizado los datos");
  }

  return (
    <main className="bg-muted/30 min-h-screen">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-auto" />
        <h1 className="text-lg font-semibold">Users</h1>
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
                    Panel administrativo
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Control de usuarios
                </h1>

                <p className="text-muted-foreground mt-2 text-sm md:text-base">
                  Administra cuentas, permisos y estado de los usuarios
                  registrados en la plataforma.
                </p>
              </div>

              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border bg-muted/40">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Sistema seguro</span>
              </div>
            </div>

            <div className="mt-6 h-px bg-border" />
          </div>
        </section>

        <section className="rounded-md border bg-background shadow-sm p-4 md:p-6">
          <div className="mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="font-semibold text-lg">Listado de usuarios</h2>
              <p className="text-sm text-muted-foreground">
                Consulta y gestiona la información disponible.
              </p>
            </div>

            <div className="flex gap-5 justify-center items-center">
              <CreateUserDialog />

              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw className={loading ? "animate-spin" : ""} />
              </Button>
            </div>
          </div>

          <DataTable columns={columns} data={data} />
        </section>
      </section>
    </main>
  );
}

export default Users;
