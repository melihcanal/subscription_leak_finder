import { z } from "zod";
import { createDb } from "./lib/db";
import { errorResponse, json, optionsResponse } from "./lib/http";
import { SubscriptionService } from "./services/subscriptionService";
import { SubscriptionRepository } from "./repositories/subscriptionRepository";
import { TransactionRepository } from "./repositories/transactionRepository";
import { UploadRepository } from "./repositories/uploadRepository";
import { UserInputError } from "./lib/errors";

export interface Env {
  DB: D1Database;
  UPLOADS: R2Bucket;
  CORS_ORIGIN?: string;
}

const uploadSchema = z.object({
  file: z.instanceof(File)
});

function getOrigin(env: Env): string | undefined {
  return env.CORS_ORIGIN && env.CORS_ORIGIN !== "" ? env.CORS_ORIGIN : undefined;
}

function createService(env: Env): SubscriptionService {
  const db = createDb(env.DB);
  return new SubscriptionService(
    new UploadRepository(db),
    new TransactionRepository(db),
    new SubscriptionRepository(db),
    env.UPLOADS
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = getOrigin(env);

    if (request.method === "OPTIONS") {
      return optionsResponse(origin);
    }

    if (url.pathname === "/upload" && request.method === "POST") {
      const contentType = request.headers.get("content-type") ?? "";
      if (!contentType.includes("multipart/form-data")) {
        return errorResponse("Expected multipart/form-data.", 415, undefined, origin);
      }

      try {
        const formData = await request.formData();
        const result = uploadSchema.safeParse({ file: formData.get("file") });
        if (!result.success) {
          return errorResponse("CSV file is required.", 400, result.error.message, origin);
        }

        const file = result.data.file;
        if (!file.name.toLowerCase().endsWith(".csv")) {
          return errorResponse("Only .csv files are supported.", 400, undefined, origin);
        }

        const service = createService(env);
        const response = await service.processUpload(file);
        return json(response, 201, origin);
      } catch (error) {
        if (error instanceof UserInputError) {
          return errorResponse("Invalid CSV.", 400, error.message, origin);
        }
        const message = error instanceof Error ? error.message : "Failed to process upload.";
        return errorResponse("Upload failed.", 500, message, origin);
      }
    }

    if (url.pathname === "/subscriptions" && request.method === "GET") {
      try {
        const service = createService(env);
        const { subscriptions } = await service.getLatestSubscriptions();
        return json({ subscriptions }, 200, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load subscriptions.";
        return errorResponse("Unable to load subscriptions.", 500, message, origin);
      }
    }

    if (url.pathname === "/summary" && request.method === "GET") {
      try {
        const service = createService(env);
        const { summary } = await service.getLatestSubscriptions();
        return json(summary, 200, origin);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load summary.";
        return errorResponse("Unable to load summary.", 500, message, origin);
      }
    }

    return errorResponse("Not found", 404, undefined, origin);
  }
};
