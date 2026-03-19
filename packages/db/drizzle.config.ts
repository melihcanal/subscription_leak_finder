import type { Config } from "drizzle-kit";

export default {
  schema: "./src/schema.ts",
  out: "./migrations",
  driver: "d1",
  dbCredentials: {
    wranglerConfigPath: "../../apps/backend/wrangler.toml",
    dbName: "subscription_leak_finder"
  }
} satisfies Config;
