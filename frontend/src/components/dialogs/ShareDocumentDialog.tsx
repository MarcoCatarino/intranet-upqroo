// ShareDocumentDialog.tsx
import { useEffect, useState } from "react";
import { Search, X, UserPlus, Building2, Check, Loader2 } from "lucide-react";
import { Dialog, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { documentsApi, usersApi, departmentsApi } from "@/services/api";
import { toast } from "@/components/ui/Toast";
import { PERMISSION_LABELS, cn } from "@/lib/utils";
import type { User, Department, PermissionType } from "@/types";

type TargetType = "user" | "department";

interface ShareEntry {
  type: TargetType;
  id: string | number; // string para userId, number para departmentId
  name: string;
  permission: PermissionType;
}

interface ShareDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: number;
  documentTitle: string;
  onSuccess?: () => void;
}

const PERMISSION_OPTIONS: PermissionType[] = [
  "view",
  "download",
  "upload_version",
  "edit",
  "share",
];

export function ShareDocumentDialog({
  open,
  onOpenChange,
  documentId,
  documentTitle,
  onSuccess,
}: ShareDocumentDialogProps) {
  const [tab, setTab] = useState<TargetType>("user");
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [entries, setEntries] = useState<ShareEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    if (!open) return;
    setIsLoadingData(true);
    Promise.all([usersApi.list(), departmentsApi.list()])
      .then(([usersRes, depts]) => {
        // usersApi.list devuelve PaginatedResponse<User>
        setUsers(usersRes.data);
        setDepartments(depts);
      })
      .catch(() => {})
      .finally(() => setIsLoadingData(false));
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setEntries([]);
      setTab("user");
    }
  }, [open]);

  const filteredUsers = users.filter(
    (u) =>
      !entries.some((e) => e.type === "user" && e.id === u.id) &&
      (u.name?.toLowerCase().includes(query.toLowerCase()) ||
        u.email?.toLowerCase().includes(query.toLowerCase())),
  );

  const filteredDepts = departments.filter(
    (d) =>
      !entries.some((e) => e.type === "department" && e.id === d.id) &&
      d.name?.toLowerCase().includes(query.toLowerCase()),
  );

  const addEntry = (type: TargetType, id: string | number, name: string) => {
    setEntries((prev) => [...prev, { type, id, name, permission: "view" }]);
    setQuery("");
  };

  const removeEntry = (idx: number) =>
    setEntries((prev) => prev.filter((_, i) => i !== idx));

  const updatePermission = (idx: number, permission: PermissionType) =>
    setEntries((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, permission } : e)),
    );

  // La API recibe una entrada a la vez, así que hacemos un Promise.all
  const handleSave = async () => {
    if (entries.length === 0) return;
    setIsSaving(true);
    try {
      await Promise.all(
        entries.map((entry) =>
          documentsApi.share({
            documentId,
            ...(entry.type === "user"
              ? { userId: entry.id as string }
              : { departmentId: entry.id as number }),
            permission: entry.permission,
          }),
        ),
      );
      toast.success(
        "Permisos guardados",
        `Se compartió con ${entries.length} destinatario${entries.length !== 1 ? "s" : ""}`,
      );
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      toast.error("Error al compartir", (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const suggestions = tab === "user" ? filteredUsers : filteredDepts;
  const showSuggestions = query.trim().length > 0 && suggestions.length > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Compartir documento"
      description={`Otorga acceso a: ${documentTitle}`}
    >
      <div className="space-y-4">
        {/* Tab selector */}
        <div className="flex gap-1 p-1 bg-[var(--color-surface-secondary)] rounded-[var(--radius-lg)]">
          {(["user", "department"] as TargetType[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setQuery("");
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-[var(--radius-md)] transition-all",
                tab === t
                  ? "bg-white shadow-[var(--shadow-card)] text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]",
              )}
            >
              {t === "user" ? <UserPlus size={13} /> : <Building2 size={13} />}
              {t === "user" ? "Usuarios" : "Departamentos"}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative">
          <div className="relative">
            {isLoadingData ? (
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
                tab === "user"
                  ? "Buscar usuario por nombre o email…"
                  : "Buscar departamento…"
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoadingData}
              className="w-full h-9 pl-8 pr-4 text-sm rounded-[var(--radius-lg)] border border-[var(--color-surface-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-orange)] focus:border-transparent disabled:opacity-50"
            />
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[var(--color-surface-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-dropdown)] z-10 overflow-hidden max-h-48 overflow-y-auto">
              {tab === "user"
                ? filteredUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => addEntry("user", u.id, u.name ?? u.email)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left hover:bg-[var(--color-surface-secondary)] transition-colors"
                    >
                      {u.avatarUrl ? (
                        <img
                          src={u.avatarUrl}
                          alt={u.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[var(--color-brand-orange)] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                          {(u.name ?? u.email)?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-[var(--color-text-primary)] truncate">
                          {u.name}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] truncate">
                          {u.email}
                        </p>
                      </div>
                    </button>
                  ))
                : filteredDepts.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => addEntry("department", d.id, d.name)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left hover:bg-[var(--color-surface-secondary)] transition-colors"
                    >
                      <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-blue-100 flex items-center justify-center shrink-0">
                        <Building2 size={13} className="text-blue-500" />
                      </div>
                      <span className="text-[var(--color-text-primary)] truncate">
                        {d.name}
                      </span>
                    </button>
                  ))}
            </div>
          )}
        </div>

        {/* Entries list */}
        {entries.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
              Destinatarios ({entries.length})
            </p>
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {entries.map((entry, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2.5 bg-[var(--color-surface-secondary)] rounded-[var(--radius-md)]"
                >
                  {/* Avatar */}
                  {entry.type === "user" ? (
                    <div className="w-7 h-7 rounded-full bg-[var(--color-brand-orange)] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                      {entry.name[0]?.toUpperCase()}
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-blue-100 flex items-center justify-center shrink-0">
                      <Building2 size={13} className="text-blue-500" />
                    </div>
                  )}

                  {/* Name */}
                  <span className="flex-1 text-sm text-[var(--color-text-primary)] truncate min-w-0">
                    {entry.name}
                  </span>

                  {/* Permission select */}
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

                  {/* Remove */}
                  <button
                    onClick={() => removeEntry(idx)}
                    className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-status-error)] transition-colors shrink-0"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-7 border-2 border-dashed border-[var(--color-surface-border)] rounded-[var(--radius-lg)]">
            <UserPlus
              size={22}
              className="text-[var(--color-text-muted)] mb-2"
            />
            <p className="text-sm text-[var(--color-text-muted)]">
              Busca usuarios o departamentos para compartir
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
