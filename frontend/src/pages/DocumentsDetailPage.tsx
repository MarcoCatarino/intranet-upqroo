import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  FileText, Download, Upload, Share2, Pencil, Trash2,
  Clock, Shield, History, ChevronLeft,
} from 'lucide-react'
import {
  formatDateTime, formatFileSize, PERMISSION_LABELS, AUDIT_ACTION_LABELS,
  canUploadDocuments, canShareDocuments, canViewAudit,
} from '@/lib/utils'
import type { Document, DocumentVersion, AuditLog } from '@/types'
import { useAuthStore } from '@/store/authStore'
import { documentsApi } from '@/services/api'
import { toast } from '@/components/ui/Toast'
import { Badge, EmptyState, Spinner } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/layout/AppLayout'
import { CreateDocumentDialog } from '@/components/dialogs/CreateDocumentDialog'
import { UploadFileDialog } from '@/components/dialogs/UploadFileDialog'
import { ShareDocumentDialog } from '@/components/dialogs/ShareDocumentDialog'

type Tab = 'versions' | 'permissions' | 'audit'

export function DocumentDetailPage() {
  const { documentId } = useParams<{ documentId: string }>()
  const navigate = useNavigate()
  const id = Number(documentId)
  const { user } = useAuthStore()
  const userRole = user?.role

  const canEdit    = canUploadDocuments(userRole)
  const canShare   = canShareDocuments(userRole)
  const showAudit  = canViewAudit(userRole)

  const [doc, setDoc] = useState<Document | null>(null)
  const [versions, setVersions] = useState<DocumentVersion[]>([])
  const [permissions, setPermissions] = useState<{ users: any[]; departments: any[] }>({ users: [], departments: [] })
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('versions')
  const [isLoading, setIsLoading] = useState(true)

  const [editOpen, setEditOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  const loadDoc = async () => {
    setIsLoading(true)
    try {
      const [d, v] = await Promise.all([
        documentsApi.get(id),
        documentsApi.versions(id),
      ])
      setDoc(d)
      setVersions(v)
    } catch {
      toast.error('No se pudo cargar el documento')
      navigate('/documents')
    } finally {
      setIsLoading(false)
    }
  }

  const loadTab = async (tab: Tab) => {
    setActiveTab(tab)
    if (tab === 'permissions' && permissions.users.length === 0) {
      try {
        const p = await documentsApi.permissions(id)
        setPermissions(p)
      } catch {}
    }
    if (tab === 'audit' && auditLogs.length === 0) {
      try {
        const logs = await documentsApi.auditLogs(id)
        setAuditLogs(logs)
      } catch {}
    }
  }

  useEffect(() => { loadDoc() }, [id])

  const handleDelete = async () => {
    if (!doc) return
    if (!confirm(`¿Eliminar "${doc.title}"?`)) return
    try {
      await documentsApi.delete(id)
      toast.success('Documento eliminado')
      navigate('/documents')
    } catch (err) {
      toast.error('Error al eliminar', (err as Error).message)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!doc) return null

  const latestVersion = versions.find((v) => v.version === doc.currentVersion)

  return (
    <div className="p-[var(--content-padding)] max-w-[var(--content-max-width)] animate-fade-in">
      {/* Back */}
      <button
        onClick={() => navigate('/documents')}
        className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] mb-4 transition-colors"
      >
        <ChevronLeft size={14} /> Documentos
      </button>

      <PageHeader
        title={doc.title}
        description={doc.description ?? undefined}
        action={
          <div className="flex items-center gap-2">
            {canShare && (
              <Button variant="secondary" size="sm" onClick={() => setShareOpen(true)}>
                <Share2 size={13} /> Compartir
              </Button>
            )}
            {canEdit && (
              <Button variant="secondary" size="sm" onClick={() => setUploadOpen(true)}>
                <Upload size={13} /> Nueva versión
              </Button>
            )}
            {canEdit && (
              <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
                <Pencil size={13} /> Editar
              </Button>
            )}
            {canEdit && (
              <Button variant="danger" size="sm" onClick={handleDelete}>
                <Trash2 size={13} />
              </Button>
            )}
          </div>
        }
      />

      {/* Meta strip */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-white rounded-[var(--radius-xl)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)]">
        <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-red-50 flex items-center justify-center shrink-0">
          <FileText size={24} className="text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="orange">v{doc.currentVersion}</Badge>
            <Badge variant="default">Dept. {doc.departmentId}</Badge>
            {doc.deletedAt && <Badge variant="error">Eliminado</Badge>}
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Creado {formatDateTime(doc.createdAt)}
            {latestVersion && ` · ${formatFileSize(latestVersion.fileSize)}`}
          </p>
        </div>
        {latestVersion && (
          <a
            href={documentsApi.downloadUrl(id, doc.currentVersion)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm">
              <Download size={13} /> Descargar v{doc.currentVersion}
            </Button>
          </a>
        )}
      </div>

      {/* Tabs — permissions y audit solo para roles con acceso */}
      <div className="flex gap-0.5 mb-4 border-b border-[var(--color-surface-border)]">
        {([
          { id: 'versions',    icon: History, label: 'Versiones',  show: true },
          { id: 'permissions', icon: Shield,  label: 'Permisos',   show: canShare },
          { id: 'audit',       icon: Clock,   label: 'Auditoría',  show: showAudit },
        ] as { id: Tab; icon: React.ElementType; label: string; show: boolean }[])
          .filter((t) => t.show)
          .map(({ id: tabId, icon: Icon, label }) => (
            <button
              key={tabId}
              onClick={() => loadTab(tabId)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tabId
                  ? 'border-[var(--color-brand-orange)] text-[var(--color-brand-orange)]'
                  : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
        {/* Versions */}
        {activeTab === 'versions' && (
          <div className="divide-y divide-[var(--color-surface-border)]">
            {versions.length === 0 ? (
              <EmptyState
                icon={<History size={32} />}
                title="Sin versiones"
                description="Sube el primer archivo con el botón 'Nueva versión'"
              />
            ) : (
              [...versions].reverse().map((v) => (
                <div key={v.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-8 h-8 rounded-[var(--radius-md)] bg-red-50 flex items-center justify-center shrink-0">
                    <FileText size={15} className="text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--color-text-primary)]">
                        Versión {v.version}
                      </span>
                      {v.version === doc.currentVersion && (
                        <Badge variant="success">Actual</Badge>
                      )}
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {formatDateTime(v.createdAt)} · {formatFileSize(v.fileSize)}
                    </p>
                    {v.fileHash && (
                      <p className="text-[10px] text-[var(--color-text-muted)] font-mono mt-0.5 truncate" title={`SHA-256: ${v.fileHash}`}>
                        SHA-256: {v.fileHash.slice(0, 16)}…
                      </p>
                    )}
                  </div>
                  <a
                    href={documentsApi.downloadUrl(id, v.version)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-[var(--color-brand-orange)] hover:underline"
                  >
                    <Download size={12} /> Descargar
                  </a>
                </div>
              ))
            )}
          </div>
        )}

        {/* Permissions */}
        {activeTab === 'permissions' && (
          <div className="p-5 space-y-4">
            {permissions.users.length === 0 && permissions.departments.length === 0 ? (
              <EmptyState
                icon={<Shield size={32} />}
                title="Sin permisos asignados"
                description="Usa el botón 'Compartir' para otorgar acceso"
              />
            ) : (
              <>
                {permissions.users.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-2">Usuarios</p>
                    <div className="space-y-2">
                      {permissions.users.map((p, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-[var(--color-surface-secondary)] rounded-[var(--radius-md)]">
                          <span className="text-sm text-[var(--color-text-secondary)]">{p.userId}</span>
                          <Badge variant="orange">{PERMISSION_LABELS[p.permission] ?? p.permission}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {permissions.departments.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-2">Departamentos</p>
                    <div className="space-y-2">
                      {permissions.departments.map((p, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-[var(--color-surface-secondary)] rounded-[var(--radius-md)]">
                          <span className="text-sm text-[var(--color-text-secondary)]">Dept. {p.departmentId}</span>
                          <Badge variant="info">{PERMISSION_LABELS[p.permission] ?? p.permission}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Audit */}
        {activeTab === 'audit' && (
          <div className="divide-y divide-[var(--color-surface-border)]">
            {auditLogs.length === 0 ? (
              <EmptyState icon={<Clock size={32} />} title="Sin registros" />
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 px-5 py-3.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-orange)] mt-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--color-text-primary)]">
                      {AUDIT_ACTION_LABELS[log.action] ?? log.action}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {log.userId} · {formatDateTime(log.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CreateDocumentDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        editDocument={doc}
        onSuccess={loadDoc}
      />
      <UploadFileDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        documentId={id}
        documentTitle={doc.title}
        onSuccess={loadDoc}
      />

      <ShareDocumentDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        documentId={id}
        documentTitle={doc.title}
      />
    </div>
  )
}