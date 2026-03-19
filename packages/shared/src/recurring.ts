import type { DetectedSubscription, NormalizedTransaction } from "./types";

type DetectionOptions = {
  amountTolerance?: number;
  minOccurrences?: number;
  minIntervalDays?: number;
  maxIntervalDays?: number;
  merchantSimilarityThreshold?: number;
  intervalMatchRatio?: number;
};

type MerchantGroup = {
  display: string;
  tokens: string[];
  transactions: NormalizedTransaction[];
};

type AmountCluster = {
  average: number;
  transactions: NormalizedTransaction[];
};

const DEFAULT_OPTIONS: Required<DetectionOptions> = {
  amountTolerance: 0.05,
  minOccurrences: 2,
  minIntervalDays: 25,
  maxIntervalDays: 35,
  merchantSimilarityThreshold: 0.6,
  intervalMatchRatio: 0.6
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function jaccardSimilarity(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  if (setA.size === 0 && setB.size === 0) {
    return 1;
  }
  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) {
      intersection += 1;
    }
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function groupByMerchant(
  transactions: NormalizedTransaction[],
  threshold: number
): MerchantGroup[] {
  const groups: MerchantGroup[] = [];

  for (const transaction of transactions) {
    let bestGroup: MerchantGroup | null = null;
    let bestScore = 0;

    for (const group of groups) {
      const score = jaccardSimilarity(transaction.tokens, group.tokens);
      if (score > bestScore) {
        bestScore = score;
        bestGroup = group;
      }
    }

    if (bestGroup && bestScore >= threshold) {
      bestGroup.transactions.push(transaction);
      continue;
    }

    groups.push({
      display: transaction.merchant,
      tokens: transaction.tokens,
      transactions: [transaction]
    });
  }

  return groups;
}

function clusterByAmount(transactions: NormalizedTransaction[], tolerance: number): AmountCluster[] {
  const clusters: AmountCluster[] = [];

  for (const transaction of transactions) {
    const amount = Math.abs(transaction.amount);
    let target: AmountCluster | null = null;

    for (const cluster of clusters) {
      const diff = Math.abs(amount - cluster.average);
      if (diff <= cluster.average * tolerance) {
        target = cluster;
        break;
      }
    }

    if (!target) {
      clusters.push({ average: amount, transactions: [transaction] });
    } else {
      target.transactions.push(transaction);
      const total = target.transactions.reduce((sum, item) => sum + Math.abs(item.amount), 0);
      target.average = total / target.transactions.length;
    }
  }

  return clusters;
}

function averageIntervals(dates: Date[]): { intervals: number[]; average: number } {
  const intervals: number[] = [];
  for (let i = 1; i < dates.length; i += 1) {
    const diff = Math.round((dates[i].getTime() - dates[i - 1].getTime()) / MS_PER_DAY);
    intervals.push(diff);
  }
  const total = intervals.reduce((sum, value) => sum + value, 0);
  const average = intervals.length === 0 ? 0 : total / intervals.length;
  return { intervals, average };
}

export function detectSubscriptions(
  transactions: NormalizedTransaction[],
  options: DetectionOptions = {}
): DetectedSubscription[] {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  const filtered = transactions.filter((transaction) => Math.abs(transaction.amount) > 0.01);
  const merchantGroups = groupByMerchant(filtered, settings.merchantSimilarityThreshold);
  const subscriptions: DetectedSubscription[] = [];
  const now = new Date();

  for (const group of merchantGroups) {
    const clusters = clusterByAmount(group.transactions, settings.amountTolerance);

    for (const cluster of clusters) {
      if (cluster.transactions.length < settings.minOccurrences) {
        continue;
      }

      const sorted = [...cluster.transactions].sort((a, b) => a.date.getTime() - b.date.getTime());
      const dates = sorted.map((transaction) => transaction.date);
      const { intervals, average } = averageIntervals(dates);
      if (intervals.length === 0) {
        continue;
      }

      const matching = intervals.filter(
        (interval) => interval >= settings.minIntervalDays && interval <= settings.maxIntervalDays
      );
      const matchRatio = matching.length / intervals.length;
      if (matchRatio < settings.intervalMatchRatio) {
        continue;
      }

      const avgAmount = cluster.average;
      const frequencyDays = Math.max(1, Math.round(average));
      const lastPayment = sorted[sorted.length - 1];
      const daysSinceLast = Math.round((now.getTime() - lastPayment.date.getTime()) / MS_PER_DAY);
      const monthlyCost = avgAmount * (30 / frequencyDays);

      subscriptions.push({
        merchantName: group.display,
        avgAmount: roundTo(avgAmount, 2),
        frequencyDays,
        lastPaymentDate: lastPayment.dateIso,
        monthlyCost: roundTo(monthlyCost, 2),
        occurrences: sorted.length,
        isPotentiallyUnnecessary: daysSinceLast > frequencyDays * 1.5
      });
    }
  }

  return subscriptions.sort((a, b) => b.monthlyCost - a.monthlyCost);
}
