import { Link } from "react-router-dom";
import { Building2, Users, ChevronRight, Pencil, Trash2 } from "lucide-react";
import type { Department } from "@/types";

interface DepartmentCardProps {
  department: Department;
  isAdmin?: boolean;
  onEdit?: (dept: Department) => void;
  onDelete?: (dept: Department) => void;
}

export function DepartmentCard({
  department,
  isAdmin = false,
  onEdit,
  onDelete,
}: DepartmentCardProps) {
  return (
    <div className="group relative bg-white rounded-[var(--radius-xl)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-5 hover:border-[var(--color-brand-orange)]/40 hover:shadow-md transition-all">
      {isAdmin && (
        <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.preventDefault();
              onEdit?.(department);
            }}
            className="p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-brand-orange)] transition-colors"
            title="Editar"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete?.(department);
            }}
            className="p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:bg-red-50 hover:text-[var(--color-status-error)] transition-colors"
            title="Eliminar"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}

      <Link to={`/departments/${department.id}`} className="block">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--color-brand-orange)]/10 flex items-center justify-center">
            <Building2 size={20} className="text-[var(--color-brand-orange)]" />
          </div>
          <ChevronRight
            size={16}
            className="text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-orange)] transition-colors mt-1"
          />
        </div>
        <h3 className="font-display text-base text-[var(--color-text-primary)] mb-1 group-hover:text-[var(--color-brand-orange)] transition-colors">
          {department.name}
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] font-mono">
          {department.slug}
        </p>
        <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-[var(--color-surface-border)]">
          <Users size={12} className="text-[var(--color-text-muted)]" />
          <span className="text-xs text-[var(--color-text-muted)]">
            Ver miembros
          </span>
        </div>
      </Link>
    </div>
  );
}
