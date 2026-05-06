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
import { useRouter } from "next/navigation";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, Save, X } from "lucide-react";

type RubricCriterion = {
  name: string;
  value: number;
  description: string;
};

type RubricFormData = {
  title: string;
  description: string;
  criterions: RubricCriterion[];
};

export function CreateRubricDialog({ docentId }: { docentId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCriterionFormOpen, setIsCriterionFormOpen] = useState(false);
  const [formData, setFormData] = useState<RubricFormData>({
    title: "",
    description: "",
    criterions: [],
  });

  const [newCriterion, setNewCriterion] = useState<RubricCriterion>({
    name: "",
    value: 0,
    description: "",
  });

  const router = useRouter();

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleCriterionChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setNewCriterion((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function addCriterion() {
    if (!newCriterion.name || !newCriterion.description) {
      toast.error("Completa todos los campos del criterio");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      criterions: [
        ...prev.criterions,
        {
          name: newCriterion.name,
          value: newCriterion.value,
          description: newCriterion.description,
        },
      ],
    }));

    setNewCriterion({
      name: "",
      value: 0,
      description: "",
    });

    handleisCriterionFormOpen();
  }

  function handleisCriterionFormOpen() {
    setIsCriterionFormOpen((prev) => !prev);
  }

  function removeCriterion(index: number) {
    setFormData((prev) => ({
      ...prev,
      criterions: prev.criterions.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    console.log("Se estan enviado los siguiente datos al endpoint: ", formData);

    try {
      if (!formData.title || !formData.description) {
        setError("El título y descripción son obligatorios");
        setLoading(false);
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/rubrics/create/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            docentId: docentId,
            title: formData.title,
            description: formData.description,
            criterions: formData.criterions,
          }),
        },
      );

      const response = await res.json();

      if (!res.ok) {
        setError(response.message || "Error al guardar la rúbrica");
        return;
      }

      toast.success("Rubrica creada");
      router.refresh();

      setFormData({
        title: "",
        description: "",
        criterions: [],
      });

      setNewCriterion({
        name: "",
        value: 0,
        description: "",
      });

      setOpen(false);
    } catch (error) {
      setError("Error al guardar la rúbrica");
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus />
          Crear rúbrica
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear nueva rúbrica</DialogTitle>
          <DialogDescription>
            Completa los campos para crear una nueva rúbrica
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ej: Rúbrica de Calidad de Código"
                required
              />
            </Field>

            <Field>
              <Label htmlFor="description">Descripción</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe los criterios generales de esta rúbrica"
                className="w-full min-h-24 p-2 border border-input rounded-md bg-background"
                required
              />
            </Field>

            <div className="border-t pt-4">
              <Label className="font-semibold mb-4 block">Criterios</Label>

              {formData.criterions.length > 0 && (
                <div className="mb-4 space-y-2">
                  {formData.criterions.map((criterion, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between p-3 border rounded-md bg-muted/50"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{criterion.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {criterion.description}
                        </p>
                        <span className="inline-block mt-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                          Valor: {criterion.value}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCriterion(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {isCriterionFormOpen ? (
                <div className="space-y-3 border p-3 rounded-md bg-muted/30">
                  <div className="flex justify-between items-center ">
                    <p className="text-sm font-medium w-full">
                      Agregar criterio
                    </p>
                    <Button
                      type="button"
                      onClick={handleisCriterionFormOpen}
                      variant="destructive"
                      size="sm"
                    >
                      <X size={16} />
                    </Button>
                  </div>

                  <Field>
                    <Label htmlFor="criterionName" className="text-xs">
                      Nombre del criterio
                    </Label>
                    <Input
                      id="criterionName"
                      value={newCriterion.name}
                      name={"name"}
                      onChange={(e) => handleCriterionChange(e)}
                      placeholder="Ej: Legibilidad"
                    />
                  </Field>

                  <Field>
                    <Label htmlFor="criterionValue" className="text-xs">
                      Valor (puntos)
                    </Label>
                    <Input
                      id="criterionValue"
                      type="number"
                      value={newCriterion.value}
                      name={"value"}
                      onChange={(e) => handleCriterionChange(e)}
                      min="0"
                      max="100"
                    />
                  </Field>

                  <Field>
                    <Label htmlFor="criterionDesc" className="text-xs">
                      Descripción
                    </Label>
                    <textarea
                      id="criterionDesc"
                      value={newCriterion.description}
                      name={"description"}
                      onChange={(e) => handleCriterionChange(e)}
                      placeholder="Describe este criterio"
                      className="w-full min-h-16 p-2 border border-input rounded-md bg-background text-sm"
                    />
                  </Field>

                  <Button
                    type="button"
                    onClick={addCriterion}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Save size={16} className="mr-1" />
                    Guardar criterio
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  onClick={handleisCriterionFormOpen}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Plus size={16} className="mr-1" />
                  Agregar criterio
                </Button>
              )}
            </div>

            {error && (
              <div className="rounded bg-red-50 p-2 text-sm text-red-600">
                {error}
              </div>
            )}
          </FieldGroup>

          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button variant="outline" disabled={loading}>
                Cancelar
              </Button>
            </DialogClose>

            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear rubrica"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
