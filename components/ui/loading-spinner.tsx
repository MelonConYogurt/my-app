import { Loader2 } from "lucide-react";

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center gap-2">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-sm text-muted-foreground">Cargando...</span>
    </div>
  );
}
