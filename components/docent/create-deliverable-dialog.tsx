"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export function CreateDeliverableDialog() {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

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
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (res.ok) {
        const data = await res.json();
        setUsers(data.data);
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

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      userId: value,
    }));
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
      const payload = {
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate,
        userId: formData.userId,
        docentId: session.user.id,
      };

      console.log("Enviando payload:", payload);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/deliverables`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();
      console.log("Respuesta del servidor:", data);

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
      console.error("Error completo:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}> 
      <DialogTrigger asChild>
        <Button className="gap-2" variant={"outline"}>
          <Plus size={18} />
          Crear Entregable
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Entregable</DialogTitle>
          <DialogDescription>
            Completa los siguientes campos para crear un nuevo entregable
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 w-full ">
          <div className="space-y-2 w-full">
            <Label htmlFor="userId">Estudiante</Label>
            <Select
              value={formData.userId}
              onValueChange={handleSelectChange}
              disabled={loadingUsers}
            >
              <SelectTrigger id="userId" className="w-full">
                <SelectValue
                  placeholder={
                    loadingUsers
                      ? "Cargando estudiantes..."
                      : "Selecciona un estudiante"
                  }
                />
              </SelectTrigger>
              <SelectContent position="popper">
                {users.map((user) => (
                  <SelectItem key={user._id} value={user._id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              name="title"
              placeholder="Ej: Proyecto Final"
              value={formData.title}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Ej: Crear un sitio web responsivo"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Fecha de Entrega</Label>
            <Input
              id="dueDate"
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
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Guardando..." : "Crear Entregable"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
