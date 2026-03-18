import { Link } from "react-router-dom";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function QuickUploadBanner() {
  return (
    <div className="mt-6 p-5 bg-[var(--color-brand-brown-dark)] rounded-[var(--radius-xl)] flex items-center justify-between">
      <div>
        <p className="font-display text-white text-lg">
          ¿Necesitas subir un documento?
        </p>
        <p className="text-white/60 text-sm mt-0.5">
          Crea un nuevo documento y sube el archivo PDF.
        </p>
      </div>
      <Link to="/documents">
        <Button className="bg-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange-dark)] text-white">
          <Upload size={14} /> Subir documento
        </Button>
      </Link>
    </div>
  );
}
