import {useQuery} from "@tanstack/react-query";
import {useAuth} from "@clerk/react";
import {Button, Card, CardBody} from "@heroui/react";
import {Link as RouterLink} from "react-router-dom";
import {fetchSubscriptions, fetchSummary} from "../api/client";
import SubscriptionCard from "../components/SubscriptionCard";
import SummaryCard from "../components/SummaryCard";

export default function DashboardPage() {
  const {getToken, isSignedIn, isLoaded} = useAuth();

  const summaryQuery = useQuery({
    queryKey: ["summary"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required.");
      }
      return fetchSummary(token);
    },
    enabled: isSignedIn
  });

  const subscriptionsQuery = useQuery({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required.");
      }
      return fetchSubscriptions(token);
    },
    enabled: isSignedIn
  });

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
            <p className="text-sm text-slate-500">Sign in to view your dashboard.</p>
            <Button as={RouterLink} to="/sign-in" color="primary">
              Sign in
            </Button>
          </CardBody>
        </Card>
    );
  }

  return (
    <div className="space-y-6">
      {summaryQuery.isLoading || subscriptionsQuery.isLoading ? (
          <Card className="border border-slate-200">
            <CardBody className="text-sm text-slate-500">Loading dashboard...</CardBody>
          </Card>
      ) : null}

      {(summaryQuery.isError || subscriptionsQuery.isError) && (
          <Card className="border border-rose-200 bg-rose-50">
            <CardBody className="text-sm text-rose-600">
              {((summaryQuery.error || subscriptionsQuery.error) as Error).message}
            </CardBody>
          </Card>
      )}

      {!summaryQuery.isLoading && !subscriptionsQuery.isLoading && !summaryQuery.isError && !subscriptionsQuery.isError && (
          <>
            <SummaryCard summary={summaryQuery.data ?? {totalMonthlyCost: 0, subscriptionCount: 0}}/>

            <Card className="border border-slate-200">
              <CardBody className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-ink">Recurring subscriptions</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Focus on the ones you no longer need. Potentially unnecessary items are flagged.
                  </p>
                </div>

                <div className="space-y-4">
                  {(subscriptionsQuery.data ?? []).length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                        No subscriptions detected yet. Upload a CSV to get started.
                      </div>
                  ) : (
                      subscriptionsQuery.data!.map((subscription) => (
                          <SubscriptionCard key={`${subscription.merchantName}-${subscription.lastPaymentDate}`}
                                            subscription={subscription}/>
                      ))
                  )}
                </div>
              </CardBody>
            </Card>
          </>
      )}
    </div>
  );
}
