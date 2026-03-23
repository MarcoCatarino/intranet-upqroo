import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Building2,
  ChevronLeft,
  Users,
  UserPlus,
  Trash2,
  GraduationCap,
  Upload,
  FileText,
  RefreshCw,
} from "lucide-react";
import { departmentsApi, studentsApi } from "@/services/api";
import { PageHeader } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { EmptyState, Spinner } from "@/components/ui/Badge";
import { toast } from "@/components/ui/Toast";
import { useAuthStore } from "@/store/authStore";
import { cn, formatDateTime } from "@/lib/utils";
import type { Department, Enrollment, User } from "@/types";
import { AddUserDialog } from "@/components/dialogs/AddUserDialog";

export function DepartmentDetailPage() {
  const { departmentId } = useParams<{ departmentId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === "admin";
  const isDirector = currentUser?.role === "director";
  const canManageEnrollments = isAdmin || isDirector;
  const id = Number(departmentId);

  const [dept, setDept] = useState<Department | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [enrollmentTotal, setEnrollmentTotal] = useState(0);
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(false);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);

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

  const loadEnrollments = async () => {
    if (!canManageEnrollments) return;
    setIsLoadingEnrollments(true);
    try {
      const data = await studentsApi.getEnrollments(id);
      setEnrollments(data.enrollments);
      setEnrollmentTotal(data.total);
    } catch {
    } finally {
      setIsLoadingEnrollments(false);
    }
  };

  useEffect(() => {
    load();
    loadEnrollments();
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

  const handleCsvFile = async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "csv") {
      toast.error("Formato incorrecto", "Solo se permiten archivos .csv");
      return;
    }
    if (file.size > 500 * 1024) {
      toast.error("Archivo muy grande", "El CSV no puede superar 500 KB");
      return;
    }

    setIsUploadingCsv(true);
    try {
      const result = await studentsApi.uploadCsv(file, id);
      toast.success(
        "Padrón actualizado",
        `${result.inserted} matrícula${result.inserted !== 1 ? "s" : ""} importada${result.inserted !== 1 ? "s" : ""}${result.skipped > 0 ? ` · ${result.skipped} omitida${result.skipped !== 1 ? "s" : ""}` : ""}`,
      );
      if (result.invalid && result.invalid.length > 0) {
        toast.warning(
          `${result.invalid.length} matrícula${result.invalid.length !== 1 ? "s" : ""} inválida${result.invalid.length !== 1 ? "s" : ""}`,
          result.invalid.slice(0, 5).join(", ") +
            (result.invalid.length > 5 ? "…" : ""),
        );
      }
      loadEnrollments();
    } catch (err) {
      toast.error("Error al importar", (err as Error).message);
    } finally {
      setIsUploadingCsv(false);
      if (csvInputRef.current) csvInputRef.current.value = "";
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

      {/* Info del departamento */}
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

      {/* Miembros del departamento */}
      <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden mb-6">
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

      {/* ── Padrón de alumnos (solo director y admin) ── */}
      {canManageEnrollments && (
        <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--color-surface-border)]">
            <div className="flex items-center gap-2">
              <GraduationCap
                size={16}
                className="text-[var(--color-brand-orange)]"
              />
              <h3 className="font-display text-base text-[var(--color-text-primary)]">
                Padrón de alumnos
              </h3>
              {enrollmentTotal > 0 && (
                <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-surface-secondary)] px-2 py-0.5 rounded-[var(--radius-pill)]">
                  {enrollmentTotal} matrícula{enrollmentTotal !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <button
              onClick={loadEnrollments}
              disabled={isLoadingEnrollments}
              className="p-1.5 rounded text-[var(--color-text-muted)] hover:bg-[var(--color-surface-secondary)] transition-colors"
              title="Actualizar padrón"
            >
              <RefreshCw
                size={13}
                className={isLoadingEnrollments ? "animate-spin" : ""}
              />
            </button>
          </div>

          {/* Zona de upload CSV */}
          <div className="p-5 border-b border-[var(--color-surface-border)]">
            <div
              className={cn(
                "border-2 border-dashed rounded-[var(--radius-lg)] transition-colors",
                "flex flex-col items-center justify-center py-8 px-6 text-center cursor-pointer",
                isDragging
                  ? "border-[var(--color-brand-orange)] bg-orange-50"
                  : "border-[var(--color-surface-border)] hover:border-[var(--color-brand-orange)]/50 hover:bg-[var(--color-surface-secondary)]",
                isUploadingCsv && "pointer-events-none opacity-60",
              )}
              onClick={() => csvInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files[0];
                if (file) handleCsvFile(file);
              }}
            >
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCsvFile(file);
                }}
              />

              {isUploadingCsv ? (
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="md" />
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Importando padrón…
                  </p>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--color-surface-tertiary)] flex items-center justify-center mb-3">
                    <Upload
                      size={18}
                      className="text-[var(--color-text-muted)]"
                    />
                  </div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    Arrastra el CSV aquí o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    Una matrícula por línea · Máx. 500 KB · Solo .csv
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-3 px-4 py-2 bg-[var(--color-surface-secondary)] rounded-[var(--radius-md)]">
                    ⚠️ Subir un CSV nuevo reemplaza el padrón completo del
                    departamento
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Lista del padrón actual */}
          {isLoadingEnrollments ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : enrollments.length === 0 ? (
            <EmptyState
              icon={<FileText size={28} />}
              title="Sin padrón registrado"
              description="Sube un CSV con las matrículas de los alumnos de esta carrera."
            />
          ) : (
            <div>
              <div className="grid grid-cols-[1fr_180px] px-5 py-2.5 bg-[var(--color-surface-secondary)] border-b border-[var(--color-surface-border)]">
                <span className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                  Matrícula
                </span>
                <span className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                  Última actualización
                </span>
              </div>
              <div className="divide-y divide-[var(--color-surface-border)] max-h-72 overflow-y-auto">
                {enrollments.map((e) => (
                  <div
                    key={e.matricula}
                    className="grid grid-cols-[1fr_180px] px-5 py-3 items-center hover:bg-[var(--color-surface-secondary)] transition-colors"
                  >
                    <span className="text-sm font-mono text-[var(--color-text-primary)]">
                      {e.matricula}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {formatDateTime(e.updatedAt).split(",")[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
