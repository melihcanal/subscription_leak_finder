import { desc, eq, sql } from "drizzle-orm";
import { subscriptions } from "../../../../packages/db/src/schema";
import type { DetectedSubscription, SubscriptionSummary } from "@slf/shared";
import type { DbClient } from "../lib/db";

export type SubscriptionRecord = typeof subscriptions.$inferSelect;

export class SubscriptionRepository {
  constructor(private readonly db: DbClient) {}

  async insertMany(uploadId: string, items: DetectedSubscription[]): Promise<void> {
    if (items.length === 0) {
      return;
    }

    const createdAt = new Date().toISOString();
    const payload = items.map((item) => ({
      id: crypto.randomUUID(),
      uploadId,
      merchantName: item.merchantName,
      avgAmount: item.avgAmount,
      frequencyDays: item.frequencyDays,
      lastPaymentDate: item.lastPaymentDate,
      monthlyCost: item.monthlyCost,
      occurrences: item.occurrences,
      isPotentiallyUnnecessary: item.isPotentiallyUnnecessary ? 1 : 0,
      createdAt
    }));

    await this.db.insert(subscriptions).values(payload).run();
  }

  async listByUpload(uploadId: string): Promise<DetectedSubscription[]> {
    const rows = await this.db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.uploadId, uploadId))
      .orderBy(desc(subscriptions.monthlyCost))
      .all();

    return rows.map((row) => ({
      merchantName: row.merchantName,
      avgAmount: row.avgAmount,
      frequencyDays: row.frequencyDays,
      lastPaymentDate: row.lastPaymentDate,
      monthlyCost: row.monthlyCost,
      occurrences: row.occurrences,
      isPotentiallyUnnecessary: row.isPotentiallyUnnecessary === 1
    }));
  }

  async summaryByUpload(uploadId: string): Promise<SubscriptionSummary> {
    const rows = await this.db
      .select({
        totalMonthlyCost: sql<number>`COALESCE(SUM(${subscriptions.monthlyCost}), 0)`,
        subscriptionCount: sql<number>`COUNT(${subscriptions.id})`
      })
      .from(subscriptions)
      .where(eq(subscriptions.uploadId, uploadId))
      .all();

    const row = rows[0];
    return {
      totalMonthlyCost: Number(row?.totalMonthlyCost ?? 0),
      subscriptionCount: Number(row?.subscriptionCount ?? 0)
    };
  }
}
