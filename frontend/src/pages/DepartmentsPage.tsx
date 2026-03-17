import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Plus,
  Users,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import type { Department } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { departmentsApi } from "@/services/api";
import { toast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { EmptyState, Spinner } from "@/components/ui/Badge";
import { Dialog, DialogFooter } from "@/components/ui/Dialog";
import { Input, Select } from "@/components/ui/Input";

export function DepartmentsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await departmentsApi.list();
      setDepartments(data);
      // Auto-expand all parents on load
      const parentIds = new Set(
        data.map((d) => d.parentId).filter(Boolean) as number[],
      );
      setExpandedIds(parentIds);
    } catch {
      toast.error("Error al cargar departamentos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Build tree: top-level = no parentId, children = have parentId
  const { roots, childrenMap } = useMemo(() => {
    const roots = departments.filter((d) => !d.parentId);
    const childrenMap = new Map<number, Department[]>();
    departments
      .filter((d) => d.parentId)
      .forEach((d) => {
        const arr = childrenMap.get(d.parentId!) ?? [];
        arr.push(d);
        childrenMap.set(d.parentId!, arr);
      });
    return { roots, childrenMap };
  }, [departments]);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="p-[var(--content-padding)] max-w-[var(--content-max-width)] animate-fade-in">
      <PageHeader
        title="Departamentos"
        description={`${departments.length} área${departments.length !== 1 ? "s" : ""} registradas`}
        action={
          isAdmin && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus size={15} /> Nuevo
            </Button>
          )
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : departments.length === 0 ? (
        <EmptyState
          icon={<Building2 size={36} />}
          title="Sin departamentos"
          description={
            isAdmin ? "Crea el primer área." : "No hay áreas registradas."
          }
          action={
            isAdmin && (
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus size={13} /> Crear área
              </Button>
            )
          }
        />
      ) : roots.length > 0 ? (
        /* Hierarchical view */
        <div className="space-y-4">
          {roots.map((root) => {
            const children = childrenMap.get(root.id) ?? [];
            const isExpanded = expandedIds.has(root.id);
            return (
              <div
                key={root.id}
                className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden"
              >
                {/* Root (Secretaría) header */}
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
                  {children.length > 0 && (
                    <button
                      onClick={() => toggleExpand(root.id)}
                      className="flex items-center gap-1 text-white/60 hover:text-white transition-colors text-xs"
                    >
                      {children.length}{" "}
                      {children.length === 1 ? "área" : "áreas"}
                      {isExpanded ? (
                        <ChevronDown size={14} />
                      ) : (
                        <ChevronRight size={14} />
                      )}
                    </button>
                  )}
                </div>

                {/* Children (Departamentos) */}
                {children.length > 0 && isExpanded && (
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

          {/* Flat departments without parent (if any) */}
          {departments.filter(
            (d) =>
              !d.parentId &&
              !childrenMap.has(d.id) &&
              (childrenMap.get(d.id) ?? []).length === 0,
          ).length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {departments
                .filter(
                  (d) =>
                    !d.parentId && (childrenMap.get(d.id) ?? []).length === 0,
                )
                .map((dept) => (
                  <DepartmentCard key={dept.id} department={dept} />
                ))}
            </div>
          )}
        </div>
      ) : (
        /* Flat grid fallback (no hierarchy) */
        <div className="grid grid-cols-3 gap-4">
          {departments.map((dept) => (
            <DepartmentCard key={dept.id} department={dept} />
          ))}
        </div>
      )}

      {isAdmin && (
        <CreateDepartmentDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          departments={departments}
          onSuccess={load}
        />
      )}
    </div>
  );
}

function DepartmentCard({ department }: { department: Department }) {
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
          Ver usuarios
        </span>
      </div>
    </Link>
  );
}

function CreateDepartmentDialog({
  open,
  onOpenChange,
  departments,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  departments: Department[];
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNameChange = (v: string) => {
    setName(v);
    setSlug(
      v
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    );
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim() || name.length < 2) errs.name = "Mínimo 2 caracteres";
    if (!slug.trim() || slug.length < 2) errs.slug = "Slug inválido";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      await departmentsApi.create({
        name: name.trim(),
        slug: slug.trim(),
        parentId: parentId ? Number(parentId) : undefined,
      });
      toast.success("Área creada");
      onSuccess();
      onOpenChange(false);
      setName("");
      setSlug("");
      setParentId("");
    } catch (err) {
      toast.error("Error al crear", (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const parentOptions = [
    { value: "", label: "Sin dependencia (Secretaría / área raíz)" },
    ...departments
      .filter((d) => !d.parentId) // Solo top-level como posibles padres
      .map((d) => ({ value: String(d.id), label: d.name })),
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Nueva área"
      description="Crea una Secretaría o un Departamento dependiente."
    >
      <div className="space-y-4">
        <Input
          label="Nombre"
          placeholder="Ej. Secretaría Académica"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          error={errors.name}
        />
        <Input
          label="Slug (identificador)"
          placeholder="secretaria-academica"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          error={errors.slug}
          hint="Identificador único, sin espacios ni acentos"
        />
        <Select
          label="Dependencia (opcional)"
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          options={parentOptions}
          hint="Si es un departamento, selecciona su Secretaría"
        />
      </div>
      <DialogFooter>
        <Button variant="secondary" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} isLoading={isLoading}>
          Crear
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
