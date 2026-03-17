import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Building2, ChevronLeft, Users, UserPlus, Trash2 } from "lucide-react";
import { departmentsApi } from "@/services/api";
import { PageHeader } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogFooter } from "@/components/ui/Dialog";
import { Input, Select } from "@/components/ui/Input";
import { EmptyState, Spinner } from "@/components/ui/Badge";
import { toast } from "@/components/ui/Toast";
import { useAuthStore } from "@/store/authStore";
import type { Department, User } from "@/types";

export function DepartmentDetailPage() {
  const { departmentId } = useParams<{ departmentId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === "admin";
  const id = Number(departmentId);

  const [dept, setDept] = useState<Department | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const [d, m] = await Promise.all([
        departmentsApi.get(id),
        departmentsApi.users(id),
      ]);
      setDept(d);
      setMembers(m as unknown as User[]);
    } catch {
      toast.error("No se pudo cargar el departamento");
      navigate("/departments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleRemove = async (userId: string) => {
    if (!confirm("¿Quitar este usuario del departamento?")) return;
    try {
      await departmentsApi.removeUser(id, userId);
      toast.success("Usuario eliminado");
      load();
    } catch (err) {
      toast.error("Error", (err as Error).message);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  if (!dept) return null;

  return (
    <div className="p-[var(--content-padding)] max-w-[var(--content-max-width)] animate-fade-in">
      <button
        onClick={() => navigate("/departments")}
        className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] mb-4 transition-colors"
      >
        <ChevronLeft size={14} /> Departamentos
      </button>

      <PageHeader
        title={dept.name}
        description={`Slug: ${dept.slug}`}
        action={
          isAdmin && (
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <UserPlus size={13} /> Agregar usuario
            </Button>
          )
        }
      />

      <div className="flex items-center gap-4 p-5 bg-white rounded-[var(--radius-xl)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] mb-6">
        <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--color-brand-orange)]/10 flex items-center justify-center">
          <Building2 size={24} className="text-[var(--color-brand-orange)]" />
        </div>
        <div>
          <h2 className="font-display text-lg text-[var(--color-text-primary)]">
            {dept.name}
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] font-mono">
            {dept.slug}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
          <Users size={15} />
          {members.length} miembro{members.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[var(--color-surface-border)]">
          <h3 className="font-display text-base text-[var(--color-text-primary)]">
            Miembros
          </h3>
        </div>
        {members.length === 0 ? (
          <EmptyState
            icon={<Users size={32} />}
            title="Sin miembros"
            description={
              isAdmin
                ? "Agrega usuarios con el botón superior."
                : "Este departamento no tiene miembros asignados."
            }
          />
        ) : (
          <div className="divide-y divide-[var(--color-surface-border)]">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 px-5 py-3.5 group hover:bg-[var(--color-surface-secondary)] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--color-brand-orange)]/20 flex items-center justify-center text-[var(--color-brand-orange)] text-sm font-semibold shrink-0">
                  {m.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                    {m.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] truncate">
                    {m.email}
                  </p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleRemove(m.id)}
                    className="p-1.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-status-error)] hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isAdmin && (
        <AddUserDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          departmentId={id}
          onSuccess={load}
        />
      )}
    </div>
  );
}

function AddUserDialog({
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
