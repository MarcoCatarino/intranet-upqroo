import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info" | "orange";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  const variants = {
    default:
      "bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]",
    success: "bg-green-100 text-[var(--color-status-success)]",
    warning: "bg-amber-100 text-[var(--color-status-warning)]",
    error: "bg-red-100 text-[var(--color-status-error)]",
    info: "bg-blue-100 text-[var(--color-status-info)]",
    orange: "bg-orange-100 text-[var(--color-brand-orange-dark)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-sm)] px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" };
  return (
    <svg
      className={cn(
        "animate-spin text-[var(--color-brand-orange)]",
        sizes[size],
        className,
      )}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export function Divider({ className }: { className?: string }) {
  return (
    <hr className={cn("border-[var(--color-surface-border)]", className)} />
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      {icon && (
        <div className="text-[var(--color-text-muted)] mb-2">{icon}</div>
      )}
      <p className="text-[var(--color-text-primary)] font-medium text-sm">
        {title}
      </p>
      {description && (
        <p className="text-[var(--color-text-muted)] text-xs max-w-xs">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
