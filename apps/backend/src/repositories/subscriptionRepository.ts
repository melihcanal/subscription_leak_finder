import {and, desc, eq, sql} from "drizzle-orm";
import type {DetectedSubscription, SubscriptionSummary} from "@slf/shared";
import {subscriptions} from "@slf/db";
import type {DbClient} from "../lib/db";

export class SubscriptionRepository {
    constructor(private readonly db: DbClient) {
    }

    async insertMany(uploadId: string, userId: string, items: DetectedSubscription[]): Promise<void> {
        if (items.length === 0) {
            return;
        }

        for (const item of items) {
            await this.db.insert(subscriptions).values({
                id: crypto.randomUUID(),
                uploadId,
                userId,
                merchantName: item.merchantName,
                avgAmount: item.avgAmount,
                frequencyDays: item.frequencyDays,
                lastPaymentDate: item.lastPaymentDate,
                monthlyCost: item.monthlyCost,
                occurrences: item.occurrences,
                isPotentiallyUnnecessary: item.isPotentiallyUnnecessary ? 1 : 0,
                createdAt: new Date().toISOString()
            }).run();
        }
    }

    async listByUpload(uploadId: string, userId: string): Promise<DetectedSubscription[]> {
        const rows = await this.db
            .select()
            .from(subscriptions)
            .where(and(eq(subscriptions.uploadId, uploadId), eq(subscriptions.userId, userId)))
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

    async summaryByUpload(uploadId: string, userId: string): Promise<SubscriptionSummary> {
        const rows = await this.db
            .select({
                totalMonthlyCost: sql<number>`SUM(
                ${subscriptions.monthlyCost}
                )`,
                subscriptionCount: sql<number>`COUNT(*)`
            })
            .from(subscriptions)
            .where(and(eq(subscriptions.uploadId, uploadId), eq(subscriptions.userId, userId)))
            .all();

        const summary = rows[0];
        return {
            totalMonthlyCost: Number(summary?.totalMonthlyCost ?? 0),
            subscriptionCount: Number(summary?.subscriptionCount ?? 0)
        };
    }
}
