import * as RadixToast from "@radix-ui/react-toast";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";
import { create } from "zustand";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastStore {
  toasts: Toast[];
  add: (toast: Omit<Toast, "id">) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (toast) =>
    set((s) => ({
      toasts: [
        ...s.toasts,
        { ...toast, id: Math.random().toString(36).slice(2) },
      ],
    })),
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().add({ type: "success", title, description }),
  error: (title: string, description?: string) =>
    useToastStore.getState().add({ type: "error", title, description }),
  warning: (title: string, description?: string) =>
    useToastStore.getState().add({ type: "warning", title, description }),
  info: (title: string, description?: string) =>
    useToastStore.getState().add({ type: "info", title, description }),
};

const icons: Record<ToastType, React.ReactNode> = {
  success: (
    <CheckCircle size={16} className="text-[var(--color-status-success)]" />
  ),
  error: <XCircle size={16} className="text-[var(--color-status-error)]" />,
  warning: (
    <AlertCircle size={16} className="text-[var(--color-status-warning)]" />
  ),
  info: <AlertCircle size={16} className="text-[var(--color-status-info)]" />,
};

const colors: Record<ToastType, string> = {
  success: "border-l-[var(--color-status-success)]",
  error: "border-l-[var(--color-status-error)]",
  warning: "border-l-[var(--color-status-warning)]",
  info: "border-l-[var(--color-status-info)]",
};

export function ToastProvider() {
  const { toasts, remove } = useToastStore();
  return (
    <RadixToast.Provider swipeDirection="right">
      {toasts.map((t) => (
        <RadixToast.Root
          key={t.id}
          open={true}
          onOpenChange={(open) => !open && remove(t.id)}
          duration={4000}
          className={cn(
            "flex items-start gap-3 bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-dialog)]",
            "p-4 border border-[var(--color-surface-border)] border-l-4",
            "data-[state=open]:animate-slide-in-right",
            colors[t.type],
          )}
        >
          <span className="mt-0.5 shrink-0">{icons[t.type]}</span>
          <div className="flex-1 min-w-0">
            <RadixToast.Title className="text-sm font-medium text-[var(--color-text-primary)]">
              {t.title}
            </RadixToast.Title>
            {t.description && (
              <RadixToast.Description className="text-xs text-[var(--color-text-muted)] mt-0.5">
                {t.description}
              </RadixToast.Description>
            )}
          </div>
          <RadixToast.Close
            className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
            onClick={() => remove(t.id)}
          >
            <X size={12} />
          </RadixToast.Close>
        </RadixToast.Root>
      ))}
      <RadixToast.Viewport className="fixed bottom-6 right-6 flex flex-col gap-2 w-80 z-[var(--z-toast)]" />
    </RadixToast.Provider>
  );
}
