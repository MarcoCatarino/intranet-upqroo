import { Link } from "react-router-dom";
import { Building2, FileText, Download, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";
import type { Document, Department } from "@/types";

interface DocumentsByDepartmentProps {
  documents: Document[];
  departments: Department[];
}

/** Builds label like "Secretaría Académica / Ing. Software" or just "Ing. Software" */
function buildDeptLabel(
  deptId: number,
  departments: Department[],
): { parent: string | null; name: string } {
  const dept = departments.find((d) => d.id === deptId);
  if (!dept) return { parent: null, name: `Departamento ${deptId}` };

  if (dept.parentId) {
    const parent = departments.find((d) => d.id === dept.parentId);
    return { parent: parent?.name ?? null, name: dept.name };
  }

  return { parent: null, name: dept.name };
}

export function DocumentsByDepartment({
  documents,
  departments,
}: DocumentsByDepartmentProps) {
  // Group documents by departmentId
  const grouped = documents.reduce<Record<number, Document[]>>((acc, doc) => {
    const key = doc.departmentId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(doc);
    return acc;
  }, {});

  // Sort groups: departments with a parent first (they're sub-departments), then root ones
  const sortedDeptIds = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => {
      const deptA = departments.find((d) => d.id === a);
      const deptB = departments.find((d) => d.id === b);
      // Sub-departments (with parent) come first
      if (deptA?.parentId && !deptB?.parentId) return -1;
      if (!deptA?.parentId && deptB?.parentId) return 1;
      return (deptA?.name ?? "").localeCompare(deptB?.name ?? "");
    });

  if (sortedDeptIds.length === 0) return null;

  return (
    <div className="space-y-6">
      {sortedDeptIds.map((deptId) => {
        const docs = grouped[deptId];
        const { parent, name } = buildDeptLabel(deptId, departments);

        return (
          <div
            key={deptId}
            className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden"
          >
            {/* Department header */}
            <div className="flex items-center gap-3 px-5 py-3.5 bg-[var(--color-surface-secondary)] border-b border-[var(--color-surface-border)]">
              <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[var(--color-brand-orange)]/10 flex items-center justify-center shrink-0">
                <Building2
                  size={14}
                  className="text-[var(--color-brand-orange)]"
                />
              </div>
              <div className="flex-1 min-w-0">
                {parent && (
                  <p className="text-[10px] text-[var(--color-text-muted)] leading-tight truncate">
                    {parent}
                  </p>
                )}
                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                  {name}
                </p>
              </div>
              <Link
                to={`/departments/${deptId}`}
                className="flex items-center gap-1 text-xs text-[var(--color-brand-orange)] hover:underline shrink-0"
              >
                Ver área <ChevronRight size={12} />
              </Link>
            </div>

            {/* Documents list */}
            <div className="divide-y divide-[var(--color-surface-border)]">
              {docs.map((doc) => (
                <Link
                  key={doc.id}
                  to={`/documents/${doc.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-[var(--color-surface-secondary)] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-[var(--radius-md)] bg-red-50 flex items-center justify-center shrink-0">
                    <FileText size={15} className="text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-orange)] truncate transition-colors">
                      {doc.title}
                    </p>
                    {doc.description && (
                      <p className="text-xs text-[var(--color-text-muted)] truncate">
                        {doc.description}
                      </p>
                    )}
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {formatDateTime(doc.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="orange">v{doc.currentVersion}</Badge>
                    <Download
                      size={14}
                      className="text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-orange)] transition-colors"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
