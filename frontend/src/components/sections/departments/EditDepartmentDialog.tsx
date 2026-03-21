import { useEffect, useState } from "react";
import { Dialog, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { departmentsApi } from "@/services/api";
import { toast } from "@/components/ui/Toast";
import type { Department } from "@/types";

interface EditDepartmentDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  department: Department;
  onSuccess: () => void;
}

export function EditDepartmentDialog({
  open,
  onOpenChange,
  department,
  onSuccess,
}: EditDepartmentDialogProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setName(department.name);
      setSlug(department.slug);
      setErrors({});
    }
  }, [open, department]);

  const handleNameChange = (v: string) => {
    setName(v);
    if (slug === department.slug) {
      setSlug(
        v
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      );
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim() || name.length < 2) errs.name = "Mínimo 2 caracteres";
    if (!slug.trim() || slug.length < 2) errs.slug = "Slug inválido";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    if (name.trim() === department.name && slug.trim() === department.slug) {
      onOpenChange(false);
      return;
    }

    setIsLoading(true);
    try {
      await departmentsApi.update(department.id, {
        name: name.trim(),
        slug: slug.trim(),
      });
      toast.success("Área actualizada");
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast.error("Error al actualizar", (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Editar área"
      description={`Modificando: ${department.name}`}
      size="sm"
    >
      <div className="space-y-4">
        <Input
          label="Nombre"
          placeholder="Ej. Secretaría Académica"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          error={errors.name}
        />
        <Input
          label="Slug (identificador)"
          placeholder="secretaria-academica"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          error={errors.slug}
          hint="Identificador único, sin espacios ni acentos"
        />
      </div>
      <DialogFooter>
        <Button variant="secondary" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} isLoading={isLoading}>
          Guardar cambios
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
