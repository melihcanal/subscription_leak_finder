import type { SubscriptionSummary } from "@slf/shared";

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

export default function SummaryCard({ summary }: Readonly<SummaryCardProps>) {
  return (
    <div className="rounded-2xl border border-ink bg-ink p-6 text-white shadow-soft">
      <p className="text-xs font-mono uppercase tracking-[0.3em] text-white/60">Monthly spend</p>
      <p className="mt-3 text-3xl font-semibold">{formatCurrency(summary.totalMonthlyCost)}</p>
      <p className="mt-2 text-sm text-white/70">{summary.subscriptionCount} subscriptions detected</p>
    </div>
  );
}
