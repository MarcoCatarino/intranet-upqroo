import {
  useNavigate,
  useRouteError,
  isRouteErrorResponse,
} from "react-router-dom";
import { FileX, Home, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ErrorLayout() {
  const error = useRouteError();
  const navigate = useNavigate();

  const is404 = isRouteErrorResponse(error) && error.status === 404;
  const is500 = isRouteErrorResponse(error) && error.status >= 500;

  const config = is404
    ? {
        code: "404",
        title: "Página no encontrada",
        description: "La página que buscas no existe o fue movida.",
        icon: <FileX size={48} className="text-[var(--color-brand-orange)]" />,
      }
    : is500
      ? {
          code: "500",
          title: "Error del servidor",
          description: "Algo salió mal en el servidor. Intenta de nuevo.",
          icon: (
            <AlertTriangle
              size={48}
              className="text-[var(--color-status-error)]"
            />
          ),
        }
      : {
          code: "Oops",
          title: "Error inesperado",
          description:
            "Ocurrió un error inesperado. Por favor recarga la página.",
          icon: (
            <AlertTriangle
              size={48}
              className="text-[var(--color-status-warning)]"
            />
          ),
        };

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[var(--color-brand-orange)]/5" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[var(--color-brand-brown)]/5" />
      </div>
      <div className="relative text-center max-w-md px-8 animate-fade-in">
        <div className="flex justify-center mb-6">{config.icon}</div>
        <p className="font-display text-8xl font-bold text-[var(--color-surface-tertiary)] leading-none mb-4">
          {config.code}
        </p>
        <h1 className="font-display text-2xl text-[var(--color-text-primary)] mb-2">
          {config.title}
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-8">
          {config.description}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            <RefreshCw size={14} /> Regresar
          </Button>
          <Button onClick={() => navigate("/dashboard")}>
            <Home size={14} /> Ir al inicio
          </Button>
        </div>
        <div className="mt-12 flex items-center justify-center gap-2 opacity-40">
          <div className="w-5 h-5 rounded bg-[var(--color-brand-orange)] flex items-center justify-center text-white text-[10px] font-bold font-display">
            U
          </div>
          <span className="text-xs text-[var(--color-text-muted)] font-display">
            UPQROO Intranet
          </span>
        </div>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 animate-fade-in">
      <FileX size={40} className="text-[var(--color-text-muted)]" />
      <p className="font-display text-lg text-[var(--color-text-primary)]">
        Página no encontrada
      </p>
      <p className="text-sm text-[var(--color-text-muted)]">
        Esta ruta no existe en el sistema.
      </p>
      <Button variant="ghost" onClick={() => navigate("/dashboard")}>
        <Home size={14} /> Volver al inicio
      </Button>
    </div>
  );
}
