import { useEffect, useState } from "react";
import {
  Search,
  X,
  Building2,
  Check,
  Loader2,
  Users,
  GraduationCap,
  User,
} from "lucide-react";
import { Dialog, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { documentsApi, departmentsApi, usersApi } from "@/services/api";
import { toast } from "@/components/ui/Toast";
import { PERMISSION_LABELS, cn } from "@/lib/utils";
import { TARGET_AUDIENCE_LABELS } from "@/types";
import type { Department, PermissionType, TargetAudience } from "@/types";

// ── Tipos internos ─────────────────────────────────────────────────────────────

interface DeptEntry {
  kind: "department";
  departmentId: number;
  name: string;
  permission: PermissionType;
  targetAudience: TargetAudience;
}

interface UserEntry {
  kind: "user";
  userId: string;
  name: string;
  email: string;
  permission: PermissionType;
}

type ShareEntry = DeptEntry | UserEntry;

// ── Constantes ─────────────────────────────────────────────────────────────────

const PERMISSION_OPTIONS: PermissionType[] = [
  "view",
  "download",
  "upload_version",
  "edit",
  "share",
];

const AUDIENCE_OPTIONS: {
  value: TargetAudience;
  label: string;
  icon: React.ElementType;
  description: string;
}[] = [
  {
    value: "all",
    label: "Todos",
    icon: Users,
    description: "Profesores y alumnos",
  },
  {
    value: "professors",
    label: "Profesores",
    icon: Users,
    description: "Solo profesores",
  },
  {
    value: "students",
    label: "Alumnos",
    icon: GraduationCap,
    description: "Solo del padrón",
  },
];

// ── Props ──────────────────────────────────────────────────────────────────────

interface ShareDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: number;
  documentTitle: string;
  onSuccess?: () => void;
}

// ── Componente ─────────────────────────────────────────────────────────────────

