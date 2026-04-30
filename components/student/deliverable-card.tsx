import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Upload,
  Download,
} from "lucide-react";
import { UploadDeliverableDialog } from "./upload-deliverable-dialog";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Deliverable {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  status: "pending" | "submitted" | "completed" | "rejected";
  file?: string;
  docentId: {
    name: string;
    email: string;
  };
}

interface DeliverableCardProps {
  deliverable: Deliverable;
  onDeliverableUpdated: () => void;
}

export function DeliverableCard({
  deliverable,
  onDeliverableUpdated,
}: DeliverableCardProps) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "submitted":
        return <FileText className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "rejected":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Completado";
      case "submitted":
        return "Enviado";
      case "pending":
        return "Pendiente";
      case "rejected":
        return "Rechazado";
      default:
        return status;
    }
  };

  const dueDate = new Date(deliverable.dueDate);
  const isOverdue = dueDate < new Date() && deliverable.status === "pending";
  const dueIn = formatDistanceToNow(dueDate, { locale: es });

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">
              {deliverable.title}
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {deliverable.docentId.name}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(deliverable.status)}>
            <span className="flex items-center gap-1">
              {getStatusIcon(deliverable.status)}
              {getStatusLabel(deliverable.status)}
            </span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {deliverable.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <Clock
              className={`w-4 h-4 ${
                isOverdue ? "text-red-600" : "text-muted-foreground"
              }`}
            />
            <span className={isOverdue ? "text-red-600 font-medium" : ""}>
              Vence {dueIn}
            </span>
          </div>

          {deliverable.file && (
            <div className="flex items-center gap-2 text-xs text-green-600">
              <FileText className="w-4 h-4" />
              <span>Archivo adjunto</span>
            </div>
          )}
        </div>
      </CardContent>

      <div className="border-t p-3 mt-auto">
        {deliverable.status === "pending" && (
          <Button
            onClick={() => setIsUploadDialogOpen(true)}
            className="w-full"
            size="sm"
          >
            <Upload className="w-4 h-4 mr-2" />
            Subir entregable
          </Button>
        )}

        {deliverable.status === "submitted" && (
          <Button
            onClick={() => setIsUploadDialogOpen(true)}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <Upload className="w-4 h-4 mr-2" />
            Actualizar entregable
          </Button>
        )}

        {deliverable.status === "completed" && (
          <div className="text-center">
            <p className="text-xs text-green-600 font-medium">✓ Completado</p>
          </div>
        )}

        {deliverable.status === "rejected" && (
          <Button
            onClick={() => setIsUploadDialogOpen(true)}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <Upload className="w-4 h-4 mr-2" />
            Reentregar
          </Button>
        )}
      </div>

      {isUploadDialogOpen && (
        <UploadDeliverableDialog
          deliverable={deliverable}
          isOpen={isUploadDialogOpen}
          onOpenChange={setIsUploadDialogOpen}
          onSuccess={() => {
            setIsUploadDialogOpen(false);
            onDeliverableUpdated();
          }}
        />
      )}
    </Card>
  );
}
