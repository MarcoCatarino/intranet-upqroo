import { useState } from "react";
import { departmentsApi } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogFooter } from "@/components/ui/Dialog";
import { Input, Select } from "@/components/ui/Input";
import { toast } from "@/components/ui/Toast";

export function AddUserDialog({
  open,
  onOpenChange,
  departmentId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  departmentId: number;
  onSuccess: () => void;
}) {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("member");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!userId.trim()) return;
    setIsLoading(true);
    try {
      await departmentsApi.addUser({
        departmentId,
        userId: userId.trim(),
        role,
      });
      toast.success("Usuario agregado");
      onSuccess();
      onOpenChange(false);
      setUserId("");
    } catch (err) {
      toast.error("Error", (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Agregar usuario"
      size="sm"
    >
      <div className="space-y-4">
        <Input
          label="ID del usuario (UUID)"
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          hint="Puedes encontrar el ID en la sección de Usuarios"
        />
        <Select
          label="Rol"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          options={[
            { value: "member", label: "Miembro" },
            { value: "coordinator", label: "Coordinador" },
            { value: "director", label: "Director" },
          ]}
        />
      </div>
      <DialogFooter>
        <Button variant="secondary" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          isLoading={isLoading}
          disabled={!userId.trim()}
        >
          Agregar
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
