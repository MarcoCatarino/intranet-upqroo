import { useEffect, useState } from "react";
import { Users, Search, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { EmptyState, Spinner } from "@/components/ui/Badge";
import { UserTableRow } from "@/components/sections/users/UserTableRow";
import { toast } from "@/components/ui/Toast";
import { useAuthStore } from "@/store/authStore";
import { CreateUserDialog } from "@/components/dialogs/CreateUserDialog";
import type { User, UserRole } from "@/types";
import { usersApi } from "@/services/api";

const CREATABLE_ROLES: Record<string, { value: UserRole; label: string }[]> = {
  admin: [{ value: "secretary", label: "Secretaría" }],
  secretary: [
    { value: "director", label: "Director" },
    { value: "assistant", label: "Asistente" },
  ],
  director: [
    { value: "professor", label: "Profesor" },
    { value: "employee", label: "Empleado" },
    { value: "assistant", label: "Asistente" },
  ],
};

export function UsersPage() {
  const { user: currentUser } = useAuthStore();
  const creatorRole = currentUser?.role ?? "";

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);

  const canCreate = Object.keys(CREATABLE_ROLES).includes(creatorRole);

  const load = async (p = 1) => {
    setIsLoading(true);
    try {
      const res = await usersApi.list(p);
      setUsers(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
      setPage(p);
    } catch {
      toast.error("Error al cargar usuarios");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        setSearchResults(await usersApi.search(searchQuery));
      } catch {
      } finally {
        setIsSearching(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const displayUsers = searchResults ?? users;

  return (
    <div className="p-[var(--content-padding)] max-w-[var(--content-max-width)] animate-fade-in">
      <PageHeader
        title="Usuarios"
        description={`${total} usuarios registrados en el sistema`}
        action={
          canCreate && (
            <Button onClick={() => setCreateOpen(true)}>
              <UserPlus size={14} /> Nuevo usuario
            </Button>
          )
        }
      />

      <div className="relative mb-6">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
        />
        <input
          type="search"
          placeholder="Buscar por nombre o correo…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-10 pr-4 text-sm rounded-[var(--radius-lg)] border border-[var(--color-surface-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-orange)] focus:border-transparent shadow-[var(--shadow-card)]"
        />
        {isSearching && (
          <Spinner
            size="sm"
            className="absolute right-3 top-1/2 -translate-y-1/2"
          />
        )}
      </div>

      <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="grid grid-cols-[40px_1fr_220px_80px_140px] px-5 py-3 bg-[var(--color-surface-secondary)] border-b border-[var(--color-surface-border)]">
          {["", "Nombre", "Correo", "Rol", "Registro"].map((h) => (
            <span
              key={h}
              className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide"
            >
              {h}
            </span>
          ))}
        </div>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : displayUsers.length === 0 ? (
          <EmptyState icon={<Users size={32} />} title="Sin usuarios" />
        ) : (
          <div className="divide-y divide-[var(--color-surface-border)]">
            {displayUsers.map((u) => (
              <UserTableRow key={u.id} user={u} />
            ))}
          </div>
        )}
      </div>

      {!searchQuery && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-[var(--color-text-muted)]">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => load(page - 1)}
              className="px-3 py-1.5 text-xs rounded-md border border-[var(--color-surface-border)] disabled:opacity-40 hover:bg-[var(--color-surface-secondary)] transition-colors"
            >
              Anterior
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => load(page + 1)}
              className="px-3 py-1.5 text-xs rounded-md border border-[var(--color-surface-border)] disabled:opacity-40 hover:bg-[var(--color-surface-secondary)] transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {canCreate && (
        <CreateUserDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          creatorRole={creatorRole}
          onSuccess={() => load(1)}
        />
      )}
    </div>
  );
}
