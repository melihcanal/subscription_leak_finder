import { transactions } from "../../../../packages/db/src/schema";
import type { NormalizedTransaction } from "@slf/shared";
import type { DbClient } from "../lib/db";

export class TransactionRepository {
  constructor(private readonly db: DbClient) {}

  async insertMany(uploadId: string, items: NormalizedTransaction[]): Promise<void> {
    if (items.length === 0) {
      return;
    }

    const createdAt = new Date().toISOString();
    const payload = items.map((item) => ({
      id: crypto.randomUUID(),
      uploadId,
      date: item.dateIso,
      description: item.description,
      merchant: item.merchant,
      amount: item.amount,
      createdAt
    }));

    await this.db.insert(transactions).values(payload).run();
  }
}