export function ShareDocumentDialog({
  open,
  onOpenChange,
  documentId,
  documentTitle,
  onSuccess,
}: ShareDocumentDialogProps) {
  // Tab activa: "department" | "user"
  const [tab, setTab] = useState<"department" | "user">("department");

  // Búsqueda y datos
  const [query, setQuery] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [userResults, setUserResults] = useState<
    { id: string; name: string; email: string }[]
  >([]);
  const [isLoadingDepts, setIsLoadingDepts] = useState(false);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

  // Entradas seleccionadas (mezcla de dept y user)
  const [entries, setEntries] = useState<ShareEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // ── Carga inicial de departamentos ─────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    setIsLoadingDepts(true);
    departmentsApi
      .list()
      .then(setDepartments)
      .catch(() => {})
      .finally(() => setIsLoadingDepts(false));
  }, [open]);

  // ── Reset al cerrar ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) {
      setQuery("");
      setEntries([]);
      setUserResults([]);
      setTab("department");
    }
  }, [open]);

  // ── Búsqueda de usuarios con debounce ──────────────────────────────────────
  useEffect(() => {
    if (tab !== "user" || query.trim().length < 2) {
      setUserResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingUsers(true);
      try {
        const results = await usersApi.search(query);
        // Excluir usuarios que ya están en la lista
        const addedUserIds = new Set(
          entries
            .filter((e): e is UserEntry => e.kind === "user")
            .map((e) => e.userId),
        );
        setUserResults(results.filter((u) => !addedUserIds.has(u.id)));
      } catch {
        setUserResults([]);
      } finally {
        setIsSearchingUsers(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query, tab]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const addedDeptIds = new Set(
    entries
      .filter((e): e is DeptEntry => e.kind === "department")
      .map((e) => e.departmentId),
  );

  const filteredDepts = departments.filter(
    (d) =>
      !addedDeptIds.has(d.id) &&
      d.name?.toLowerCase().includes(query.toLowerCase()),
  );

  const addDept = (dept: Department) => {
    setEntries((prev) => [
      ...prev,
      {
        kind: "department",
        departmentId: dept.id,
        name: dept.name,
        permission: "view",
        targetAudience: "all",
      },
    ]);
    setQuery("");
  };

  const addUser = (u: { id: string; name: string; email: string }) => {
    setEntries((prev) => [
      ...prev,
      {
        kind: "user",
        userId: u.id,
        name: u.name,
        email: u.email,
        permission: "view",
      },
    ]);
    setQuery("");
    setUserResults([]);
  };

  const removeEntry = (idx: number) =>
    setEntries((prev) => prev.filter((_, i) => i !== idx));

  const updatePermission = (idx: number, permission: PermissionType) =>
    setEntries((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, permission } : e)),
    );

  const updateAudience = (idx: number, targetAudience: TargetAudience) =>
    setEntries((prev) =>
      prev.map((e, i) =>
        i === idx && prev[i].kind === "department"
          ? { ...e, targetAudience }
          : e,
      ),
    );

  // ── Guardar ────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (entries.length === 0) return;
    setIsSaving(true);
    try {
      await Promise.all(
        entries.map((entry) => {
          if (entry.kind === "department") {
            return documentsApi.share({
              documentId,
              departmentId: entry.departmentId,
              permission: entry.permission,
              targetAudience: entry.targetAudience,
            });
          } else {
            return documentsApi.share({
              documentId,
              userId: entry.userId,
              permission: entry.permission,
            });
          }
        }),
      );
      toast.success(
        "Permisos guardados",
        `Compartido con ${entries.length} destinatario${entries.length !== 1 ? "s" : ""}`,
      );
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      toast.error("Error al compartir", (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const showDeptSuggestions =
    tab === "department" && query.trim().length > 0 && filteredDepts.length > 0;

  const showUserSuggestions =
    tab === "user" && query.trim().length >= 2 && userResults.length > 0;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Compartir documento"
      description={`Otorga acceso a personas o departamentos: ${documentTitle}`}
      size="lg"
    >
      <div className="space-y-4">
        {/* ── Tabs ── */}
        <div className="flex gap-0.5 border-b border-[var(--color-surface-border)]">
          {(
            [
              { id: "department", icon: Building2, label: "Departamento" },
              { id: "user", icon: User, label: "Persona específica" },
            ] as const
          ).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => {
                setTab(id);
                setQuery("");
                setUserResults([]);
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
                tab === id
                  ? "border-[var(--color-brand-orange)] text-[var(--color-brand-orange)]"
                  : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]",
              )}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* ── Buscador ── */}
        <div className="relative">
          <div className="relative">
            {isLoadingDepts || isSearchingUsers ? (
              <Loader2
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] animate-spin"
              />
            ) : (
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
              />
            )}
            <input
              type="text"
              placeholder={
                tab === "department"
                  ? "Buscar departamento…"
                  : "Buscar por nombre o correo…"
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-9 pl-8 pr-4 text-sm rounded-[var(--radius-lg)] border border-[var(--color-surface-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-orange)] focus:border-transparent"
            />
          </div>

          {/* Sugerencias de departamentos */}
          {showDeptSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[var(--color-surface-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-dropdown)] z-10 overflow-hidden max-h-48 overflow-y-auto">
              {filteredDepts.map((d) => (
                <button
                  key={d.id}
                  onClick={() => addDept(d)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left hover:bg-[var(--color-surface-secondary)] transition-colors"
                >
                  <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-blue-100 flex items-center justify-center shrink-0">
                    <Building2 size={13} className="text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[var(--color-text-primary)] truncate">
                      {d.name}
                    </p>
                    {d.parentId && (
                      <p className="text-[10px] text-[var(--color-text-muted)] truncate">
                        {departments.find((p) => p.id === d.parentId)?.name}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Sugerencias de usuarios */}
          {showUserSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[var(--color-surface-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-dropdown)] z-10 overflow-hidden max-h-48 overflow-y-auto">
              {userResults.map((u) => (
                <button
                  key={u.id}
                  onClick={() => addUser(u)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left hover:bg-[var(--color-surface-secondary)] transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-[var(--color-brand-orange)]/20 flex items-center justify-center shrink-0 text-[var(--color-brand-orange)] text-xs font-semibold">
                    {u.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[var(--color-text-primary)] truncate font-medium">
                      {u.name}
                    </p>
                    <p className="text-[10px] text-[var(--color-text-muted)] truncate">
                      {u.email}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Sin resultados de usuarios */}
          {tab === "user" &&
            query.trim().length >= 2 &&
            !isSearchingUsers &&
            userResults.length === 0 && (
              <p className="mt-1.5 text-xs text-[var(--color-text-muted)] pl-1">
                Sin resultados para "{query}"
              </p>
            )}
        </div>

        {/* ── Lista de entradas seleccionadas ── */}
        {entries.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
              Destinatarios ({entries.length})
            </p>
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {entries.map((entry, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[var(--color-surface-secondary)] rounded-[var(--radius-lg)] space-y-3"
                >
                  {/* Cabecera de la entrada */}
                  <div className="flex items-center gap-3">
                    {entry.kind === "department" ? (
                      <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-blue-100 flex items-center justify-center shrink-0">
                        <Building2 size={13} className="text-blue-500" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[var(--color-brand-orange)]/20 flex items-center justify-center shrink-0 text-[var(--color-brand-orange)] text-xs font-semibold">
                        {entry.name[0]}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                        {entry.name}
                      </p>
                      {entry.kind === "user" && (
                        <p className="text-[10px] text-[var(--color-text-muted)] truncate">
                          {entry.email}
                        </p>
                      )}
                    </div>

                    {/* Selector de permiso */}
                    <select
                      value={entry.permission}
                      onChange={(e) =>
                        updatePermission(idx, e.target.value as PermissionType)
                      }
                      className="text-xs border border-[var(--color-surface-border)] rounded-[var(--radius-md)] px-2 py-1 bg-white text-[var(--color-text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-orange)] shrink-0"
                    >
                      {PERMISSION_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {PERMISSION_LABELS[p] ?? p}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => removeEntry(idx)}
                      className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-status-error)] transition-colors shrink-0"
                    >
                      <X size={13} />
                    </button>
                  </div>

                  {/* Selector de audiencia — solo para departamentos */}
                  {entry.kind === "department" && (
                    <div>
                      <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-1.5">
                        Dirigido a
                      </p>
                      <div className="flex gap-1.5">
                        {AUDIENCE_OPTIONS.map((opt) => {
                          const isSelected = entry.targetAudience === opt.value;
                          return (
                            <button
                              key={opt.value}
                              onClick={() => updateAudience(idx, opt.value)}
                              className={cn(
                                "flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-[var(--radius-md)] border text-xs transition-all",
                                isSelected
                                  ? "border-[var(--color-brand-orange)] bg-orange-50 text-[var(--color-brand-orange-dark)]"
                                  : "border-[var(--color-surface-border)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-brand-orange)]/50 hover:text-[var(--color-text-secondary)]",
                              )}
                            >
                              <opt.icon size={13} />
                              <span className="font-medium leading-tight">
                                {opt.label}
                              </span>
                              <span className="text-[10px] leading-tight opacity-70">
                                {opt.description}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-7 border-2 border-dashed border-[var(--color-surface-border)] rounded-[var(--radius-lg)]">
            {tab === "department" ? (
              <Building2
                size={22}
                className="text-[var(--color-text-muted)] mb-2"
              />
            ) : (
              <User size={22} className="text-[var(--color-text-muted)] mb-2" />
            )}
            <p className="text-sm text-[var(--color-text-muted)]">
              {tab === "department"
                ? "Busca departamentos para compartir"
                : "Busca por nombre o correo institucional"}
            </p>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="secondary" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={entries.length === 0}
          isLoading={isSaving}
        >
          <Check size={14} />
          Compartir{entries.length > 0 ? ` (${entries.length})` : ""}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
