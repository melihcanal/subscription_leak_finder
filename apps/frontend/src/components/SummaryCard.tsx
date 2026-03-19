import type {SubscriptionSummary} from "@slf/shared";
import {Card, CardBody} from "@heroui/react";

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2
    }).format(value);
}

type SummaryCardProps = {
    summary: SubscriptionSummary;
};

export default function SummaryCard({summary}: Readonly<SummaryCardProps>) {
    return (
        <Card className="bg-ink text-white shadow-soft">
            <CardBody>
                <p className="text-xs font-mono uppercase tracking-[0.3em] text-white/60">Monthly spend</p>
                <p className="mt-3 text-3xl font-semibold">{formatCurrency(summary.totalMonthlyCost)}</p>
                <p className="mt-2 text-sm text-white/70">{summary.subscriptionCount} subscriptions detected</p>
            </CardBody>
        </Card>
    );
}
