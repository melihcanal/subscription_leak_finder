import {transactions} from "@slf/db";
import type {DbClient} from "../lib/db";
import type {NormalizedTransaction} from "@slf/shared";

export class TransactionRepository {
    constructor(private readonly db: DbClient) {
    }

    async insertMany(uploadId: string, userId: string, items: NormalizedTransaction[]): Promise<void> {
        if (items.length === 0) {
            return;
        }

        for (const item of items) {
            await this.db.insert(transactions).values({
                id: crypto.randomUUID(),
                uploadId,
                userId,
                date: item.dateIso,
                description: item.description,
                merchant: item.merchant,
                amount: item.amount,
                createdAt: new Date().toISOString()
            }).run();
        }
    }
}
