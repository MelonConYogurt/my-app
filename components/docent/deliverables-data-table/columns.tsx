"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  ArrowUpDown,
  Eye,
  FileX,
  CheckCircle2,
  Clock3,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Deliverable {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  userId: UserId;
  docentId: string;
  status: string;
  grade?: number;
  createdAt: string;
  updatedAt: string;
  file?: string | null;
}

export interface UserId {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

type StatusKey = "completado" | "entregado" | "pendiente" | "rechazado";

export const columns: ColumnDef<Deliverable>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Título
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ row }) => {
      const text = row.getValue("description") as string;
      return <span className="truncate max-w-62.5 block">{text || "—"}</span>;
    },
  },
  {
    accessorKey: "userId.name",
    header: "Estudiante",
    cell: ({ row }) => row.original.userId?.name || "—",
  },
  {
    id: "userId.phone",
    accessorKey: "userId.phone",
    header: "Teléfono",
    cell: ({ row }) => row.original.userId?.phone || "—",
  },
  {
    id: "userId.email",
    accessorKey: "userId.email",
    header: "Email",
    cell: ({ row }) => row.original.userId?.email || "—",
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Estado
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const statusConfig = {
        completado: {
          label: "Aprobado",
          badge: "bg-emerald-500 text-white",
          border: " border-emerald-500",
          icon: CheckCircle2,
          iconBg: "bg-emerald-500",
        },
        entregado: {
          label: "En revisión",
          badge: "bg-violet-500 text-white",
          border: " border-violet-500",
          icon: Eye,
          iconBg: "bg-violet-500",
        },
        pendiente: {
          label: "Pendiente",
          badge: "bg-amber-500 text-white",
          border: " border-amber-500",
          icon: Clock3,
          iconBg: "bg-amber-500",
        },
        rechazado: {
          label: "Con correcciones",
          badge: "bg-orange-500 text-white",
          border: " border-orange-500",
          icon: AlertTriangle,
          iconBg: "bg-orange-500",
        },
      };

      const status = (row.original.status || "pendiente") as StatusKey;
      const config = statusConfig[status];
      const Icon = config.icon;

      return (
        <div
          className={`flex gap-2 px-3 py-2 items-center justify-center rounded-lg text-sm shadow-sm text-white font-medium ${config.iconBg} shrink-0 mr-8 rounded-md`}
        >
          {config.label}
          <Icon size={18} className="text-white" />
        </div>
      );
    },
  },
  {
    accessorKey: "grade",
    header: "Calificación",
    cell: ({ row }) => {
      const grade = row.getValue("grade");
      return grade ?? "Sin calificar";
    },
  },
  {
    accessorKey: "file",
    header: "Archivo",
    cell: ({ row }) => {
      const file = row.getValue("file") as string | null;

      if (!file)
        return (
          <div className="flex items-center gap-2 border border-red-200 bg-red-200 text-red-500 p-2 rounded-md ">
            <p className="font-medium mx-2">No disponible</p>
            <FileX size={20} />
          </div>
        );

      return (
        <Dialog>
          <DialogTrigger asChild>
            <div className="flex gap-2 items-center border bg-blue-500 hover:bg-blue-600 transition-all text-white rounded-md px-4 py-2 font-medium cursor-pointer shadow-sm">
              Ver documento <Eye size={20} />
            </div>
          </DialogTrigger>

          <DialogContent
            aria-describedby={undefined}
            className="
                w-[95vw]!
                max-w-350!
                h-[92vh]
                p-0
                overflow-hidden
                rounded-md
                border-0
                bg-white
                shadow-2xl
                flex
                flex-col
              "
          >
            <div className="border-b bg-zinc-50 px-6 py-4 shrink-0">
              <DialogTitle className="text-xl font-semibold text-zinc-900">
                {row.original.title}
              </DialogTitle>

              <p className="text-sm text-zinc-500 mt-1">
                {row.original.description || "Vista previa del documento"}
              </p>
            </div>

            <div className="flex-1 bg-zinc-200 p-4 overflow-hidden">
              <iframe
                src={`${process.env.NEXT_PUBLIC_API_URL}/deliverables/view/${row.original.file}`}
                title="PDF Viewer"
                className="
                    w-full
                    h-full
                    rounded-xl
                    bg-white
                    shadow-lg
                  "
              />
            </div>
          </DialogContent>
        </Dialog>
      );
    },
  },
  {
    accessorKey: "dueDate",
    header: "Fecha límite",
    cell: ({ row }) => {
      const date = new Date(row.getValue("dueDate"));
      return date.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    accessorKey: "createdAt",
    header: "Creado",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return date.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const deliverable = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>

            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(deliverable._id)}
            >
              Copiar ID
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
