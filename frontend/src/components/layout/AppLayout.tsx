import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FileText,
  LayoutDashboard,
  Building2,
  Users,
  ChevronLeft,
  LogOut,
  Settings,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { ROLE_LABELS } from "@/types";
import type { UserRole } from "@/types";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

const NAV_ITEMS: {
  to: string;
  icon: React.ElementType;
  label: string;
  roles?: UserRole[];
}[] = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Inicio" },
  { to: "/documents", icon: FileText, label: "Documentos" },
  { to: "/departments", icon: Building2, label: "Departamentos" },
  { to: "/users", icon: Users, label: "Usuarios", roles: ["admin"] },
];

const ROLE_BADGE_COLORS: Record<UserRole, string> = {
  admin: "bg-red-100 text-red-700",
  secretary: "bg-purple-100 text-purple-700",
  director: "bg-blue-100 text-blue-700",
  assistant: "bg-teal-100 text-teal-700",
  professor: "bg-green-100 text-green-700",
  student: "bg-gray-100 text-gray-600",
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "??";

  const userRole = user?.role;

  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.roles || (userRole && item.roles.includes(userRole)),
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-surface)]">
      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "flex flex-col h-full bg-[var(--color-brand-brown-dark)] text-white",
          "transition-[width] duration-[var(--transition-slow)] ease-in-out shrink-0",
          "z-[var(--z-sidebar)]",
          collapsed
            ? "w-[var(--sidebar-collapsed)]"
            : "w-[var(--sidebar-width)]",
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-[var(--header-height)] px-4 border-b border-white/10 shrink-0">
          <Link to="/dashboard" className="flex items-center gap-3 min-w-0">
            {/* Logo provisional */}
            <div className="shrink-0 w-8 h-8 rounded-md bg-[var(--color-brand-orange)] flex items-center justify-center font-display font-bold text-white text-sm">
              U
            </div>
            {!collapsed && (
              <div className="min-w-0 animate-fade-in">
                <p className="font-display text-sm font-semibold leading-tight truncate">
                  UPQROO
                </p>
                <p className="text-[10px] text-white/50 truncate leading-tight">
                  Intranet de Documentos
                </p>
              </div>
            )}
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
          {visibleNavItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm",
                  "transition-colors duration-[var(--transition-fast)]",
                  "group relative",
                  isActive
                    ? "bg-[var(--color-brand-orange)] text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                )
              }
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && (
                <span className="truncate font-medium">{label}</span>
              )}
              {/* Tooltip  collapse */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--color-text-primary)] text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Role indicator + collapse toggle */}
        <div className="px-2 pb-2 border-t border-white/10 pt-2 shrink-0 space-y-1">
          {!collapsed && userRole && (
            <div className="px-3 py-1">
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium",
                  ROLE_BADGE_COLORS[userRole],
                )}
              >
                {ROLE_LABELS[userRole]}
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-[var(--radius-md)] text-white/50 hover:bg-white/10 hover:text-white transition-colors text-sm"
          >
            <ChevronLeft
              size={16}
              className={cn(
                "transition-transform duration-[var(--transition-slow)]",
                collapsed && "rotate-180",
              )}
            />
            {!collapsed && <span>Colapsar</span>}
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-[var(--header-height)] flex items-center justify-between px-6 bg-white border-b border-[var(--color-surface-border)] shrink-0 z-[var(--z-header)]">
          <div className="relative w-72">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            />
            <input
              type="search"
              placeholder="Buscar documentos…"
              className="w-full h-8 pl-9 pr-4 text-sm rounded-[var(--radius-md)] border border-[var(--color-surface-border)] bg-[var(--color-surface)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-orange)] focus:border-transparent transition-all"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const q = (e.target as HTMLInputElement).value.trim();
                  if (q) navigate(`/documents?q=${encodeURIComponent(q)}`);
                }
              }}
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Bell (notifications) — pendent implementation, no visible */}

            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-2.5 px-2 py-1.5 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-secondary)] transition-colors">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-[var(--color-brand-orange)]/30"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[var(--color-brand-orange)] flex items-center justify-center text-white text-xs font-semibold">
                      {initials}
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-xs font-medium text-[var(--color-text-primary)] leading-tight max-w-[120px] truncate">
                      {user?.name}
                    </p>
                    <p className="text-[10px] text-[var(--color-text-muted)] leading-tight max-w-[120px] truncate">
                      {userRole ? ROLE_LABELS[userRole] : user?.email}
                    </p>
                  </div>
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={6}
                  className="w-56 bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-dropdown)] border border-[var(--color-surface-border)] py-1 z-[var(--z-dropdown)] animate-scale-in"
                >
                  <div className="px-3 py-2.5 border-b border-[var(--color-surface-border)] mb-1">
                    <p className="text-xs font-medium text-[var(--color-text-primary)] truncate">
                      {user?.name}
                    </p>
                    <p className="text-[10px] text-[var(--color-text-muted)] truncate mb-1.5">
                      {user?.email}
                    </p>
                    {userRole && (
                      <span
                        className={cn(
                          "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium",
                          ROLE_BADGE_COLORS[userRole],
                        )}
                      >
                        {ROLE_LABELS[userRole]}
                      </span>
                    )}
                  </div>

                  <DropdownMenu.Item
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--color-text-secondary)] cursor-pointer hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)] outline-none"
                    onSelect={() => navigate("/settings")}
                  >
                    <Settings size={14} />
                    Configuración
                  </DropdownMenu.Item>

                  <DropdownMenu.Separator className="my-1 border-t border-[var(--color-surface-border)]" />

                  <DropdownMenu.Item
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--color-status-error)] cursor-pointer hover:bg-red-50 outline-none"
                    onSelect={handleLogout}
                  >
                    <LogOut size={14} />
                    Cerrar sesión
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[var(--color-surface)]">
          {children}
        </main>
      </div>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="font-display text-2xl text-[var(--color-text-primary)]">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
