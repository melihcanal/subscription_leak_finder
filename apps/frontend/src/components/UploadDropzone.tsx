import { useCallback, useId, useRef, useState } from "react";

type UploadDropzoneProps = {
  onFileSelected: (file: File) => void;
  isUploading?: boolean;
};

export default function UploadDropzone({ onFileSelected, isUploading = false }: Readonly<UploadDropzoneProps>) {
  const inputId = useId();
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
    <label
      htmlFor={inputId}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed p-10 text-center transition ${
        isDragOver
          ? "border-accent bg-accent/5"
          : "border-slate-200 bg-white/70 hover:border-slate-300"
      } ${isUploading ? "cursor-not-allowed opacity-70" : ""}`}
      onDragOver={(event) => {
        event.preventDefault();
        if (!isUploading) {
          setIsDragOver(true);
        }
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragOver(false);
        if (!isUploading) {
          handleFile(event.dataTransfer.files[0] ?? null);
        }
      }}
    >
      <p className="text-lg font-medium text-ink">Drop your CSV here</p>
      <p className="mt-2 text-sm text-slate-500">Format: `date, description, amount`</p>
      <span
        className={`mt-6 inline-flex rounded-full border border-ink px-5 py-2 text-sm font-medium text-ink transition ${
          isUploading ? "opacity-50" : "hover:bg-ink hover:text-white"
        }`}
      >
        {isUploading ? "Uploading..." : "Select CSV"}
      </span>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        disabled={isUploading}
        onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
      />
    </label>
  );
}
