import { Link } from "react-router-dom";
import { Building2, Users, ChevronRight, ChevronDown } from "lucide-react";
import type { Department } from "@/types";
import { DepartmentCard } from "./DepartmentCard";

interface DepartmentTreeProps {
  roots: Department[];
  childrenMap: Map<number, Department[]>;
  expandedIds: Set<number>;
  onToggle: (id: number) => void;
}

export function DepartmentTree({
  roots,
  childrenMap,
  expandedIds,
  onToggle,
}: DepartmentTreeProps) {
  // Departamentos raíz sin hijos (no son secretarías con sub-departamentos)
  const flatRoots = roots.filter(
    (r) => (childrenMap.get(r.id) ?? []).length === 0,
  );

  return (
    <div className="space-y-4">
      {/* Secretarías con hijos */}
      {roots
        .filter((r) => (childrenMap.get(r.id) ?? []).length > 0)
        .map((root) => {
          const children = childrenMap.get(root.id) ?? [];
          const isExpanded = expandedIds.has(root.id);
          return (
            <div
              key={root.id}
              className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden"
            >
              {/* Header de Secretaría */}
              <div className="flex items-center gap-3 px-5 py-4 bg-[var(--color-brand-brown-dark)]">
                <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--color-brand-orange)] flex items-center justify-center shrink-0">
                  <Building2 size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/departments/${root.id}`}
                    className="font-display text-white text-sm font-semibold hover:text-[var(--color-brand-orange-light)] transition-colors"
                  >
                    {root.name}
                  </Link>
                  <p className="text-white/50 text-[10px] font-mono">
                    {root.slug}
                  </p>
                </div>
                <button
                  onClick={() => onToggle(root.id)}
                  className="flex items-center gap-1 text-white/60 hover:text-white transition-colors text-xs"
                >
                  {children.length} {children.length === 1 ? "área" : "áreas"}
                  {isExpanded ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </button>
              </div>

              {/* Sub-departamentos */}
              {isExpanded && (
                <div className="divide-y divide-[var(--color-surface-border)]">
                  {children.map((child) => (
                    <Link
                      key={child.id}
                      to={`/departments/${child.id}`}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--color-surface-secondary)] transition-colors group"
                    >
                      <div className="w-6 h-6 rounded bg-[var(--color-brand-orange)]/10 flex items-center justify-center shrink-0">
                        <Building2
                          size={12}
                          className="text-[var(--color-brand-orange)]"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-orange)] transition-colors truncate">
                          {child.name}
                        </p>
                        <p className="text-[10px] text-[var(--color-text-muted)] font-mono">
                          {child.slug}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-orange)] transition-colors">
                        <Users size={12} />
                        <ChevronRight size={12} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}

      {/* Áreas raíz sin hijos en grid */}
      {flatRoots.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {flatRoots.map((dept) => (
            <DepartmentCard key={dept.id} department={dept} />
          ))}
        </div>
      )}
    </div>
  );
}
