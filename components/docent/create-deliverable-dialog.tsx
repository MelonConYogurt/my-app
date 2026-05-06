"use client";

import { useState, useEffect } from "react";
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
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    userId: "",
  });

  useEffect(() => {
    if (open) {
      fetchActiveUsers();
    }
  }, [open]);

  const fetchActiveUsers = async () => {
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
  };

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

    console.log("Seleccionado:", option);
  };

  const handleSubmit = async () => {
    if (
      !formData.title ||
      !formData.description ||
      !formData.dueDate ||
      !formData.userId
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
        });
        setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" variant="outline">
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
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancelar
          </Button>

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
