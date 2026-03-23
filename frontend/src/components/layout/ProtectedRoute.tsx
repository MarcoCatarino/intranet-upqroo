import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Spinner } from "@/components/ui/Badge";
import { AppLayout } from "./AppLayout";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading, fetchMe, user } = useAuthStore();
  const [serverError, setServerError] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchMe().catch(() => setServerError(true));
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)]">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-[var(--color-text-muted)]">
            Verificando sesión…
          </p>
        </div>
      </div>
    );
  }

  if (serverError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)]">
        <div className="flex flex-col items-center gap-3 text-center max-w-sm px-6">
          <p className="text-lg font-display text-[var(--color-text-primary)]">
            Sin conexión al servidor
          </p>
          <p className="text-sm text-[var(--color-text-muted)]">
            No se pudo verificar tu sesión. Revisa tu conexión e intenta de
            nuevo.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 text-sm rounded-md bg-[var(--color-brand-orange)] text-white hover:bg-[var(--color-brand-orange-dark)] transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

export function AdminRoute() {
  const { user } = useAuthStore();
  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
