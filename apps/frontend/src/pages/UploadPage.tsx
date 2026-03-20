import {useState} from "react";
import {Link as RouterLink} from "react-router-dom";
import {useAuth} from "@clerk/react";
import {Button, Card, CardBody, CardHeader} from "@heroui/react";
import type {UploadResponse} from "@slf/shared";
import UploadDropzone from "../components/UploadDropzone";
import IntroSection from "../components/IntroSection";
import {csvSamples, workflowSteps} from "../data/uploadContent";
import {useUpload} from "../hooks/useUpload";

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

    const resetUploadState = () => {
        uploadMutation.reset();
        setSelectedFile(null);
        setUploaded(null);
    };

    const handleFile = (file: File) => {
        resetUploadState();
        setSelectedFile(file);
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
        return <IntroSection/>;
    }

    return (
        <div className="space-y-8">
            <Card className="overflow-hidden border border-slate-200 bg-white/90 shadow-soft">
                <CardBody className="gap-6 p-8 md:p-10">
                    <div className="space-y-3">
                        <p className="text-xs font-mono uppercase tracking-[0.24em] text-slate-400">Upload flow</p>
                        <h2 className="text-3xl font-semibold tracking-tight text-ink">Upload your bank CSV</h2>
                        <p className="max-w-2xl text-sm leading-6 text-slate-600">
                            We scan for monthly patterns, group recurring merchants, and turn raw transaction history
                            into a clean subscription view.
                        </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        {workflowSteps.map((step, index) => (
                            <div key={step.title} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                                <p className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400">Step {index + 1}</p>
                                <h3 className="mt-3 text-base font-semibold text-ink">{step.title}</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>

            <Card className={uploaded ? "border border-ink bg-ink text-white" : "border border-slate-200 bg-white/90"}>
                <CardHeader className="flex flex-col items-start gap-2 px-6 pt-6">
                    <h3 className={`text-xl font-semibold ${uploaded ? "text-white" : "text-ink"}`}>
                        {uploaded ? "Upload complete" : "Drop your file here"}
                    </h3>
                    <p className={`text-sm ${uploaded ? "text-white/70" : "text-slate-500"}`}>
                        {uploaded
                            ? "Your CSV was processed successfully. You can continue to the dashboard or upload a new file."
                            : "Required columns: `date`, `description`, `amount`"}
                    </p>
                </CardHeader>
                <CardBody className="space-y-4 px-6 pb-6">
                    {uploaded ? (
                        <>
                            <h4 className="text-2xl font-semibold">
                                Detected {uploaded.summary.subscriptionCount} subscriptions
                            </h4>
                            <p className="text-sm text-white/70">
                                Estimated monthly cost: ${uploaded.summary.totalMonthlyCost.toFixed(2)}
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Button as={RouterLink} to="/dashboard" color="default" radius="full">
                                    View dashboard
                                </Button>
                                <Button
                                    variant="bordered"
                                    radius="full"
                                    className="border-white/30 text-white"
                                    onPress={resetUploadState}
                                >
                                    Upload another CSV
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <UploadDropzone onFileSelected={handleFile} isUploading={uploadMutation.isPending}/>

                            {selectedFile && (
                                <div
                                    className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                    <div>
                                        <p className="font-medium text-ink">{selectedFile.name}</p>
                                        <p>{formatBytes(selectedFile.size)}</p>
                                    </div>
                                    {uploadMutation.isPending &&
                                        <p className="text-xs uppercase tracking-[0.2em]">Processing</p>}
                                </div>
                            )}

                            {uploadMutation.isError && (
                                <div
                                    className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                                    {(uploadMutation.error as Error).message}
                                </div>
                            )}
                        </>
                    )}
                </CardBody>
            </Card>

            <Card className="border border-slate-200 bg-white/90">
                <CardHeader className="flex flex-col items-start gap-2 px-6 pt-6">
                    <p className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400">CSV examples</p>
                    <h3 className="text-lg font-semibold text-ink">Accepted input shapes</h3>
                </CardHeader>
                <CardBody className="grid gap-4 px-6 pb-6 lg:grid-cols-3">
                    {csvSamples.map((sample) => (
                        <div key={sample.title}
                             className="min-w-0 rounded-2xl border border-slate-200 bg-slate-950 p-5 text-slate-100">
                            <p className="text-xs font-mono uppercase tracking-[0.18em] text-slate-400">{sample.title}</p>
                            <pre
                                className="mt-3 overflow-x-auto text-sm leading-7 text-slate-200">{sample.content}</pre>
                        </div>
                    ))}
                </CardBody>
            </Card>

            <Card className="border border-slate-200 bg-white/90">
                <CardHeader className="flex flex-col items-start gap-2 px-6 pt-6">
                    <p className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400">Storage</p>
                    <h3 className="text-lg font-semibold text-ink">Built for private review</h3>
                </CardHeader>
                <CardBody className="grid gap-3 px-6 pb-6 text-sm leading-6 text-slate-600 md:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        CSV files are stored in R2 and processed into normalized transactions.
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        The dashboard focuses on recurring patterns instead of showing every raw line item.
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
