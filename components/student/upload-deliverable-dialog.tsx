"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Upload, FileText, X, Loader2 } from "lucide-react";

interface Deliverable {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  status: "pending" | "submitted" | "completed" | "rejected";
  file?: string;
}

interface UploadDeliverableDialogProps {
  deliverable: Deliverable;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function UploadDeliverableDialog({
  deliverable,
  isOpen,
  onOpenChange,
  onSuccess,
}: UploadDeliverableDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validar tamaño (máx 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("El archivo no puede superar 10MB");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Por favor selecciona un archivo");
      return;
    }

    try {
      setUploading(true);

      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append("file", file);
      formData.append("deliverableId", deliverable._id);

      // Subir el archivo
      const uploadRes = await fetch("/api/upload-deliverable", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const error = await uploadRes.json();
        toast.error(error.message || "Error al subir el archivo");
        return;
      }

      const { fileId } = await uploadRes.json();

      // Actualizar el entregable con el ID del archivo
      const updateRes = await fetch(
        `${NEXT_PUBLIC_API_URL}/deliverables/update/${deliverable._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            file: fileId,
            status: "submitted",
          }),
        },
      );

      if (!updateRes.ok) {
        toast.error("Error al actualizar el entregable");
        return;
      }

      toast.success("Entregable subido correctamente");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Error al subir el archivo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Subir entregable</DialogTitle>
          <DialogDescription className="text-xs">
            {deliverable.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Área de selección de archivo */}
          <div
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add("bg-muted");
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove("bg-muted");
            }}
            onDrop={(e) => {
              e.preventDefault();
              const droppedFile = e.dataTransfer.files?.[0];
              if (droppedFile) {
                handleFileChange({
                  target: { files: e.dataTransfer.files },
                } as any);
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.zip"
            />

            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-sm">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="ml-auto p-1 hover:bg-muted-foreground/10 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">Arrastra tu archivo aquí</p>
                <p className="text-xs text-muted-foreground">
                  o haz clic para seleccionar
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Máximo 10MB. PDF, DOC, XLS, PPT, JPG, PNG, ZIP
                </p>
              </div>
            )}
          </div>

          {/* Nota de entrega */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
            <p className="text-xs text-blue-900 dark:text-blue-100">
              <span className="font-semibold">Nota:</span> Asegúrate de que tu
              archivo sea correcto antes de enviarlo. No podrás editarlo después
              de la entrega.
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={uploading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="gap-2"
          >
            {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
            {uploading ? "Subiendo..." : "Subir"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
