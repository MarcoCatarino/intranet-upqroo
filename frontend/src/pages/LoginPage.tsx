import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/services/api";
import { toast } from "@/components/ui/Toast";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          renderButton: (el: HTMLElement, config: object) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

export function LoginPage() {
  const navigate = useNavigate();
  const { setUser, isAuthenticated } = useAuthStore();
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated]);

  useEffect(() => {
    const initGoogle = () => {
      if (!window.google || !googleBtnRef.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: { credential: string }) => {
          setIsLoading(true);
          try {
            const result = await authApi.loginWithGoogle(response.credential);
            setUser(result.user);
            toast.success("Bienvenido", result.user.name);
            navigate("/dashboard", { replace: true });
          } catch (err) {
            toast.error(
              "Error al iniciar sesión",
              (err as Error).message ||
                "Verifica que uses tu correo institucional",
            );
          } finally {
            setIsLoading(false);
          }
        },
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        text: "signin_with",
        width: 280,
        locale: "es",
      });
    };
    if (!window.google) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      document.head.appendChild(script);
    } else {
      initGoogle();
    }
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex">
      <div className="w-[420px] bg-[var(--color-brand-brown-dark)] flex flex-col justify-between p-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-brand-orange)] flex items-center justify-center">
            <span className="font-display font-bold text-white text-lg">U</span>
          </div>
          <div>
            <p className="font-display text-white font-semibold leading-tight">
              UPQROO
            </p>
            <p className="text-white/50 text-[11px] leading-tight">
              Intranet de Documentos
            </p>
          </div>
        </div>
        <div className="space-y-6 animate-fade-in">
          <div className="w-12 h-1 bg-[var(--color-brand-orange)] rounded-full" />
          <h2 className="font-display text-3xl text-white leading-snug">
            Gestión documental
            <br />
            <span className="text-[var(--color-brand-orange-light)]">
              institucional
            </span>
          </h2>
          <p className="text-white/60 text-sm leading-relaxed">
            Accede, comparte y administra los documentos oficiales de la
            Universidad Politécnica de Quintana Roo de forma segura.
          </p>
        </div>
        <div className="space-y-3">
          {[
            "Versionado de documentos",
            "Distribución por departamento",
            "Permisos granulares",
            "Auditoría de accesos",
          ].map((f) => (
            <div key={f} className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-orange)] shrink-0" />
              <span className="text-white/60 text-sm">{f}</span>
            </div>
          ))}
        </div>
        <p className="text-white/30 text-xs">
          © {new Date().getFullYear()} UPQROO — Sistema interno
        </p>
      </div>
      <div className="flex-1 flex items-center justify-center p-10">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="w-8 h-1 bg-[var(--color-brand-orange)] rounded-full mb-8" />
          <h1 className="font-display text-3xl text-[var(--color-text-primary)] mb-2">
            Iniciar sesión
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mb-10">
            Usa tu cuenta de correo institucional{" "}
            <span className="font-medium text-[var(--color-brand-brown)]">
              @upqroo.edu.mx
            </span>
          </p>
          <div className="mb-6">
            {isLoading ? (
              <div className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
                <svg
                  className="animate-spin h-4 w-4 text-[var(--color-brand-orange)]"
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
                Verificando credenciales…
              </div>
            ) : (
              <div ref={googleBtnRef} />
            )}
          </div>
          <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-surface-secondary)] border border-[var(--color-surface-border)]">
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              <span className="font-medium text-[var(--color-text-secondary)]">
                Acceso restringido.
              </span>{" "}
              Solo se permiten cuentas con dominio institucional de la UPQROO.
              Si tienes problemas, contacta al área de sistemas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
