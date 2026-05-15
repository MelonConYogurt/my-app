"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Star, FileText, CircleCheckBig } from "lucide-react";

export type DeliverableCommentAuthor =
  | string
  | {
      _id: string;
      name: string;
    };

export type DeliverableComment = {
  authorId: DeliverableCommentAuthor;
  role: "student" | "docent";
  message: string;
  createdAt: string;
};

export type RateDeliverable = {
  _id: string;
  title: string;
  description: string;
  rubricId?: string;
  rating?: number;
  feedback?: string;
  comments?: DeliverableComment[];
};

type RubricCriterion = {
  _id?: string;
  name: string;
  value: number;
  description: string;
};

export type Rubric = {
  _id: string;
  title: string;
  description: string;
  criterions: RubricCriterion[];
};

interface RateDeliverableDialogProps {
  deliverable: RateDeliverable;
  children?: ReactNode;
}

export function RateDeliverableDialog({
  deliverable,
}: RateDeliverableDialogProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rubric, setRubric] = useState<Rubric | null>(null);
  const [loadingRubric, setLoadingRubric] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(deliverable.feedback || "");
  const [comment, setComment] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});

  useEffect(() => {
    setFeedback(deliverable.feedback || "");
    setComment("");
  }, [deliverable.feedback]);

  useEffect(() => {
    const fetchRubric = async () => {
      if (!deliverable.rubricId) {
        setRubric(null);
        return;
      }

      setLoadingRubric(true);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/rubrics?_id=${deliverable.rubricId}`,
        );
        const data = (await response.json()) as { data: Rubric[] };

        if (response.ok && Array.isArray(data.data) && data.data.length > 0) {
          const rubricData = data.data[0];
          setRubric(rubricData);
          const initialScores: Record<string, number> = {};
          rubricData.criterions.forEach((criterion, index) => {
            initialScores[`criterion-${index}`] = 0;
          });
          setScores(initialScores);
        } else {
          setRubric(null);
        }
      } catch (error) {
        console.error("Error fetching rubric:", error);
        setRubric(null);
      } finally {
        setLoadingRubric(false);
      }
    };

    fetchRubric();
  }, [deliverable.rubricId]);

  const totalRating = useMemo(() => {
    if (!rubric) {
      return 0;
    }

    const weighted = rubric.criterions.reduce((acc, criterion, index) => {
      const score = scores[`criterion-${index}`] ?? 0;
      return acc + (score * criterion.value) / 100;
    }, 0);

    return Number(weighted.toFixed(2));
  }, [rubric, scores]);

  const handleScoreChange = (index: number, value: number | "") => {
    setScores((prev) => ({
      ...prev,
      [`criterion-${index}`]: typeof value === "number" ? value : 0,
    }));
  };

  const handleSubmit = async () => {
    if (!rubric) {
      toast.error("No se pudo cargar la rúbrica para este entregable.");
      return;
    }

    if (!session?.user?.id) {
      toast.error("No se pudo obtener el usuario de sesión.");
      return;
    }

    setSubmitting(true);

    try {
      const newComment = comment.trim()
        ? {
            authorId: session.user.id,
            role: "docent" as const,
            message: comment.trim(),
            createdAt: new Date().toISOString(),
          }
        : null;

      const updatedComments = newComment
        ? [...(deliverable.comments ?? []), newComment]
        : (deliverable.comments ?? []);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/deliverables/update/${deliverable._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rating: totalRating,
            status: "completado",
            feedback,
            comments: updatedComments,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Error al guardar la calificación");
        return;
      }

      toast.success("Entregable calificado correctamente");
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Error al calificar el entregable.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center gap-2 border border-blue-500 bg-blue-500 text-white p-2 rounded-md cursor-pointer ">
          <p className="font-medium">Calificar</p>
          <CircleCheckBig size={20} />
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" /> Calificar entregable
          </DialogTitle>
          <DialogDescription>
            Asigna una nota a cada criterio y envía retroalimentación y
            comentarios.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-900">
              {deliverable.title}
            </h3>
            <p className="text-sm text-slate-600">{deliverable.description}</p>
          </div>

          {loadingRubric ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin h-6 w-6 text-slate-500" />
            </div>
          ) : rubric ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Rúbrica: {rubric.title}
                    </p>
                    <p className="text-sm text-slate-600">
                      {rubric.description}
                    </p>
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                    Total {totalRating}/5
                  </div>
                </div>

                <div className="space-y-4">
                  {rubric.criterions.map((criterion, index) => (
                    <div
                      key={`${criterion.name}-${index}`}
                      className="rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {criterion.name}
                          </p>
                          <p className="text-sm text-slate-600">
                            {criterion.description}
                          </p>
                        </div>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                          {criterion.value}%
                        </span>
                      </div>

                      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
                        <div className="space-y-1">
                          <Label htmlFor={`score-${index}`}>Nota 0-5</Label>
                          <Input
                            id={`score-${index}`}
                            type="number"
                            min={0}
                            max={5}
                            step={0.5}
                            value={scores[`criterion-${index}`] ?? 0}
                            onChange={(event) =>
                              handleScoreChange(
                                index,
                                Number(event.target.value),
                              )
                            }
                          />
                        </div>
                        <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                          Equivale a{" "}
                          {((scores[`criterion-${index}`] ?? 0) *
                            criterion.value) /
                            100}{" "}
                          puntos
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="feedback">Feedback general</Label>
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(event) => setFeedback(event.target.value)}
                    placeholder="Escribe el feedback para el entregable"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comment">Comentario docente</Label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="Escribe un comentario adicional"
                    rows={4}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              No se encontró la rúbrica asociada al entregable. Verifica que el
              entregable tenga un rubricId válido.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !rubric}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando
              </>
            ) : (
              <>
                <Star className="mr-2 h-4 w-4" /> Guardar calificación
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
