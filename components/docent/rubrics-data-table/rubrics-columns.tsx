"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AlertDialogDeleteRubric } from "@/components/docent/rubrics-data-table/delete-rubric-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export type Rubric = {
  _id: string;
  title: string;
  description: string;
  docentId: string;
  criterions: Array<{
    _id?: string;
    name: string;
    value: number;
    description: string;
  }>;
  createdAt?: string;
};

export const columns: ColumnDef<Rubric>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Titulo
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "description",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Descripcion
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "criterions",
    header: "Criterios",
    cell: ({ row }) => {
      const { criterions } = row.original;

      return (
        <div className="max-w-75">
          <Accordion type="single" collapsible>
            <AccordionItem value="criterions" className="border-none">
              <AccordionTrigger className="py-2 text-sm hover:no-underline">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {criterions.length} criterios
                  </span>
                  <Badge variant="outline">
                    {criterions.reduce((acc, c) => acc + c.value, 0)} pts
                  </Badge>
                </div>
              </AccordionTrigger>

              <AccordionContent className="space-y-2">
                {criterions.map((criterion, index) => (
                  <div key={index} className="rounded-md border-b p-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{criterion.name}</span>
                      <Badge variant="secondary">{criterion.value}</Badge>
                    </div>

                    <p className="text-xs text-muted-foreground mt-1">
                      {criterion.description}
                    </p>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const rubric = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>

            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(rubric._id)}
            >
              Copiar ID
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <AlertDialogDeleteRubric _id={rubric._id} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
