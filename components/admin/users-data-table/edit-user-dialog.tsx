"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { User, Mail, Shield, Loader2, Edit } from "lucide-react";
import { User as UserType } from "./columns";

export function EditUserDialog({ user }: { user: UserType }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    active: user.active,
  });

  const router = useRouter();

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSelectChange(value: string) {
    setFormData((prev) => ({
      ...prev,
      role: value,
    }));
  }

  function handleActiveChange(value: string) {
    setFormData((prev) => ({
      ...prev,
      active: value === "true",
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/update/${user._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      const response = await res.json();

      if (!res.ok) {
        setError(response.message || "Error al actualizar usuario");
        return;
      }

      toast.success("Usuario actualizado correctamente");
      router.refresh();
      setOpen(false);
    } catch (error) {
      setError("Error al actualizar usuario");
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <p className="flex gap-1 justify-start items-center text-sm p-1.5 bg-blue-100 rounded-md cursor-default text-blue-600 font mb-1 hover:bg-blue-200">
          Editar
          <span>
            <Edit size={14} />
          </span>
        </p>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Editar usuario
          </DialogTitle>
          <DialogDescription>
            Actualiza la información del usuario en el sistema.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {/* Nombre */}
            <Field>
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nombre
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Juan Pérez"
                required
              />
            </Field>

            {/* Email */}
            <Field>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="juan@example.com"
                required
              />
            </Field>

            {/* Teléfono */}
            <Field>
              <Label htmlFor="phone" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Teléfono
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Ej: +57 310 1234567"
              />
            </Field>

            {/* Rol */}
            <Field className="w-full">
              <Label htmlFor="role" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Rol
              </Label>

              <Select value={formData.role} onValueChange={handleSelectChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>

                <SelectContent position="popper">
                  <SelectGroup>
                    <SelectLabel>Rol</SelectLabel>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="student">Estudiante</SelectItem>
                    <SelectItem value="docent">Docente</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            {/* Estado */}
            <Field className="w-full">
              <Label htmlFor="active" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Estado
              </Label>

              <Select
                value={String(formData.active)}
                onValueChange={handleActiveChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>

                <SelectContent position="popper">
                  <SelectGroup>
                    <SelectLabel>Estado</SelectLabel>
                    <SelectItem value="true">Activo</SelectItem>
                    <SelectItem value="false">Inactivo</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            {/* Error */}
            {error && (
              <div className="rounded bg-red-50 p-2 text-sm text-red-600">
                {error}
              </div>
            )}
          </FieldGroup>

          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button variant="default" disabled={loading}>
                Cancelar
              </Button>
            </DialogClose>

            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Actualizando..." : "Actualizar usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
