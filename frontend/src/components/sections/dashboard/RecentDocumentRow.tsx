import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";
import type { Document } from "@/types";

export function RecentDocumentRow({ doc }: { doc: Document }) {
  return (
    <Link
      to={`/documents/${doc.id}`}
      className="flex items-center gap-3 px-5 py-3.5 hover:bg-[var(--color-surface-secondary)] transition-colors group"
    >
      <div className="w-8 h-8 rounded-[var(--radius-md)] bg-red-50 flex items-center justify-center shrink-0">
        <FileText size={15} className="text-red-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-brand-orange)] transition-colors">
          {doc.title}
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          {formatDateTime(doc.createdAt)}
        </p>
      </div>
      <Badge variant="default">v{doc.currentVersion}</Badge>
    </Link>
  );
}
