import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Spinner } from "@/components/ui/Badge";
import { AppLayout } from "./AppLayout";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading, fetchMe, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchMe();
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
