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

// 👇 Importa iconos
import { User, Mail, Lock, Shield, Loader2, PlusCircle } from "lucide-react";

export function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const response = await res.json();

      if (!res.ok) {
        setError(response.message || "Error al crear usuario");
        return;
      }

      toast.success("Usuario creado correctamente");
      router.refresh();

      setFormData({
        name: "",
        email: "",
        password: "",
        role: "",
      });

      setOpen(false);
    } catch (error) {
      setError("Error al crear usuario");
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Crear usuario
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Crear nuevo usuario
          </DialogTitle>
          <DialogDescription>
            Completa los campos para crear un nuevo usuario en el sistema.
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

            {/* Password */}
            <Field>
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Contraseña
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </Field>

            {/* Rol */}
            <Field className="w-full">
              <Label htmlFor="role" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Rol
              </Label>

              <Select
                value={formData.role}
                onValueChange={handleSelectChange}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>

                <SelectContent position="popper">
                  <SelectGroup>
                    <SelectLabel>Rol</SelectLabel>
                    <SelectItem value="admin">🛡️ Administrador</SelectItem>
                    <SelectItem value="student">🎓 Estudiante</SelectItem>
                    <SelectItem value="docent">📘 Docente</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            {/* Error */}
            {error && (
              <div className="rounded bg-red-50 p-2 text-sm text-red-600">
                ⚠️ {error}
              </div>
            )}
          </FieldGroup>

          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button variant="outline" disabled={loading}>
                Cancelar
              </Button>
            </DialogClose>

            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Creando..." : "Crear usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
