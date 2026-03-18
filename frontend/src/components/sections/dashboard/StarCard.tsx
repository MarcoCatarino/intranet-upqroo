interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
  small?: boolean;
}

export function StatCard({ icon, label, value, bg, small }: StatCardProps) {
  return (
    <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-5">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-9 h-9 rounded-[var(--radius-md)] ${bg} flex items-center justify-center`}
        >
          {icon}
        </div>
      </div>
      <p
        className={`font-display text-[var(--color-text-primary)] font-bold mb-0.5 ${small ? "text-base" : "text-2xl"}`}
      >
        {value}
      </p>
      <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
    </div>
  );
}
