import { Badge } from "@/components/ui/Badge";
import { ROLE_LABELS } from "@/types";
import { formatDateTime } from "@/lib/utils";
import type { User } from "@/types";

export function UserTableRow({ user }: { user: User }) {
  const roleBadgeVariant =
    user.role === "admin"
      ? "warning"
      : user.role === "secretary"
        ? "info"
        : user.role === "director"
          ? "orange"
          : "default";

  return (
    <div className="grid grid-cols-[40px_1fr_220px_80px_140px] px-5 py-3.5 items-center hover:bg-[var(--color-surface-secondary)] transition-colors">
      <div>
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-7 h-7 rounded-full object-cover"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-[var(--color-brand-orange)]/20 flex items-center justify-center text-[var(--color-brand-orange)] text-xs font-semibold">
            {user.name[0]}
          </div>
        )}
      </div>
      <span className="text-sm font-medium text-[var(--color-text-primary)]">
        {user.name}
      </span>
      <span className="text-sm text-[var(--color-text-muted)] truncate">
        {user.email}
      </span>
      <Badge variant={roleBadgeVariant}>
        {ROLE_LABELS[user.role] ?? user.role}
      </Badge>
      <span className="text-xs text-[var(--color-text-muted)]">
        {user.createdAt ? formatDateTime(user.createdAt).split(",")[0] : "—"}
      </span>
    </div>
  );
}
