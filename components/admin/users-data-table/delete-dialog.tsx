import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function AlertDialogDeleteUser({ _id }: { _id: string }) {
  const router = useRouter();

  async function deleteUser(_id: string) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/delete/${_id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (res.ok) {
        toast.success("Usuario eliminado correctamente");
        router.refresh();
      }
    } catch (error) {
      toast.error(String(error));
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div className="flex gap-2 justify-start items-center text-sm p-2 bg-red-500 rounded-md cursor-default text-white hover:bg-red-600">
          <Trash size={14} />

          <p>Eliminar</p>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent size="default">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash size={24} />
          </AlertDialogMedia>
          <AlertDialogTitle>
            ¿Estas seguro que deseas eliminar al usuario?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Esto eliminará permanentemente tu
            cuenta de nuestros servidores.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant={"outline"}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant={"destructive"}
            onClick={() => {
              deleteUser(_id);
            }}
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
