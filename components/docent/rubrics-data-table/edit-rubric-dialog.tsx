"use client";

import { useEffect, useState } from "react";
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

import {
  Plus,
  Trash2,
  Save,
  X,
  AlertCircle,
  Award,
  CheckCircle2,
  ClipboardList,
  ListChecks,
  Loader2,
  Percent,
  PlusCircle,
  Edit,
} from "lucide-react";

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

const emptyCriterion: RubricCriterion = {
  name: "",
  value: 0,
  description: "",
};

export function EditRubricDialog({ rubric }: { rubric: Rubric }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rubricsTotalRating, setRubricsTotalRating] = useState(0);
  const [criterionFormOpen, setCriterionFormOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [currentCriterion, setCurrentCriterion] =
    useState<RubricCriterion>(emptyCriterion);

  const [formData, setFormData] = useState<RubricFormData>({
    title: rubric.title,
    description: rubric.description,
    criterions: rubric.criterions,
  });

  useEffect(() => {
    setRubricsTotalRating(
      formData.criterions.reduce((acc, item) => acc + item.value, 0),
    );
  }, [formData]);

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

    setCurrentCriterion((prev) => ({
      ...prev,
      [name]: name === "value" ? Number(value) : value,
    }));
  }

  function openCreateCriterionForm() {
    setEditingIndex(null);
    setCurrentCriterion(emptyCriterion);
    setCriterionFormOpen(true);
  }

  function closeCriterionForm() {
    setCriterionFormOpen(false);
    setEditingIndex(null);
    setCurrentCriterion(emptyCriterion);
  }

  function handleEditCriterion(index: number) {
    setEditingIndex(index);
    setCurrentCriterion(formData.criterions[index]);
    setCriterionFormOpen(true);
  }

  function saveCriterion() {
    if (
      !currentCriterion.name ||
      !currentCriterion.description ||
      currentCriterion.value <= 0
    ) {
      toast.error("Completa todos los campos del criterio");
      return;
    }

    if (editingIndex !== null) {
      const updatedCriterions = [...formData.criterions];

      updatedCriterions[editingIndex] = currentCriterion;

      setFormData((prev) => ({
        ...prev,
        criterions: updatedCriterions,
      }));

      toast.success("Criterio actualizado");
    } else {
      setFormData((prev) => ({
        ...prev,
        criterions: [...prev.criterions, currentCriterion],
      }));

      toast.success("Criterio agregado");
    }

    closeCriterionForm();
  }

  function removeCriterion(index: number) {
    setFormData((prev) => ({
      ...prev,
      criterions: prev.criterions.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.title) {
        setError("El título es obligatorio");
        return;
      }

      if (!formData.description) {
        setError("La descripción es obligatoria");
        return;
      }

      if (formData.criterions.length <= 0) {
        setError("Debe existir al menos 1 criterio");
        return;
      }

      if (rubricsTotalRating !== 100) {
        setError("La suma total de las rúbricas debe ser 100");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/rubrics/update/${rubric._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            criterions: formData.criterions,
          }),
        },
      );

      const response = await res.json();

      if (!res.ok) {
        setError(response.message || "Error al actualizar la rúbrica");
        return;
      }

      toast.success("Rúbrica actualizada correctamente");

      router.refresh();

      closeCriterionForm();

      setOpen(false);
    } catch (error) {
      console.log(error);

      setError("Error al actualizar la rúbrica");
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

      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Editar rúbrica
          </DialogTitle>

          <DialogDescription>
            Actualiza los campos de la rúbrica
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
                placeholder="Ej: Rúbrica de calidad"
              />
            </Field>

            <Field>
              <Label htmlFor="description">Descripción</Label>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descripción de la rúbrica"
                className="w-full min-h-24 p-2 border border-input rounded-md bg-background"
              />
            </Field>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="font-semibold flex items-center gap-2">
                  <ListChecks className="h-4 w-4" />
                  Criterios
                </Label>

                <p
                  className={`text-sm font-medium flex items-center gap-1 ${
                    rubricsTotalRating !== 100
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  <Percent className="h-4 w-4" />
                  Peso total: {rubricsTotalRating}%
                </p>
              </div>

              {formData.criterions.length > 0 && (
                <div className="mt-4 space-y-2">
                  {formData.criterions.map((criterion, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between p-3 border rounded-md bg-muted/50"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          {criterion.name}
                        </p>

                        <p className="text-xs text-muted-foreground mt-1">
                          {criterion.description}
                        </p>

                        <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                          <Award className="h-3 w-3" />
                          Valor: {criterion.value}%
                        </span>
                      </div>

                      <div className="flex items-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCriterion(index)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit size={16} />
                        </Button>

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
                    </div>
                  ))}
                </div>
              )}

              {criterionFormOpen ? (
                <div className="space-y-3 border p-4 rounded-md bg-muted/30 mt-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <PlusCircle className="h-4 w-4" />

                      {editingIndex !== null
                        ? "Editar criterio"
                        : "Agregar criterio"}
                    </p>

                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={closeCriterionForm}
                    >
                      <X size={16} />
                    </Button>
                  </div>

                  <Field>
                    <Label htmlFor="criterionName">Nombre del criterio</Label>

                    <Input
                      id="criterionName"
                      name="name"
                      value={currentCriterion.name}
                      onChange={handleCriterionChange}
                      placeholder="Ej: Legibilidad"
                    />
                  </Field>

                  <Field>
                    <Label htmlFor="criterionValue">Valor del criterio</Label>

                    <Input
                      id="criterionValue"
                      type="number"
                      name="value"
                      value={currentCriterion.value}
                      onChange={handleCriterionChange}
                      min={0}
                      max={100}
                    />
                  </Field>

                  <Field>
                    <Label htmlFor="criterionDescription">Descripción</Label>

                    <textarea
                      id="criterionDescription"
                      name="description"
                      value={currentCriterion.description}
                      onChange={handleCriterionChange}
                      placeholder="Describe este criterio"
                      className="w-full min-h-16 p-2 border border-input rounded-md bg-background text-sm"
                    />
                  </Field>

                  <Button
                    type="button"
                    onClick={saveCriterion}
                    variant="default"
                    className="w-full gap-2"
                  >
                    <Save size={16} />

                    {editingIndex !== null
                      ? "Guardar cambios"
                      : "Agregar criterio"}
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="default"
                  className="w-full mt-4 gap-2"
                  onClick={openCreateCriterionForm}
                >
                  <Plus size={16} />
                  Agregar criterio
                </Button>
              )}
            </div>

            {error && (
              <div className="rounded bg-red-50 p-3 text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
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

            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}

              {loading ? "Actualizando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
