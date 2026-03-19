import {useCallback, useId, useState} from "react";
import {Button} from "@heroui/react";

type UploadDropzoneProps = {
    onFileSelected: (file: File) => void;
    isUploading?: boolean;
};

export default function UploadDropzone({onFileSelected, isUploading = false}: Readonly<UploadDropzoneProps>) {
    const inputId = useId();
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
            <Button className="mt-6" color="primary" variant="flat" isDisabled={isUploading}>
                {isUploading ? "Uploading..." : "Select CSV"}
            </Button>
            <input
                id={inputId}
                type="file"
                accept=".csv"
                className="hidden"
                disabled={isUploading}
                onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
            />
        </label>
    );
}
