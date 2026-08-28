import { useRef, useState } from "react";
import { UploadCloud, X, FileCheck2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
  error?: boolean;
}

export function FileUpload({ label, file, onChange, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function handleFile(f: File | null) {
    if (preview) URL.revokeObjectURL(preview);
    if (f && f.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
    onChange(f);
  }

  return (
    <div className="space-y-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {file ? (
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl border border-border bg-secondary/50 p-3",
            error && "border-destructive",
          )}
        >
          {preview ? (
            <img
              src={preview}
              alt={label}
              className="h-12 w-12 shrink-0 rounded-lg border border-border object-cover"
            />
          ) : (
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <FileCheck2 className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(0)} KB · ready to upload
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleFile(null)}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-destructive"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl border border-dashed border-border bg-secondary/30 p-3 text-left transition-colors hover:border-primary/50 hover:bg-secondary/60",
            error && "border-destructive",
          )}
        >
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <UploadCloud className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Tap to upload</p>
            <p className="text-xs text-muted-foreground">JPG, PNG or PDF · up to 5 MB</p>
          </div>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,application/pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
