import { useQuery } from "@tanstack/react-query";
import { fetchSubscriptions, fetchSummary } from "../api/client";
import SubscriptionCard from "../components/SubscriptionCard";
import SummaryCard from "../components/SummaryCard";

export default function DashboardPage() {
  const summaryQuery = useQuery({ queryKey: ["summary"], queryFn: fetchSummary });
  const subscriptionsQuery = useQuery({
    queryKey: ["subscriptions"],
    queryFn: fetchSubscriptions
  });

  if (summaryQuery.isLoading || subscriptionsQuery.isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        Loading dashboard...
      </div>
    );
  }

  if (summaryQuery.isError || subscriptionsQuery.isError) {
    const error = (summaryQuery.error || subscriptionsQuery.error) as Error;
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-600">
        {error.message}
      </div>
    );
  }

  const summary = summaryQuery.data ?? { totalMonthlyCost: 0, subscriptionCount: 0 };
  const subscriptions = subscriptionsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <SummaryCard summary={summary} />

      <section className="rounded-3xl border border-slate-200 bg-white p-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="text-xl font-semibold text-ink">Recurring subscriptions</h2>
            <p className="mt-2 text-sm text-slate-500">
              Focus on the ones you no longer need. Potentially unnecessary items are flagged.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {subscriptions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
              No subscriptions detected yet. Upload a CSV to get started.
            </div>
          ) : (
            subscriptions.map((subscription) => (
              <SubscriptionCard key={`${subscription.merchantName}-${subscription.lastPaymentDate}`} subscription={subscription} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
