CREATE TABLE IF NOT EXISTS uploads (
  id TEXT PRIMARY KEY NOT NULL,
  user_id
  TEXT
  NOT
  NULL,
  file_key TEXT NOT NULL,
  original_name TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY NOT NULL,
  upload_id TEXT NOT NULL,
  user_id
  TEXT
  NOT
  NULL,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  merchant TEXT NOT NULL,
  amount REAL NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY NOT NULL,
  upload_id TEXT NOT NULL,
  user_id
  TEXT
  NOT
  NULL,
  merchant_name TEXT NOT NULL,
  avg_amount REAL NOT NULL,
  frequency_days INTEGER NOT NULL,
  last_payment_date TEXT NOT NULL,
  monthly_cost REAL NOT NULL,
  occurrences INTEGER NOT NULL,
  is_potentially_unnecessary INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS uploads_user_idx ON uploads (user_id);
CREATE INDEX IF NOT EXISTS transactions_user_idx ON transactions (user_id);
CREATE INDEX IF NOT EXISTS subscriptions_user_idx ON subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_upload ON transactions (upload_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_upload ON subscriptions (upload_id);
