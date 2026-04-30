"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";

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
}

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
      const status = row.getValue("status") as string;

      const colors: Record<string, string> = {
        pendiente: "bg-yellow-100 text-yellow-700",
        entregado: "bg-blue-100 text-blue-700",
        completado: "bg-green-100 text-green-700",
        rechazado: "bg-red-100 text-red-700",
      };

      return (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            colors[status] || "bg-gray-100 text-gray-700"
          }`}
        >
          {status}
        </span>
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

      if (!file) return "—";

      return (
        <a href={file} target="_blank" className="text-blue-600 underline">
          Ver archivo
        </a>
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
