import {useId, useRef, useState} from "react";

type UploadDropzoneProps = {
    onFileSelected: (file: File) => void;
    isUploading?: boolean;
};

export default function UploadDropzone({onFileSelected, isUploading = false}: Readonly<UploadDropzoneProps>) {
    const inputId = useId();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const openFilePicker = () => {
        if (isUploading) {
            return;
        }
        if (inputRef.current) {
            inputRef.current.value = "";
            inputRef.current.click();
        }
    };

    const handleFile = (file: File | null) => {
        if (!file || isUploading) {
            return;
        }
        onFileSelected(file);
    };

    return (
        <>
            <button
                type="button"
                className={`flex w-full flex-col items-center justify-center rounded-2xl border border-dashed p-10 text-center transition ${
                    isDragOver
                        ? "border-accent bg-accent/5"
                        : "border-slate-200 bg-white/70 hover:border-slate-300"
                } ${isUploading ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
                disabled={isUploading}
                onClick={openFilePicker}
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
                    handleFile(event.dataTransfer.files[0] ?? null);
                }}
            >
                <p className="text-lg font-medium text-ink">Drop your CSV here</p>
                <p className="mt-2 text-sm text-slate-500">Format: `date, description, amount`</p>
                <span className="mt-6 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                    {isUploading ? "Uploading..." : "Select CSV"}
                </span>
            </button>
            <input
                id={inputId}
                ref={inputRef}
                type="file"
                accept=".csv"
                className="hidden"
                disabled={isUploading}
                onClick={(event) => {
                    const target = event.currentTarget;
                    target.value = "";
                }}
                onChange={(event) => {
                    handleFile(event.target.files?.[0] ?? null);
                    event.target.value = "";
                }}
            />
        </>
    );
}
