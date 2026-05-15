"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CheckCircle2, Mail, Phone, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialogDeleteUser } from "@/components/admin/users-data-table/delete-dialog";
import { EditUserDialog } from "@/components/admin/users-data-table/edit-user-dialog";

export type User = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  active: boolean;
  role: string;
  CreatedAt: string;
  __v: number;
};

const translateRole = (role: string): string => {
  const roleTranslations: { [key: string]: string } = {
    admin: "Administrador",
    docent: "Docente",
    student: "Estudiante",
  };
  return roleTranslations[role.toLowerCase()] || role;
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "phone",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Teléfono
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "role",
    cell: ({ row }) => translateRole(row.getValue("role")),
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Rol
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "active",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Estado
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const isActive = row.getValue("active") as boolean;

      const statusConfig = {
        active: {
          label: "Activo",
          icon: CheckCircle2,
          iconBg: "bg-emerald-500",
          textColor: "text-white",
        },
        inactive: {
          label: "Inactivo",
          icon: XCircle,
          iconBg: "bg-red-500",
          textColor: "text-white",
        },
      };

      const config = isActive ? statusConfig.active : statusConfig.inactive;
      const Icon = config.icon;

      return (
        <div
          className={`flex gap-2 p-1.5 items-center justify-center rounded-lg text-sm shadow-sm font-medium w-32.5  ${config.iconBg} ${config.textColor}  `}
        >
          {config.label}
          <Icon size={18} />
        </div>
      );
    },
  },
  {
    accessorKey: "CreatedAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha de creación
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("CreatedAt"));
      return date.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    header: "Acciones",
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <div className="flex gap-2">
          <div
            onClick={() => (window.location.href = `mailto:${user.email}`)}
            className="flex gap-2 px-3 py-2 items-center justify-center rounded-lg text-sm shadow-sm text-white font-medium bg-orange-500 cursor-pointer hover:bg-orange-600 transition-colors"
          >
            <Mail size={16} />
            Correo
          </div>
          <div
            onClick={() => (window.location.href = `tel:${user.phone}`)}
            className="flex gap-2 px-3 py-2 items-center justify-center rounded-lg text-sm shadow-sm text-white font-medium bg-green-500 cursor-pointer hover:bg-green-600 transition-colors"
          >
            <Phone size={16} />
            Llamar
          </div>
          <AlertDialogDeleteUser _id={user._id} />

          <EditUserDialog user={user} />
        </div>
      );
    },
  },
];
