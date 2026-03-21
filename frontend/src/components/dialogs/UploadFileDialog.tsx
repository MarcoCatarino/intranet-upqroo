import { useRef, useState } from "react";
import {
  Upload,
  FileText,
  FileSpreadsheet,
  Presentation,
  X,
} from "lucide-react";
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

const FILE_TYPE_CONFIG: Record<
  string,
  {
    icon: React.ElementType;
    color: string;
    bgColor: string;
    label: string;
  }
> = {
  "application/pdf": {
    icon: FileText,
    color: "text-red-500",
    bgColor: "bg-red-50",
    label: "PDF",
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    icon: FileText,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    label: "Word",
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
    icon: FileSpreadsheet,
    color: "text-green-500",
    bgColor: "bg-green-50",
    label: "Excel",
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
    icon: Presentation,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    label: "PowerPoint",
  },
};

const ALLOWED_MIME_TYPES = Object.keys(FILE_TYPE_CONFIG);

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".xlsx", ".pptx"];

function getFileConfig(file: File) {
  return FILE_TYPE_CONFIG[file.type] ?? FILE_TYPE_CONFIG["application/pdf"];
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

  const validateFile = (f: File): string | null => {
    if (!ALLOWED_MIME_TYPES.includes(f.type)) {
      return "Solo se permiten archivos PDF, Word (.docx), Excel (.xlsx) y PowerPoint (.pptx)";
    }

    const ext = "." + f.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return "Extensión de archivo no permitida";
    }

    if (f.size > 20 * 1024 * 1024) {
      return "El archivo no puede superar 20 MB";
    }

    return null;
  };

  const handleFile = (f: File) => {
    setError("");
    const validationError = validateFile(f);
    if (validationError) {
      setError(validationError);
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

  const fileConfig = file ? getFileConfig(file) : null;
  const FileIcon = fileConfig?.icon ?? FileText;

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
          accept=".pdf,.docx,.xlsx,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {file && fileConfig ? (
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center",
                fileConfig.bgColor,
              )}
            >
              <FileIcon size={20} className={fileConfig.color} />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate max-w-[200px]">
                  {file.name}
                </p>
                <span
                  className={cn(
                    "text-[10px] font-medium px-1.5 py-0.5 rounded",
                    fileConfig.bgColor,
                    fileConfig.color,
                  )}
                >
                  {fileConfig.label}
                </span>
              </div>
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
              o haz clic para seleccionar
            </p>

            {/* Tipos permitidos */}
            <div className="flex items-center gap-2 mt-3">
              {[
                { label: "PDF", bg: "bg-red-100", text: "text-red-600" },
                { label: "Word", bg: "bg-blue-100", text: "text-blue-600" },
                { label: "Excel", bg: "bg-green-100", text: "text-green-600" },
                { label: "PPT", bg: "bg-orange-100", text: "text-orange-600" },
              ].map(({ label, bg, text }) => (
                <span
                  key={label}
                  className={cn(
                    "text-[10px] font-medium px-1.5 py-0.5 rounded",
                    bg,
                    text,
                  )}
                >
                  {label}
                </span>
              ))}
              <span className="text-[10px] text-[var(--color-text-muted)]">
                · Máx. 20 MB
              </span>
            </div>
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
