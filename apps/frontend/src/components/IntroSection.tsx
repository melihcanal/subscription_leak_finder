import {Link as RouterLink} from "react-router-dom";
import {Button, Card, CardBody, CardHeader} from "@heroui/react";
import {csvSamples, dashboardBenefits, workflowSteps} from "../data/uploadContent";

export default function IntroSection() {
    return (
        <section className="space-y-6">
            <Card className="overflow-hidden border border-slate-200 bg-white/90 shadow-soft">
                <CardBody className="gap-6 p-8 md:p-10">
                    <div className="space-y-4">
                        <p className="text-xs font-mono uppercase tracking-[0.24em] text-slate-400">What this app
                            does</p>
                        <div className="max-w-3xl space-y-3">
                            <h2 className="text-3xl font-semibold tracking-tight text-ink md:text-4xl">
                                Find recurring subscription leaks hidden inside your bank history.
                            </h2>
                            <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                                Upload a CSV export of your transactions. Subscription Leak Finder scans recurring
                                charges,
                                groups them by merchant, estimates your monthly spend, and shows which subscriptions may
                                be unnecessary.
                            </p>
                        </div>
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
                    <div className="flex flex-wrap gap-3">
                        <Button as={RouterLink} to="/sign-up" color="primary" radius="full">
                            Create account
                        </Button>
                        <Button as={RouterLink} to="/sign-in" variant="bordered" radius="full">
                            Sign in
                        </Button>
                    </div>
                </CardBody>
            </Card>

            <Card className="border border-slate-200 bg-white/90">
                <CardHeader className="flex flex-col items-start gap-2 px-6 pt-6">
                    <p className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400">CSV format</p>
                    <h3 className="text-lg font-semibold text-ink">The input should look like this</h3>
                    <p className="text-sm text-slate-500">Required columns: `date`, `description`, `amount`</p>
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
                    <p className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400">What you get</p>
                    <h3 className="text-lg font-semibold text-ink">A focused dashboard, not a spreadsheet dump</h3>
                </CardHeader>
                <CardBody className="grid gap-3 px-6 pb-6 text-sm leading-6 text-slate-600 md:grid-cols-2">
                    {dashboardBenefits.map((benefit) => (
                        <div key={benefit} className="rounded-2xl bg-slate-50 px-4 py-3">
                            {benefit}
                        </div>
                    ))}
                </CardBody>
            </Card>
        </section>
    );
}
