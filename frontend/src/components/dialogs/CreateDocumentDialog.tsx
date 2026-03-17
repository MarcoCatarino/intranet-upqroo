import { useEffect, useState } from "react";
import { Dialog, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { documentsApi, departmentsApi } from "@/services/api";
import { toast } from "@/components/ui/Toast";
import type { Document, Department } from "@/types";

interface CreateDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editDocument?: Document | null;
}

export function CreateDocumentDialog({
  open,
  onOpenChange,
  onSuccess,
  editDocument,
}: CreateDocumentDialogProps) {
  const isEditing = !!editDocument;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    departmentsApi
      .list()
      .then(setDepartments)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (editDocument) {
      setTitle(editDocument.title);
      setDescription(editDocument.description ?? "");
      setDepartmentId(String(editDocument.departmentId));
    } else {
      setTitle("");
      setDescription("");
      setDepartmentId(departments[0] ? String(departments[0].id) : "");
    }
    setErrors({});
  }, [editDocument, open]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim() || title.length < 3)
      errs.title = "El título debe tener al menos 3 caracteres";
    if (!departmentId) errs.departmentId = "Selecciona un departamento";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      if (isEditing) {
        await documentsApi.update(editDocument!.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          departmentId: Number(departmentId),
        });
        toast.success("Documento actualizado");
      } else {
        await documentsApi.create({
          title: title.trim(),
          description: description.trim() || undefined,
          departmentId: Number(departmentId),
        });
        toast.success("Documento creado", "Ahora puedes subir el archivo PDF");
      }
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast.error(
        isEditing ? "Error al actualizar" : "Error al crear",
        (err as Error).message,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar documento" : "Nuevo documento"}
      description={
        isEditing
          ? "Modifica los datos del documento."
          : "Ingresa los datos para registrar el documento."
      }
    >
      <div className="space-y-4">
        <Input
          label="Título"
          placeholder="Ej. Reglamento interno 2025"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
        />
        <Textarea
          label="Descripción (opcional)"
          placeholder="Describe brevemente el contenido del documento…"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Select
          label="Departamento"
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
          error={errors.departmentId}
          options={[
            { value: "", label: "Selecciona un departamento…" },
            ...departments.map((d) => ({ value: d.id, label: d.name })),
          ]}
        />
      </div>
      <DialogFooter>
        <Button variant="secondary" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} isLoading={isLoading}>
          {isEditing ? "Guardar cambios" : "Crear documento"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
