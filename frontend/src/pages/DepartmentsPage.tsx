import { useEffect, useMemo, useState } from "react";
import { Building2, Plus } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { departmentsApi } from "@/services/api";
import { PageHeader } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { EmptyState, Spinner } from "@/components/ui/Badge";
import { DepartmentTree } from "@/components/sections/departments/DepartmentTree";
import { DepartmentCard } from "@/components/sections/departments/DepartmentCard";
import { CreateDepartmentDialog } from "@/components/sections/departments/CreateDepartmentDialog";
import { toast } from "@/components/ui/Toast";
import type { Department } from "@/types";

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

  const handleToggle = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const hasHierarchy = roots.some(
    (r) => (childrenMap.get(r.id) ?? []).length > 0,
  );

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
      ) : hasHierarchy ? (
        <DepartmentTree
          roots={roots}
          childrenMap={childrenMap}
          expandedIds={expandedIds}
          onToggle={handleToggle}
        />
      ) : (
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
