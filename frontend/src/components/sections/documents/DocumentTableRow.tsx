import { Link } from "react-router-dom";
import {
  FileText,
  Pencil,
  Upload,
  Share2,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";
import type { Document } from "@/types";

interface DocumentTableRowProps {
  doc: Document;
  canEdit: boolean;
  canShare: boolean;
  onEdit: () => void;
  onUpload: () => void;
  onShare: () => void;
  onDelete: () => void;
}

export function DocumentTableRow({
  doc,
  canEdit,
  canShare,
  onEdit,
  onUpload,
  onShare,
  onDelete,
}: DocumentTableRowProps) {
  const actions = [
    canEdit && { icon: Pencil, label: "Editar", action: onEdit },
    canEdit && { icon: Upload, label: "Subir versión", action: onUpload },
    canShare && { icon: Share2, label: "Compartir", action: onShare },
  ].filter(Boolean) as {
    icon: React.ElementType;
    label: string;
    action: () => void;
  }[];

  const hasActions = actions.length > 0 || canEdit;

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

      <span className="text-xs text-[var(--color-text-muted)]">
        Dept. {doc.departmentId}
      </span>
      <Badge variant="orange">v{doc.currentVersion}</Badge>
      <span className="text-xs text-[var(--color-text-muted)]">
        {formatDateTime(doc.createdAt).split(",")[0]}
      </span>

      {/* Actions dropdown */}
      {hasActions ? (
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
      ) : (
        <span />
      )}
    </div>
  );
}
