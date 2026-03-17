import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  FileText,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Upload,
  Share2,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { PageHeader } from "@/components/layout/AppLayout";
import {
  formatDateTime,
  canUploadDocuments,
  canShareDocuments,
} from "@/lib/utils";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import type { Document } from "@/types";
import { useDocumentsStore } from "@/store/documentsStore";
import { useAuthStore } from "@/store/authStore";
import { documentsApi } from "@/services/api";
import { toast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Badge, EmptyState, Spinner } from "@/components/ui/Badge";
import { UploadFileDialog } from "@/components/dialogs/UploadFileDialog";
import { CreateDocumentDialog } from "@/components/dialogs/CreateDocumentDialog";
import { ShareDocumentDialog } from "@/components/dialogs/ShareDocumentDialog";

export function DocumentsPage() {
  const [searchParams] = useSearchParams();
  const {
    documents,
    total,
    page,
    totalPages,
    isLoading,
    fetchDocuments,
    refresh,
  } = useDocumentsStore();
  const { user } = useAuthStore();
  const userRole = user?.role;

  const canCreate = canUploadDocuments(userRole);
  const canShare = canShareDocuments(userRole);

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");
  const [searchResults, setSearchResults] = useState<Document[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [editDoc, setEditDoc] = useState<Document | null>(null);
  const [uploadDoc, setUploadDoc] = useState<Document | null>(null);
  const [shareDoc, setShareDoc] = useState<Document | null>(null);

  useEffect(() => {
    fetchDocuments(1);
  }, []);

  // Search debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await documentsApi.search(searchQuery);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleDelete = async (doc: Document) => {
    if (!confirm(`¿Eliminar "${doc.title}"? Esta acción no se puede deshacer.`))
      return;
    try {
      await documentsApi.delete(doc.id);
      toast.success("Documento eliminado");
      refresh();
    } catch (err) {
      toast.error("Error al eliminar", (err as Error).message);
    }
  };

  const displayDocs = searchResults ?? documents;
  const isSearchMode = searchQuery.trim().length > 0;

  return (
    <div className="p-[var(--content-padding)] max-w-[var(--content-max-width)] animate-fade-in">
      <PageHeader
        title="Documentos"
        description={`${total} documento${total !== 1 ? "s" : ""} disponibles`}
        action={
          canCreate && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus size={15} />
              Nuevo documento
            </Button>
          )
        }
      />

      {/* Search bar */}
      <div className="relative mb-6">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
        />
        <input
          type="search"
          placeholder="Buscar por título o descripción…"
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

      {/* Table */}
      <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_180px_80px_100px_52px] px-5 py-3 bg-[var(--color-surface-secondary)] border-b border-[var(--color-surface-border)]">
          {["Título", "Departamento", "Versión", "Fecha", ""].map((h) => (
            <span
              key={h}
              className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide"
            >
              {h}
            </span>
          ))}
        </div>

        {isLoading && !isSearchMode ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : displayDocs.length === 0 ? (
          <EmptyState
            icon={<FileText size={36} />}
            title={isSearchMode ? "Sin resultados" : "No hay documentos"}
            description={
              isSearchMode
                ? `No se encontraron documentos para "${searchQuery}"`
                : "Crea tu primer documento con el botón superior."
            }
            action={
              !isSearchMode && (
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                  <Plus size={13} /> Nuevo documento
                </Button>
              )
            }
          />
        ) : (
          <div className="divide-y divide-[var(--color-surface-border)]">
            {displayDocs.map((doc) => (
              <DocumentRow
                key={doc.id}
                doc={doc}
                canEdit={canCreate}
                canShare={canShare}
                onEdit={() => setEditDoc(doc)}
                onUpload={() => setUploadDoc(doc)}
                onShare={() => setShareDoc(doc)}
                onDelete={() => handleDelete(doc)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isSearchMode && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-[var(--color-text-muted)]">
            Página {page} de {totalPages} · {total} documentos
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => fetchDocuments(page - 1)}
            >
              <ChevronLeft size={13} />
              Anterior
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => fetchDocuments(page + 1)}
            >
              Siguiente
              <ChevronRight size={13} />
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <CreateDocumentDialog
        open={createOpen || !!editDoc}
        onOpenChange={(o) => {
          if (!o) {
            setCreateOpen(false);
            setEditDoc(null);
          } else setCreateOpen(true);
        }}
        editDocument={editDoc}
        onSuccess={refresh}
      />

      {uploadDoc && (
        <UploadFileDialog
          open={!!uploadDoc}
          onOpenChange={(o) => !o && setUploadDoc(null)}
          documentId={uploadDoc.id}
          documentTitle={uploadDoc.title}
          onSuccess={refresh}
        />
      )}

      {shareDoc && (
        <ShareDocumentDialog
          open={!!shareDoc}
          onOpenChange={(o) => !o && setShareDoc(null)}
          documentId={shareDoc.id}
          documentTitle={shareDoc.title}
          onSuccess={refresh}
        />
      )}
    </div>
  );
}

interface DocRowProps {
  doc: Document;
  canEdit: boolean;
  canShare: boolean;
  onEdit: () => void;
  onUpload: () => void;
  onShare: () => void;
  onDelete: () => void;
}

function DocumentRow({
  doc,
  canEdit,
  canShare,
  onEdit,
  onUpload,
  onShare,
  onDelete,
}: DocRowProps) {
  const actions = [
    canEdit && { icon: Pencil, label: "Editar", action: onEdit },
    canEdit && { icon: Upload, label: "Subir versión", action: onUpload },
    canShare && { icon: Share2, label: "Compartir", action: onShare },
  ].filter(Boolean) as {
    icon: React.ElementType;
    label: string;
    action: () => void;
  }[];

  return (
    <div className="grid grid-cols-[1fr_180px_80px_100px_52px] px-5 py-3.5 items-center hover:bg-[var(--color-surface-secondary)] transition-colors group">
      {/* Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-[var(--radius-md)] bg-red-50 flex items-center justify-center shrink-0">
          <FileText size={15} className="text-red-400" />
        </div>
        <div className="min-w-0">
          <Link
            to={`/documents/${doc.id}`}
            className="text-sm font-medium text-[var(--color-text-primary)] hover:text-[var(--color-brand-orange)] truncate block transition-colors"
          >
            {doc.title}
          </Link>
          {doc.description && (
            <p className="text-xs text-[var(--color-text-muted)] truncate">
              {doc.description}
            </p>
          )}
        </div>
      </div>

      {/* Dept */}
      <span className="text-xs text-[var(--color-text-muted)]">
        Dept. {doc.departmentId}
      </span>

      {/* Version */}
      <Badge variant="orange">v{doc.currentVersion}</Badge>

      {/* Date */}
      <span className="text-xs text-[var(--color-text-muted)]">
        {formatDateTime(doc.createdAt).split(",")[0]}
      </span>

      {/* Actions dropdown — solo visible si hay acciones disponibles */}
      {(actions.length > 0 || canEdit) && (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)] transition-colors opacity-0 group-hover:opacity-100">
              <MoreHorizontal size={15} />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={4}
              className="w-44 bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-dropdown)] border border-[var(--color-surface-border)] py-1 z-[var(--z-dropdown)] animate-scale-in"
            >
              {actions.map(({ icon: Icon, label, action }) => (
                <DropdownMenu.Item
                  key={label}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--color-text-secondary)] cursor-pointer hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)] outline-none"
                  onSelect={action}
                >
                  <Icon size={13} />
                  {label}
                </DropdownMenu.Item>
              ))}
              {canEdit && (
                <>
                  {actions.length > 0 && (
                    <DropdownMenu.Separator className="my-1 border-t border-[var(--color-surface-border)]" />
                  )}
                  <DropdownMenu.Item
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--color-status-error)] cursor-pointer hover:bg-red-50 outline-none"
                    onSelect={onDelete}
                  >
                    <Trash2 size={13} />
                    Eliminar
                  </DropdownMenu.Item>
                </>
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}
    </div>
  );
}
