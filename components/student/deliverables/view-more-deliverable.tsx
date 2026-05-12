import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  Star,
  Upload,
  User,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export type DeliverableStatus =
  | "pendiente"
  | "entregado"
  | "completado"
  | "rechazado";

export interface Docent {
  _id: string;
  name: string;
  email: string;
}

export interface Deliverable {
  _id?: string;
  title: string;
  description: string;
  dueDate: string;
  userId: string;
  docentId: Docent;
  status?: DeliverableStatus;
  file?: string;
  rubricId?: string;
  rating?: number;
  feedback?: string;
  createdAt?: string;
  updatedAt?: string;
}

const statusConfig = {
  completado: {
    label: "Aprobado",
    badge: "bg-emerald-500 text-white",
    border: "border-t-4 border-emerald-500",
    icon: CheckCircle2,
    iconBg: "bg-emerald-500",
  },
  entregado: {
    label: "En revisión",
    badge: "bg-violet-500 text-white",
    border: "border-t-4 border-violet-500",
    icon: Eye,
    iconBg: "bg-violet-500",
  },
  pendiente: {
    label: "Pendiente",
    badge: "bg-amber-500 text-white",
    border: "border-t-4 border-amber-500",
    icon: Clock3,
    iconBg: "bg-amber-500",
  },
  rechazado: {
    label: "Con correcciones",
    badge: "bg-orange-500 text-white",
    border: "border-t-4 border-orange-500",
    icon: AlertTriangle,
    iconBg: "bg-orange-500",
  },
};

function ViewMoreDeliverable({ data }: { data: Deliverable }) {
  const [file, setFile] = useState<File>();
  const [loading, setLoading] = useState(false);

  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);

  const config = statusConfig[data.status || "pendiente"];
  const { data: session } = useSession();
  const Icon = config.icon;

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  function handleInputFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLoading(true);
    e.preventDefault();
    if (!e.target.files) {
      setLoading(false);
      return;
    }
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setLoading(false);
    }

    console.log(e.target.files[0]);
  }

  async function handleSendDeliverable() {
    try {
      const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

      if (!file) {
        toast.error("No se ha subido un archivo todavia");
        return;
      }

      if (!session) {
        toast.error("Sesión no iniciada");
        return;
      }

      if (!data._id) {
        toast.error("Entregable inválido");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("deliverableId", data._id);

      const uploadRes = await fetch(
        `${NEXT_PUBLIC_API_URL}/deliverables/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!uploadRes.ok) {
        toast.error("Fallo al subir el archivo");
        return;
      }

      const uploadData = await uploadRes.json();
      const fileId = uploadData.fileId;

      const updateRes = await fetch(
        `${NEXT_PUBLIC_API_URL}/deliverables/update/${data._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            file: fileId,
            status: "entregado",
          }),
        },
      );

      if (!updateRes.ok) {
        toast.error("Fallo al actualizar el entregable");
        return;
      }

      toast.success("Entregable enviado correctamente");
      setFile(undefined);
    } catch (error) {
      toast.error(String(error));
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link">
          Ver más <ArrowRight size={18} />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{data.title}</h2>

                <div
                  className={`flex gap-2 px-3 py-2 items-center justify-center rounded-lg text-sm shadow-sm ${config.iconBg} shrink-0 mr-8`}
                >
                  {config.label}
                  <Icon size={18} className="text-white" />
                </div>
              </div>

              <hr />

              <p className="text-sm text-gray-500 font-normal">
                Detalles del entregable
              </p>
            </div>
          </DialogTitle>

          <DialogDescription asChild>
            <div className="flex flex-col gap-6 mt-4 text-sm">
              <div className="space-y-2">
                <p className="font-semibold text-black">Descripción</p>

                <div className="bg-muted rounded-xl p-4 text-muted-foreground leading-relaxed">
                  {data.description}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border rounded-xl p-4">
                  <p className="font-medium text-red-500 mb-3">Fecha límite</p>

                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-muted p-2">
                      <Calendar size={18} />
                    </div>

                    <span className="text-red-500 font-medium">
                      {new Date(data.dueDate).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="border rounded-xl p-4">
                  <p className="font-medium text-yellow-500 mb-3">
                    Calificación
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-muted p-2">
                      <Star size={18} />
                    </div>

                    <span className="font-semibold text-black">
                      {data.rating ? `${data.rating}/5` : "Sin calificar"}
                    </span>
                  </div>
                </div>

                <div className="border rounded-xl p-4">
                  <p className="font-medium text-blue-500 mb-3">Docente</p>

                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-muted p-2">
                      <User size={18} />
                    </div>

                    <span className="font-medium text-black">
                      {data.docentId?.name}
                    </span>
                  </div>
                </div>

                <div className="border rounded-xl p-4">
                  <p className="font-medium text-emerald-500 mb-3">
                    Archivo entregado
                  </p>

                  {data.file ? (
                    <a
                      href={data.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-emerald-600 hover:underline"
                    >
                      <div className="rounded-md bg-muted p-2">
                        <Download size={18} />
                      </div>
                      Descargar archivo
                    </a>
                  ) : (
                    <p className="text-muted-foreground">
                      No hay archivo adjunto
                    </p>
                  )}
                </div>
              </div>

              {data.file ? (
                <div>
                  <Document
                    file={`${process.env.NEXT_PUBLIC_API_URL}/deliverables/download/${data.file}`}
                    onLoadSuccess={onDocumentLoadSuccess}
                  >
                    <Page pageNumber={pageNumber} />
                  </Document>
                  <p>
                    Page {pageNumber} of {numPages}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Subir entrega</Label>

                  <Input
                    type="file"
                    onChange={handleInputFileChange}
                    accept=".pdf"
                  />
                  <Button
                    className="w-full"
                    size={"lg"}
                    disabled={loading}
                    onClick={handleSendDeliverable}
                  >
                    <Upload size={20} />
                    Enviar entregable
                  </Button>
                </div>
              )}

              {data.feedback && (
                <div className="space-y-2">
                  <p className="font-semibold text-black">Retroalimentación</p>

                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-orange-700">
                    {data.feedback}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-muted-foreground border-t pt-4">
                <p>
                  Creado:{" "}
                  {data.createdAt
                    ? new Date(data.createdAt).toLocaleDateString("es-ES")
                    : "N/A"}
                </p>

                <p>
                  Última actualización:{" "}
                  {data.updatedAt
                    ? new Date(data.updatedAt).toLocaleDateString("es-ES")
                    : "N/A"}
                </p>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default ViewMoreDeliverable;
