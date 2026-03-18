import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FileText,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useDocumentsStore } from "@/store/documentsStore";
import { useAuthStore } from "@/store/authStore";
import { documentsApi, departmentsApi } from "@/services/api";
import { PageHeader } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { EmptyState, Spinner } from "@/components/ui/Badge";
import { DocumentTableRow } from "@/components/sections/documents/DocumentTableRow";
import { DocumentsByDepartment } from "@/components/sections/documents/DocumentsByDepartment";
import { CreateDocumentDialog } from "@/components/dialogs/CreateDocumentDialog";
import { UploadFileDialog } from "@/components/dialogs/UploadFileDialog";
import { ShareDocumentDialog } from "@/components/dialogs/ShareDocumentDialog";
import { toast } from "@/components/ui/Toast";
import { canUploadDocuments, canShareDocuments } from "@/lib/utils";
import type { Department, Document } from "@/types";

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

  const canCreate = canUploadDocuments(user?.role);
  const canShare = canShareDocuments(user?.role);

  // Alumnos y profesores ven la vista agrupada por departamento
  const isReadOnlyRole = user?.role === "student" || user?.role === "professor";

  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");
  const [searchResults, setSearchResults] = useState<Document[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [editDoc, setEditDoc] = useState<Document | null>(null);
  const [uploadDoc, setUploadDoc] = useState<Document | null>(null);
  const [shareDoc, setShareDoc] = useState<Document | null>(null);

  useEffect(() => {
    fetchDocuments(1);
    // Cargar departamentos para la vista agrupada
    departmentsApi
      .list()
      .then(setDepartments)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        setSearchResults(await documentsApi.search(searchQuery));
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

  // Texto del empty state según rol
  const emptyDescription = isSearchMode
    ? `No se encontraron documentos para "${searchQuery}"`
    : isReadOnlyRole
      ? "No tienes documentos compartidos contigo aún."
      : "Crea tu primer documento con el botón superior.";

  return (
    <div className="p-[var(--content-padding)] max-w-[var(--content-max-width)] animate-fade-in">
      <PageHeader
        title="Documentos"
        description={`${total} documento${total !== 1 ? "s" : ""} disponibles`}
        action={
          canCreate && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus size={15} /> Nuevo documento
            </Button>
          )
        }
      />

      {/* Búsqueda */}
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

      {isLoading && !isSearchMode ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : displayDocs.length === 0 ? (
        <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
          <EmptyState
            icon={<FileText size={36} />}
            title={isSearchMode ? "Sin resultados" : "No hay documentos"}
            description={emptyDescription}
            action={
              !isSearchMode &&
              canCreate && (
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                  <Plus size={13} /> Nuevo documento
                </Button>
              )
            }
          />
        </div>
      ) : isReadOnlyRole && !isSearchMode ? (
        /* Vista agrupada por departamento para alumnos y profesores */
        <DocumentsByDepartment
          documents={displayDocs}
          departments={departments}
        />
      ) : (
        /* Vista de tabla para admins, secretarios, directores — o en modo búsqueda */
        <>
          <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
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
            <div className="divide-y divide-[var(--color-surface-border)]">
              {displayDocs.map((doc) => (
                <DocumentTableRow
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
          </div>

          {/* Paginación — solo en vista tabla y sin búsqueda activa */}
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
                  <ChevronLeft size={13} /> Anterior
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => fetchDocuments(page + 1)}
                >
                  Siguiente <ChevronRight size={13} />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Dialogs — solo accesibles para roles con permisos */}
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
