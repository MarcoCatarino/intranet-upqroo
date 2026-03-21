import { Link } from "react-router-dom";
import {
  Building2,
  Users,
  ChevronRight,
  ChevronDown,
  Pencil,
  Trash2,
} from "lucide-react";
import type { Department } from "@/types";
import { DepartmentCard } from "./DepartmentCard";

interface DepartmentTreeProps {
  roots: Department[];
  childrenMap: Map<number, Department[]>;
  expandedIds: Set<number>;
  onToggle: (id: number) => void;
  isAdmin?: boolean;
  onEdit?: (dept: Department) => void;
  onDelete?: (dept: Department) => void;
}

export function DepartmentTree({
  roots,
  childrenMap,
  expandedIds,
  onToggle,
  isAdmin = false,
  onEdit,
  onDelete,
}: DepartmentTreeProps) {
  const flatRoots = roots.filter(
    (r) => (childrenMap.get(r.id) ?? []).length === 0,
  );

  return (
    <div className="space-y-4">
      {/* Secretarie with sons */}
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
              {/* Header de Secretare */}
              <div className="flex items-center gap-3 px-5 py-4 bg-[var(--color-brand-brown-dark)] group">
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

                {/* Bottons admin in header */}
                {isAdmin && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                    <button
                      onClick={() => onEdit?.(root)}
                      className="p-1.5 rounded text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                      title="Editar"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => onDelete?.(root)}
                      className="p-1.5 rounded text-white/50 hover:text-red-300 hover:bg-white/10 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}

                <button
                  onClick={() => onToggle(root.id)}
                  className="flex items-center gap-1 text-white/60 hover:text-white transition-colors text-xs shrink-0"
                >
                  {children.length} {children.length === 1 ? "área" : "áreas"}
                  {isExpanded ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </button>
              </div>

              {/* Sub-departaments */}
              {isExpanded && (
                <div className="divide-y divide-[var(--color-surface-border)]">
                  {children.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--color-surface-secondary)] transition-colors group"
                    >
                      <Link
                        to={`/departments/${child.id}`}
                        className="flex items-center gap-3 flex-1 min-w-0"
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
                        <div className="flex items-center gap-1 text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-orange)] transition-colors shrink-0">
                          <Users size={12} />
                          <ChevronRight size={12} />
                        </div>
                      </Link>

                      {/* Bottons admin in sub-departament */}
                      {isAdmin && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => onEdit?.(child)}
                            className="p-1.5 rounded text-[var(--color-text-muted)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-brand-orange)] transition-colors"
                            title="Editar"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => onDelete?.(child)}
                            className="p-1.5 rounded text-[var(--color-text-muted)] hover:bg-red-50 hover:text-[var(--color-status-error)] transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

      {/* Area reoute with grid */}
      {flatRoots.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {flatRoots.map((dept) => (
            <DepartmentCard
              key={dept.id}
              department={dept}
              isAdmin={isAdmin}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
