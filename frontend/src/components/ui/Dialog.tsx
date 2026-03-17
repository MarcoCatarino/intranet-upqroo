import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  size = "md",
}: DialogProps) {
  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[var(--z-dialog)] data-[state=open]:animate-fade-in" />
        <RadixDialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            "w-full bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-dialog)]",
            "z-[var(--z-dialog)] p-6 focus:outline-none",
            "data-[state=open]:animate-scale-in",
            sizes[size],
            className,
          )}
        >
          <div className="flex items-start justify-between mb-5">
            <div>
              <RadixDialog.Title className="font-display text-xl text-[var(--color-text-primary)]">
                {title}
              </RadixDialog.Title>
              {description && (
                <RadixDialog.Description className="text-sm text-[var(--color-text-muted)] mt-1">
                  {description}
                </RadixDialog.Description>
              )}
            </div>
            <RadixDialog.Close className="ml-4 p-1.5 rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-surface-secondary)] transition-colors">
              <X size={16} />
            </RadixDialog.Close>
          </div>
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

export function DialogFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2 mt-6 pt-4 border-t border-[var(--color-surface-border)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
