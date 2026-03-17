import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import {
  ProtectedRoute,
  AdminRoute,
  PublicOnlyRoute,
} from "@/components/layout/ProtectedRoute";
import { ErrorLayout, NotFoundPage } from "@/components/layout/ErrorLayout";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { DocumentsPage } from "@/pages/DocumentsPage";
import { DepartmentsPage } from "@/pages/DepartmentsPage";
import { DepartmentDetailPage } from "@/pages/DepartmentDetailPage";
import { UsersPage } from "@/pages/UsersPage";
import { DocumentDetailPage } from "./pages/DocumentsDetailPage";

const router = createBrowserRouter([
  {
    // Public routes (redirect to /dashboard if already logged in)
    element: <PublicOnlyRoute />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },
  {
    // Protected routes (require authentication)
    element: <ProtectedRoute />,
    errorElement: <ErrorLayout />,
    children: [
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/documents", element: <DocumentsPage /> },
      { path: "/documents/:documentId", element: <DocumentDetailPage /> },
      { path: "/departments", element: <DepartmentsPage /> },
      { path: "/departments/:departmentId", element: <DepartmentDetailPage /> },

      // Admin-only routes
      {
        element: <AdminRoute />,
        children: [{ path: "/users", element: <UsersPage /> }],
      },
    ],
  },
  // Default redirect
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  // 404
  { path: "*", element: <NotFoundPage /> },
]);

export function App() {
  return <RouterProvider router={router} />;
}
