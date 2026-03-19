import { useCallback, useRef, useState } from "react";

type UploadDropzoneProps = {
  onFileSelected: (file: File) => void;
  isUploading?: boolean;
};

export default function UploadDropzone({ onFileSelected, isUploading = false }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File | null) => {
      if (!file) {
        return;
      }
      onFileSelected(file);
    },
    [onFileSelected]
  );

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed p-10 text-center transition ${
        isDragOver
          ? "border-accent bg-accent/5"
          : "border-slate-200 bg-white/70 hover:border-slate-300"
      }`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragOver(false);
        handleFile(event.dataTransfer.files[0] ?? null);
      }}
    >
      <p className="text-lg font-medium text-ink">Drop your CSV here</p>
      <p className="mt-2 text-sm text-slate-500">Format: `date, description, amount`</p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="mt-6 rounded-full border border-ink px-5 py-2 text-sm font-medium text-ink transition hover:bg-ink hover:text-white disabled:opacity-50"
      >
        {isUploading ? "Uploading..." : "Select CSV"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
      />
    </div>
  );
}
