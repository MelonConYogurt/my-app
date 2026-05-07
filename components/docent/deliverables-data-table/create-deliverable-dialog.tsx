"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  User,
  FileText,
  AlignLeft,
  Calendar,
  Loader2,
} from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Select, { SingleValue } from "react-select";
import { Textarea } from "@/components/ui/textarea";
import { Rubric } from "../rubrics-data-table/edit-rubric-dialog";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Option {
  label: string;
  value: string;
}

export function CreateDeliverableDialog() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingRubrics, setLoadingRubrics] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);
  const [rubricOptions, setRubricOptions] = useState<Option[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    userId: "",
    rubricId: "",
  });

  const fetchActiveUsers = useCallback(async () => {
    setLoadingUsers(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users?active=true&role=student`,
      );

      if (res.ok) {
        const data = await res.json();

        const options = data.data.map((user: User) => ({
          label: user.name,
          value: user._id,
        }));

        setOptions(options);
      } else {
        toast.error("Error al cargar usuarios");
      }
    } catch (error) {
      toast.error("Error al cargar usuarios");
      console.error(error);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const fetchRubrics = useCallback(async () => {
    setLoadingRubrics(true);

    try {
      if (!session?.user?.id) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/rubrics?docentId=${session.user.id}`,
      );

      if (res.ok) {
        const data = await res.json();

        const options = data.data.map((rubric: Rubric) => ({
          label: rubric.title,
          value: rubric._id,
        }));

        setRubricOptions(options);
      } else {
        toast.error("Error al cargar rúbricas");
      }
    } catch (error) {
      toast.error("Error al cargar rúbricas");
      console.error(error);
    } finally {
      setLoadingRubrics(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchActiveUsers();
    fetchRubrics();
  }, [fetchActiveUsers, fetchRubrics]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (option: SingleValue<Option>) => {
    if (option) {
      setFormData((prev) => ({ ...prev, userId: option.value }));
    }
  };

  const handleRubricSelectChange = (option: SingleValue<Option>) => {
    if (option) {
      setFormData((prev) => ({ ...prev, rubricId: option.value }));
    }
  };

  const handleSubmit = async () => {
    if (
      !formData.title ||
      !formData.description ||
      !formData.dueDate ||
      !formData.userId ||
      !formData.rubricId
    ) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    if (!session?.user?.id) {
      toast.error("Error: No se pudo obtener tu ID de sesión");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/deliverables`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            docentId: session.user.id,
          }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("Entregable creado correctamente");
        setFormData({
          title: "",
          description: "",
          dueDate: "",
          userId: "",
          rubricId: "",
        });
        router.refresh();
      } else {
        toast.error(data.message || "Error al crear entregable");
      }
    } catch (error) {
      toast.error(String(error));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2" variant="default">
          <Plus size={18} />
          Crear Entregable
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Crear Nuevo Entregable
          </DialogTitle>
          <DialogDescription>
            Completa los siguientes campos para crear un nuevo entregable
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 w-full">
          <div className="space-y-2 w-full">
            <Label htmlFor="userId" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Estudiante
            </Label>
            <Select
              styles={{
                control: (baseStyles) => ({
                  ...baseStyles,
                  borderRadius: "0.5rem",
                }),
              }}
              onChange={handleSelectChange}
              options={options}
              isDisabled={loadingUsers}
            />
          </div>

          <div className="space-y-2 w-full">
            <Label htmlFor="rubricId" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Rúbrica
            </Label>
            <Select
              styles={{
                control: (baseStyles) => ({
                  ...baseStyles,
                  borderRadius: "0.5rem",
                }),
              }}
              onChange={handleRubricSelectChange}
              options={rubricOptions}
              isDisabled={loadingRubrics}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Título
            </Label>
            <Input
              name="title"
              placeholder="Ej: Proyecto Final"
              value={formData.title}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <AlignLeft className="h-4 w-4" />
              Descripción
            </Label>
            <Textarea
              name="description"
              placeholder="Ej: Crear un sitio web responsivo"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fecha de Entrega
            </Label>
            <Input
              name="dueDate"
              type="datetime-local"
              value={formData.dueDate}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Guardando..." : "Crear Entregable"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
