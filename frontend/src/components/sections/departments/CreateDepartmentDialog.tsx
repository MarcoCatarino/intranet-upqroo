import { useState } from "react";
import { Dialog, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { departmentsApi } from "@/services/api";
import { toast } from "@/components/ui/Toast";
import type { Department } from "@/types";

interface CreateDepartmentDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  departments: Department[];
  onSuccess: () => void;
}

export function CreateDepartmentDialog({
  open,
  onOpenChange,
  departments,
  onSuccess,
}: CreateDepartmentDialogProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNameChange = (v: string) => {
    setName(v);
    setSlug(
      v
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    );
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
    setIsLoading(true);
    try {
      await departmentsApi.create({
        name: name.trim(),
        slug: slug.trim(),
        parentId: parentId ? Number(parentId) : undefined,
      });
      toast.success("Área creada");
      onSuccess();
      onOpenChange(false);
      setName("");
      setSlug("");
      setParentId("");
    } catch (err) {
      toast.error("Error al crear", (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const parentOptions = [
    { value: "", label: "Sin dependencia (Secretaría / área raíz)" },
    ...departments
      .filter((d) => !d.parentId)
      .map((d) => ({ value: String(d.id), label: d.name })),
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Nueva área"
      description="Crea una Secretaría o un Departamento dependiente."
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
        <Select
          label="Dependencia (opcional)"
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          options={parentOptions}
          hint="Si es un departamento, selecciona su Secretaría"
        />
      </div>
      <DialogFooter>
        <Button variant="secondary" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} isLoading={isLoading}>
          Crear
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
