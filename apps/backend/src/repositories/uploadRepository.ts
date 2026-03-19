import { desc } from "drizzle-orm";
import { uploads } from "../../../../packages/db/src/schema";
import type { DbClient } from "../lib/db";

export type UploadRecord = typeof uploads.$inferSelect;

export class UploadRepository {
  constructor(private readonly db: DbClient) {}

  async create(fileKey: string, originalName: string, id: string = crypto.randomUUID()): Promise<UploadRecord> {
    const record: UploadRecord = {
      id,
      fileKey,
      originalName,
      createdAt: new Date().toISOString()
    };

    await this.db.insert(uploads).values(record).run();
    return record;
  }

  async getLatest(): Promise<UploadRecord | null> {
    const result = await this.db
      .select()
      .from(uploads)
      .orderBy(desc(uploads.createdAt))
      .limit(1)
      .all();

    return result[0] ?? null;
  }
}
