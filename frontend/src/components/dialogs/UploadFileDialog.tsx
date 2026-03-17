// UploadFileDialog.tsx
import { useRef, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Dialog, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { documentsApi } from "@/services/api";
import { toast } from "@/components/ui/Toast";
import { formatFileSize, cn } from "@/lib/utils";

interface UploadFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: number;
  documentTitle: string;
  onSuccess: () => void;
}

export function UploadFileDialog({
  open,
  onOpenChange,
  documentId,
  documentTitle,
  onSuccess,
}: UploadFileDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setError("");
    if (f.type !== "application/pdf") {
      setError("Solo se permiten archivos PDF");
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      setError("El archivo no puede superar 20 MB");
      return;
    }
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsLoading(true);
    try {
      await documentsApi.upload(documentId, file);
      toast.success("Archivo subido", "El archivo está siendo procesado");
      onSuccess();
      onOpenChange(false);
      setFile(null);
    } catch (err) {
      toast.error("Error al subir", (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFile(null);
      setError("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
      title="Subir archivo"
      description={`Subir nueva versión para: ${documentTitle}`}
    >
      <div
        className={cn(
          "relative border-2 border-dashed rounded-[var(--radius-lg)] transition-colors",
          "flex flex-col items-center justify-center py-10 px-6 text-center cursor-pointer",
          isDragging
            ? "border-[var(--color-brand-orange)] bg-orange-50"
            : "border-[var(--color-surface-border)] hover:border-[var(--color-brand-orange)]/50 hover:bg-[var(--color-surface-secondary)]",
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        {file ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-red-50 flex items-center justify-center">
              <FileText size={20} className="text-red-500" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-[var(--color-text-primary)] truncate max-w-[220px]">
                {file.name}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                {formatFileSize(file.size)}
              </p>
            </div>
            <button
              className="ml-2 p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-status-error)] transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--color-surface-tertiary)] flex items-center justify-center mb-3">
              <Upload size={22} className="text-[var(--color-text-muted)]" />
            </div>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              Arrastra el archivo aquí
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              o haz clic para seleccionar · Solo PDF · Máx. 20 MB
            </p>
          </>
        )}
      </div>
      {error && (
        <p className="mt-2 text-xs text-[var(--color-status-error)]">{error}</p>
      )}
      <DialogFooter>
        <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button onClick={handleUpload} disabled={!file} isLoading={isLoading}>
          <Upload size={14} /> Subir archivo
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
