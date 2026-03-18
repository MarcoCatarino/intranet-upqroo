import { Link } from "react-router-dom";
import { Building2, Users, ChevronRight } from "lucide-react";
import type { Department } from "@/types";

export function DepartmentCard({ department }: { department: Department }) {
  return (
    <Link
      to={`/departments/${department.id}`}
      className="group bg-white rounded-[var(--radius-xl)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-5 hover:border-[var(--color-brand-orange)]/40 hover:shadow-md transition-all"
    >
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
  );
}
