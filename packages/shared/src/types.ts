export type RawTransaction = {
  date: string;
  description: string;
  amount: string;
};

export type NormalizedTransaction = {
  date: Date;
  dateIso: string;
  description: string;
  merchant: string;
  merchantKey: string;
  amount: number;
  tokens: string[];
};

export type DetectedSubscription = {
  merchantName: string;
  avgAmount: number;
  frequencyDays: number;
  lastPaymentDate: string;
  monthlyCost: number;
  occurrences: number;
  isPotentiallyUnnecessary: boolean;
};

export type SubscriptionSummary = {
  totalMonthlyCost: number;
  subscriptionCount: number;
};

export type UploadResponse = {
  uploadId: string;
  summary: SubscriptionSummary;
};

export type SubscriptionsResponse = {
  subscriptions: DetectedSubscription[];
};

export type SummaryResponse = SubscriptionSummary;

export type ApiError = {
  error: string;
  details?: string;
};
