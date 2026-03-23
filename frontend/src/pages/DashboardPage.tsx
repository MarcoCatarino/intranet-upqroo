import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Building2,
  Clock,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useDocumentsStore } from "@/store/documentsStore";
import { departmentsApi } from "@/services/api";
import { PageHeader } from "@/components/layout/AppLayout";
import { Spinner } from "@/components/ui/Badge";
import { canUploadDocuments, formatDateTime } from "@/lib/utils";
import type { Department } from "@/types";
import { StatCard } from "@/components/sections/dashboard/StarCard";
import { RecentDocumentRow } from "@/components/sections/dashboard/RecentDocumentRow";
import { QuickUploadBanner } from "@/components/sections/dashboard/QuickUploadBanner";

export function DashboardPage() {
  const { user } = useAuthStore();
  const { documents, total, fetchDocuments, isLoading } = useDocumentsStore();
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    fetchDocuments(1);
    departmentsApi
      .list()
      .then(setDepartments)
      .catch(() => {});
  }, []);

  const recentDocs = documents.slice(0, 5);

  return (
    <div className="p-[var(--content-padding)] max-w-[var(--content-max-width)] animate-fade-in">
      <PageHeader
        title={`Bienvenido, ${user?.name?.split(" ")[0]}`}
        description="Panel principal de la intranet de documentos"
      />

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={
            <FileText size={20} className="text-[var(--color-brand-orange)]" />
          }
          label="Mis documentos"
          value={isLoading ? "—" : String(total)}
          bg="bg-orange-50"
        />

        <StatCard
          icon={
            <Building2 size={20} className="text-[var(--color-brand-brown)]" />
          }
          label="Departamentos"
          value={String(departments.length)}
          bg="bg-amber-50"
        />

        <StatCard
          icon={
            <TrendingUp
              size={20}
              className="text-[var(--color-status-success)]"
            />
          }
          label="Documentos activos"
          value={isLoading ? "—" : String(total)}
          bg="bg-green-50"
        />

        <StatCard
          icon={<Clock size={20} className="text-[var(--color-status-info)]" />}
          label="Acceso reciente"
          value={
            recentDocs.length > 0
              ? formatDateTime(recentDocs[0].createdAt).split(",")[0]
              : "—"
          }
          bg="bg-blue-50"
          small
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-[var(--radius-xl)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-surface-border)]">
            <h2 className="font-display text-base text-[var(--color-text-primary)]">
              Documentos recientes
            </h2>
            <Link
              to="/documents"
              className="text-xs text-[var(--color-brand-orange)] hover:underline flex items-center gap-1"
            >
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-[var(--color-surface-border)]">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : recentDocs.length === 0 ? (
              <div className="py-10 text-center">
                <FileText
                  size={28}
                  className="mx-auto text-[var(--color-text-muted)] mb-2"
                />
                <p className="text-sm text-[var(--color-text-muted)]">
                  No hay documentos aún
                </p>
              </div>
            ) : (
              recentDocs.map((doc) => (
                <RecentDocumentRow key={doc.id} doc={doc} />
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-surface-border)]">
            <h2 className="font-display text-base text-[var(--color-text-primary)]">
              Departamentos
            </h2>
            <Link
              to="/departments"
              className="text-xs text-[var(--color-brand-orange)] hover:underline flex items-center gap-1"
            >
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>
          <div className="p-3 space-y-1">
            {departments.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)] text-center py-6">
                Sin departamentos
              </p>
            ) : (
              departments.slice(0, 8).map((dept) => (
                <Link
                  key={dept.id}
                  to={`/departments/${dept.id}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-secondary)] transition-colors group"
                >
                  <div className="w-7 h-7 rounded-md bg-[var(--color-brand-orange)]/10 flex items-center justify-center shrink-0">
                    <Building2
                      size={14}
                      className="text-[var(--color-brand-orange)]"
                    />
                  </div>
                  <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] truncate">
                    {dept.name}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {canUploadDocuments(user?.role) && <QuickUploadBanner />}
    </div>
  );
}
