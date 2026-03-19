import { useState } from "react";
import { Link } from "react-router-dom";
import UploadDropzone from "../components/UploadDropzone";
import { useUpload } from "../hooks/useUpload";
import type { UploadResponse } from "@slf/shared";

function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return "0 B";
  }
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export default function UploadPage() {
  const uploadMutation = useUpload();
  const [uploaded, setUploaded] = useState<UploadResponse | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFile = (file: File) => {
    setSelectedFile(file);
    setUploaded(null);
    uploadMutation.mutate(file, {
      onSuccess: (data) => setUploaded(data)
    });
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-ink">Upload your bank CSV</h2>
        <p className="mt-2 text-sm text-slate-500">
          We scan for monthly patterns, group them by merchant, and surface recurring spend.
        </p>
        <div className="mt-6">
          <UploadDropzone onFileSelected={handleFile} isUploading={uploadMutation.isPending} />
        </div>
        {selectedFile && (
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <div>
              <p className="font-medium text-ink">{selectedFile.name}</p>
              <p>{formatBytes(selectedFile.size)}</p>
            </div>
            {uploadMutation.isPending && <p className="text-xs uppercase tracking-[0.2em]">Processing</p>}
          </div>
        )}
        {uploadMutation.isError && (
          <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {(uploadMutation.error as Error).message}
          </p>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400">Expected columns</p>
          <p className="mt-3 text-sm text-slate-600">`date`, `description`, `amount`</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400">Privacy-first</p>
          <p className="mt-3 text-sm text-slate-600">We store your CSV in private R2 storage and only keep what we need.</p>
        </div>
      </section>

      {uploaded && (
        <section className="rounded-3xl border border-ink bg-ink p-8 text-white">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-white/60">Upload complete</p>
          <h3 className="mt-3 text-2xl font-semibold">
            Detected {uploaded.summary.subscriptionCount} subscriptions
          </h3>
          <p className="mt-2 text-sm text-white/70">
            Estimated monthly cost: ${uploaded.summary.totalMonthlyCost.toFixed(2)}
          </p>
          <Link
            to="/dashboard"
            className="mt-6 inline-flex items-center rounded-full bg-white px-5 py-2 text-sm font-medium text-ink"
          >
            View dashboard
          </Link>
        </section>
      )}
    </div>
  );
}
