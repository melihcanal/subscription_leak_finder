import type {DetectedSubscription, SubscriptionSummary, UploadResponse} from "@slf/shared";
import {detectSubscriptions, normalizeTransaction, parseCsvTransactions} from "@slf/shared";
import type {UploadRepository} from "../repositories/uploadRepository";
import type {TransactionRepository} from "../repositories/transactionRepository";
import type {SubscriptionRepository} from "../repositories/subscriptionRepository";
import {UserInputError} from "../lib/errors";

export class SubscriptionService {
    constructor(
        private readonly uploads: UploadRepository,
        private readonly transactions: TransactionRepository,
        private readonly subscriptions: SubscriptionRepository,
        private readonly storage: R2Bucket
    ) {
    }

    async processUpload(file: File, userId: string): Promise<UploadResponse> {
        let rawTransactions;
        let buffer: ArrayBuffer;

        try {
            buffer = await file.arrayBuffer();
            const csvText = new TextDecoder().decode(buffer);
            rawTransactions = parseCsvTransactions(csvText);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Invalid CSV format.";
            throw new UserInputError(message);
        }

        if (rawTransactions.length === 0) {
            throw new UserInputError("CSV contains no transactions.");
        }

        const normalized = rawTransactions.map(normalizeTransaction);
        const detected = detectSubscriptions(normalized);
        const uploadId = crypto.randomUUID();
        const fileKey = `uploads/${uploadId}.csv`;

        await this.storage.put(fileKey, buffer, {
            httpMetadata: {
                contentType: file.type || "text/csv"
            }
        });

        await this.uploads.create(fileKey, file.name, userId, uploadId);
        await this.transactions.insertMany(uploadId, userId, normalized);
        await this.subscriptions.insertMany(uploadId, userId, detected);

        return {
            uploadId,
            summary: this.buildSummary(detected)
        };
    }

    async getLatestSubscriptions(userId: string): Promise<{
        subscriptions: DetectedSubscription[];
        summary: SubscriptionSummary
    }> {
        const latest = await this.uploads.getLatestByUser(userId);
        if (!latest) {
            return {subscriptions: [], summary: {totalMonthlyCost: 0, subscriptionCount: 0}};
        }

        const [subscriptions, summary] = await Promise.all([
            this.subscriptions.listByUpload(latest.id, userId),
            this.subscriptions.summaryByUpload(latest.id, userId)
        ]);

        return {subscriptions, summary};
    }

    private buildSummary(items: DetectedSubscription[]): SubscriptionSummary {
        const totalMonthlyCost = items.reduce((sum, item) => sum + item.monthlyCost, 0);
        return {
            totalMonthlyCost: Number(totalMonthlyCost.toFixed(2)),
            subscriptionCount: items.length
        };
    }
}
