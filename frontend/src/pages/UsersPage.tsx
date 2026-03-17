import { useEffect, useState } from "react";
import { Users, Search } from "lucide-react";
import { usersApi } from "@/services/api";
import { PageHeader } from "@/components/layout/AppLayout";
import { EmptyState, Spinner, Badge } from "@/components/ui/Badge";
import { toast } from "@/components/ui/Toast";
import type { User } from "@/types";
import { ROLE_LABELS } from "@/types";
import { formatDateTime } from "@/lib/utils";

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

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
        const res = await usersApi.search(searchQuery);
        setSearchResults(res);
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
              <div
                key={u.id}
                className="grid grid-cols-[40px_1fr_220px_80px_140px] px-5 py-3.5 items-center hover:bg-[var(--color-surface-secondary)] transition-colors"
              >
                <div>
                  {u.avatarUrl ? (
                    <img
                      src={u.avatarUrl}
                      alt={u.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[var(--color-brand-orange)]/20 flex items-center justify-center text-[var(--color-brand-orange)] text-xs font-semibold">
                      {u.name[0]}
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium text-[var(--color-text-primary)]">
                  {u.name}
                </span>
                <span className="text-sm text-[var(--color-text-muted)] truncate">
                  {u.email}
                </span>
                <Badge
                  variant={
                    u.role === "admin"
                      ? "warning"
                      : u.role === "secretary"
                        ? "info"
                        : u.role === "director"
                          ? "orange"
                          : "default"
                  }
                >
                  {ROLE_LABELS[u.role] ?? u.role}
                </Badge>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {u.createdAt
                    ? formatDateTime(u.createdAt).split(",")[0]
                    : "—"}
                </span>
              </div>
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
    </div>
  );
}
