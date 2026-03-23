import { useEffect, useState } from "react";
import { usersApi, departmentsApi } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogFooter } from "@/components/ui/Dialog";
import { Input, Select } from "@/components/ui/Input";
import { toast } from "@/components/ui/Toast";
import type { Department, UserRole } from "@/types";

const CREATABLE_ROLES: Record<string, { value: UserRole; label: string }[]> = {
  admin: [{ value: "secretary", label: "Secretaría" }],
  secretary: [
    { value: "director", label: "Director" },
    { value: "assistant", label: "Asistente" },
  ],
  director: [{ value: "professor", label: "Profesor" }],
};

export function CreateUserDialog({
  open,
  onOpenChange,
  creatorRole,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  creatorRole: string;
  onSuccess: () => void;
}) {
  const rolesAllowed = CREATABLE_ROLES[creatorRole] ?? [];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>(
    rolesAllowed[0]?.value ?? "professor",
  );
  const [departmentId, setDepartmentId] = useState<string>("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const needsDept =
    role === "director" || role === "assistant" || role === "professor";

  useEffect(() => {
    if (!open) return;
    departmentsApi
      .list()
      .then(setDepartments)
      .catch(() => {});
    setName("");
    setEmail("");
    setRole(rolesAllowed[0]?.value ?? "professor");
    setDepartmentId("");
    setErrors({});
  }, [open]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim() || name.length < 2) errs.name = "Mínimo 2 caracteres";
    if (!email.trim() || !email.endsWith("@upqroo.edu.mx"))
      errs.email = "Debe ser un correo @upqroo.edu.mx";
    if (needsDept && !departmentId)
      errs.departmentId = "Selecciona un departamento";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      await usersApi.create({
        name: name.trim(),
        email: email.trim(),
        role,
        departmentId: needsDept ? Number(departmentId) : undefined,
      });
      toast.success(
        "Usuario registrado",
        `${name} podrá entrar al sistema con su correo institucional`,
      );
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast.error("Error al crear usuario", (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Nuevo usuario"
      description="El usuario podrá iniciar sesión con su correo institucional una vez registrado."
      size="sm"
    >
      <div className="space-y-4">
        <Input
          label="Nombre completo"
          placeholder="Ej. María García López"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <Input
          label="Correo institucional"
          placeholder="nombre@upqroo.edu.mx"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <Select
          label="Rol"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          options={rolesAllowed.map((r) => ({
            value: r.value,
            label: r.label,
          }))}
        />
        {needsDept && (
          <Select
            label="Departamento"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            error={errors.departmentId}
            options={[
              { value: "", label: "Selecciona un departamento…" },
              ...departments.map((d) => ({
                value: String(d.id),
                label: d.name,
              })),
            ]}
          />
        )}
      </div>

      <div className="mt-4 p-3 bg-[var(--color-surface-secondary)] rounded-[var(--radius-md)]">
        <p className="text-xs text-[var(--color-text-muted)]">
          El usuario no recibirá ninguna notificación automática. Deberás
          comunicarle que su acceso ha sido habilitado.
        </p>
      </div>

      <DialogFooter>
        <Button variant="secondary" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} isLoading={isLoading}>
          Crear usuario
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
