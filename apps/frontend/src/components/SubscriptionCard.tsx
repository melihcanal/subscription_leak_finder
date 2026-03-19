import type { DetectedSubscription } from "@slf/shared";

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

export default function SubscriptionCard({ subscription }: Readonly<SubscriptionCardProps>) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h3 className="text-lg font-semibold text-ink">{subscription.merchantName}</h3>
          <p className="mt-1 text-sm text-slate-500">
            Avg payment {formatCurrency(subscription.avgAmount)} ? every {subscription.frequencyDays} days
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold text-ink">{formatCurrency(subscription.monthlyCost)}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Monthly</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span className="rounded-full bg-slate-100 px-3 py-1">Last payment {subscription.lastPaymentDate}</span>
        <span className="rounded-full bg-slate-100 px-3 py-1">{subscription.occurrences} payments detected</span>
        {subscription.isPotentiallyUnnecessary && (
          <span className="rounded-full bg-blush px-3 py-1 text-rose-600">Potentially unnecessary</span>
        )}
      </div>
    </div>
  );
}
