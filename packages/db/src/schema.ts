import {integer, real, sqliteTable, text} from "drizzle-orm/sqlite-core";

export const uploads = sqliteTable("uploads", {
  id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
  fileKey: text("file_key").notNull(),
  originalName: text("original_name").notNull(),
  createdAt: text("created_at").notNull()
});

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  uploadId: text("upload_id").notNull(),
    userId: text("user_id").notNull(),
  date: text("date").notNull(),
  description: text("description").notNull(),
  merchant: text("merchant").notNull(),
  amount: real("amount").notNull(),
  createdAt: text("created_at").notNull()
});

export const subscriptions = sqliteTable("subscriptions", {
  id: text("id").primaryKey(),
  uploadId: text("upload_id").notNull(),
    userId: text("user_id").notNull(),
  merchantName: text("merchant_name").notNull(),
  avgAmount: real("avg_amount").notNull(),
  frequencyDays: integer("frequency_days").notNull(),
  lastPaymentDate: text("last_payment_date").notNull(),
  monthlyCost: real("monthly_cost").notNull(),
  occurrences: integer("occurrences").notNull(),
  isPotentiallyUnnecessary: integer("is_potentially_unnecessary").notNull(),
  createdAt: text("created_at").notNull()
});
