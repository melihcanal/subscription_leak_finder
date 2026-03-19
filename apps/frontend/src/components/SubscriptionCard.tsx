import type {DetectedSubscription} from "@slf/shared";
import {Card, CardBody, Chip} from "@heroui/react";

type SubscriptionCardProps = {
    subscription: DetectedSubscription;
};

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2
    }).format(value);
}

export default function SubscriptionCard({subscription}: Readonly<SubscriptionCardProps>) {
    return (
        <Card className="border border-slate-200">
            <CardBody>
                <div className="flex items-start justify-between gap-6">
                    <div>
                        <h3 className="text-lg font-semibold text-ink">{subscription.merchantName}</h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Avg payment {formatCurrency(subscription.avgAmount)} �
                            every {subscription.frequencyDays} days
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-semibold text-ink">{formatCurrency(subscription.monthlyCost)}</p>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Monthly</p>
                    </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <Chip size="sm" variant="flat">
                        Last payment {subscription.lastPaymentDate}
                    </Chip>
                    <Chip size="sm" variant="flat">
                        {subscription.occurrences} payments detected
                    </Chip>
                    {subscription.isPotentiallyUnnecessary && (
                        <Chip size="sm" color="danger" variant="flat">
                            Potentially unnecessary
                        </Chip>
                    )}
                </div>
            </CardBody>
        </Card>
    );
}
