import {useState} from "react";
import {Link as RouterLink} from "react-router-dom";
import {useAuth} from "@clerk/react";
import {Button, Card, CardBody, CardHeader, Link} from "@heroui/react";
import UploadDropzone from "../components/UploadDropzone";
import {useUpload} from "../hooks/useUpload";
import type {UploadResponse} from "@slf/shared";

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
  const {isLoaded, isSignedIn} = useAuth();
  const [uploaded, setUploaded] = useState<UploadResponse | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFile = (file: File) => {
    setSelectedFile(file);
    setUploaded(null);
    uploadMutation.mutate(file, {
      onSuccess: (data) => setUploaded(data)
    });
  };

  if (!isLoaded) {
    return (
        <Card className="border border-slate-200">
          <CardBody className="text-sm text-slate-500">Loading session...</CardBody>
        </Card>
    );
  }

  if (!isSignedIn) {
    return (
        <Card className="border border-slate-200">
          <CardBody className="space-y-4">
            <p className="text-sm text-slate-500">Sign in to upload your CSV and see your dashboard.</p>
            <div className="flex gap-3">
              <Button as={RouterLink} to="/sign-in" color="primary">
                Sign in
              </Button>
              <Button as={RouterLink} to="/sign-up" variant="bordered">
                Create account
              </Button>
            </div>
          </CardBody>
        </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="border border-slate-200">
        <CardHeader className="flex flex-col items-start gap-1">
          <h2 className="text-xl font-semibold text-ink">Upload your bank CSV</h2>
          <p className="text-sm text-slate-500">
            We scan for monthly patterns, group them by merchant, and surface recurring spend.
          </p>
        </CardHeader>
        <CardBody className="space-y-4">
          <UploadDropzone onFileSelected={handleFile} isUploading={uploadMutation.isPending} />

          {selectedFile && (
              <div
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <div>
                  <p className="font-medium text-ink">{selectedFile.name}</p>
                  <p>{formatBytes(selectedFile.size)}</p>
                </div>
                {uploadMutation.isPending && <p className="text-xs uppercase tracking-[0.2em]">Processing</p>}
              </div>
          )}

          {uploadMutation.isError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {(uploadMutation.error as Error).message}
              </div>
          )}
        </CardBody>
      </Card>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="border border-slate-200">
          <CardBody>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400">Expected columns</p>
            <p className="mt-3 text-sm text-slate-600">`date`, `description`, `amount`</p>
          </CardBody>
        </Card>
        <Card className="border border-slate-200">
          <CardBody>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400">Privacy-first</p>
            <p className="mt-3 text-sm text-slate-600">We store your CSV in private R2 storage and only keep what we
              need.</p>
          </CardBody>
        </Card>
      </section>

      {uploaded && (
          <Card className="bg-ink text-white">
            <CardBody className="space-y-3">
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-white/60">Upload complete</p>
              <h3 className="text-2xl font-semibold">
                Detected {uploaded.summary.subscriptionCount} subscriptions
              </h3>
              <p className="text-sm text-white/70">
                Estimated monthly cost: ${uploaded.summary.totalMonthlyCost.toFixed(2)}
              </p>
              <Link as={RouterLink} to="/dashboard" className="text-white underline">
                View dashboard
              </Link>
            </CardBody>
          </Card>
      )}
    </div>
  );
}
