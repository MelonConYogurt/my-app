"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    border: " border-emerald-500",
    icon: CheckCircle2,
    iconBg: "bg-emerald-500",
  },
  entregado: {
    label: "En revisión",
    badge: "bg-violet-500 text-white",
    border: " border-violet-500",
    icon: Eye,
    iconBg: "bg-violet-500",
  },
  pendiente: {
    label: "Pendiente",
    badge: "bg-amber-500 text-white",
    border: " border-amber-500",
    icon: Clock3,
    iconBg: "bg-amber-500",
  },
  rechazado: {
    label: "Con correcciones",
    badge: "bg-orange-500 text-white",
    border: " border-orange-500",
    icon: AlertTriangle,
    iconBg: "bg-orange-500",
  },
};

function ViewMoreDeliverable({ data }: { data: Deliverable }) {
  const [file, setFile] = useState<File>();
  const [loading, setLoading] = useState(false);
  const [viewPdf, setViewPdf] = useState(false);

  const config = statusConfig[data.status || "pendiente"];
  const { data: session } = useSession();
  const Icon = config.icon;

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

      <DialogContent
        className={`${viewPdf ? " w-[95vw]! max-w-350! h-[92vh] p-5 flex flex-col" : "max-w-3xl! "}`}
      >
        <DialogHeader>
          <div className={"flex items-start justify-between gap-4"}>
            <div>
              <DialogTitle className="text-2xl font-bold">
                {data.title}
              </DialogTitle>

              <p className="text-sm text-muted-foreground mt-1">
                Detalles del entregable
              </p>
            </div>

            <div
              className={`flex gap-2 px-4 py-2 items-center  text-sm font-medium text-white shadow-sm mr-5 rounded-md ${config.iconBg}`}
            >
              {config.label}
              <Icon size={18} />
            </div>
          </div>
        </DialogHeader>

        <Tabs
          defaultValue="details"
          onValueChange={(value) => setViewPdf(value === "pdf")}
          className="flex-1"
        >
          <div className="border-b py-3 bg-white ">
            <TabsList className="grid w-full  grid-cols-2">
              <TabsTrigger value="details">Detalles</TabsTrigger>

              <TabsTrigger value="pdf" disabled={!data.file}>
                Vista PDF
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="details">
            <div className="space-y-6 max-w-5xl">
              <div className="space-y-2">
                <h3 className="font-semibold text-base">Descripción</h3>

                <div className="bg-muted rounded-md p-5 leading-relaxed text-muted-foreground">
                  {data.description}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="border rounded-md p-5 space-y-4">
                  <p className="font-semibold text-red-500">Fecha límite</p>

                  <div className="flex items-center gap-3">
                    <div className="bg-muted rounded-xl p-3">
                      <Calendar size={20} />
                    </div>

                    <span className="font-medium">
                      {new Date(data.dueDate).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="border rounded-md p-5 space-y-4">
                  <p className="font-semibold text-yellow-500">Calificación</p>

                  <div className="flex items-center gap-3">
                    <div className="bg-muted rounded-xl p-3">
                      <Star size={20} />
                    </div>

                    <span className="font-medium">
                      {data.rating ? `${data.rating}/5` : "Sin calificar"}
                    </span>
                  </div>
                </div>

                <div className="border rounded-md p-5 space-y-4">
                  <p className="font-semibold text-blue-500">Docente</p>

                  <div className="flex items-center gap-3">
                    <div className="bg-muted rounded-xl p-3">
                      <User size={20} />
                    </div>

                    <span className="font-medium">{data.docentId?.name}</span>
                  </div>
                </div>

                <div className="border rounded-md p-5 space-y-4">
                  <p className="font-semibold text-emerald-500">
                    Archivo entregado
                  </p>

                  {data.file ? (
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL}/deliverables/download/${data.file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-emerald-600 hover:underline"
                    >
                      <div className="bg-muted rounded-xl p-3">
                        <Download size={20} />
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

              {!data.file && (
                <div className="space-y-4 border rounded-md p-5">
                  <Label className="text-sm font-semibold">Subir entrega</Label>

                  <Input
                    type="file"
                    onChange={handleInputFileChange}
                    accept=".pdf"
                  />

                  <Button
                    className="w-full"
                    size="lg"
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
                  <h3 className="font-semibold">Retroalimentación</h3>

                  <div className="bg-orange-50 border border-orange-200 rounded-md p-5 text-orange-700">
                    {data.feedback}
                  </div>
                </div>
              )}

              <div className="border-t pt-5 flex flex-col sm:flex-row justify-between text-xs text-muted-foreground">
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
          </TabsContent>

          <TabsContent value="pdf">
            {data.file && (
              <iframe
                src={`${process.env.NEXT_PUBLIC_API_URL}/deliverables/view/${data.file}`}
                className="w-full h-full"
                title="PDF Viewer"
              />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default ViewMoreDeliverable;
