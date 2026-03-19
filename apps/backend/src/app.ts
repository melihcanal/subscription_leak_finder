import {Hono} from "hono";
import {cors} from "hono/cors";
import {clerkMiddleware, getAuth} from "@hono/clerk-auth";
import {z} from "zod";
import type {Env} from "./env";
import {createSubscriptionService} from "./services/factory";
import {UserInputError} from "./lib/errors";

const uploadSchema = z.object({
    file: z.instanceof(File)
});

type AppBindings = {
    Bindings: Env;
    Variables: {
        userId: string;
    };
};

const app = new Hono<AppBindings>();
const protectedRoutes = ["/upload", "/subscriptions", "/summary"];

app.use("*", (c, next) => {
    const origin = c.env.CORS_ORIGIN && c.env.CORS_ORIGIN !== "" ? c.env.CORS_ORIGIN : undefined;
    return cors({
        origin: origin ?? "*",
        credentials: Boolean(origin)
    })(c, next);
});

protectedRoutes.forEach((route) => {
    app.use(route, async (c, next) => {
        if (!c.env.CLERK_SECRET_KEY || !c.env.CLERK_PUBLISHABLE_KEY) {
            return c.json(
                {
                    error: "Auth misconfigured.",
                    details: "Missing CLERK_SECRET_KEY or CLERK_PUBLISHABLE_KEY."
                },
                500
            );
        }
        const middleware = clerkMiddleware({
            secretKey: c.env.CLERK_SECRET_KEY,
            publishableKey: c.env.CLERK_PUBLISHABLE_KEY
        });
        return await middleware(c, next);
    });

    app.use(route, async (c, next) => {
        const auth = getAuth(c);
        if (!auth?.userId) {
            return c.json({error: "Unauthorized", details: "Authentication required."}, 401);
        }
        c.set("userId", auth.userId);
        await next();
    });
});

app.post("/upload", async (c) => {
    const contentType = c.req.header("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
        return c.json({error: "Expected multipart/form-data."}, 415);
    }

    try {
        const formData = await c.req.raw.formData();
        const result = uploadSchema.safeParse({file: formData.get("file")});
        if (!result.success) {
            return c.json({error: "CSV file is required.", details: result.error.message}, 400);
        }

        const file = result.data.file;
        if (!file.name.toLowerCase().endsWith(".csv")) {
            return c.json({error: "Only .csv files are supported."}, 400);
        }

        const service = createSubscriptionService(c.env);
        const response = await service.processUpload(file, c.get("userId"));
        return c.json(response, 201);
    } catch (error) {
        if (error instanceof UserInputError) {
            return c.json({error: "Invalid CSV.", details: error.message}, 400);
        }
        const message = error instanceof Error ? error.message : "Failed to process upload.";
        return c.json({error: "Upload failed.", details: message}, 500);
    }
});

app.get("/subscriptions", async (c) => {
    try {
        const service = createSubscriptionService(c.env);
        const {subscriptions} = await service.getLatestSubscriptions(c.get("userId"));
        return c.json({subscriptions}, 200);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load subscriptions.";
        return c.json({error: "Unable to load subscriptions.", details: message}, 500);
    }
});

app.get("/summary", async (c) => {
    try {
        const service = createSubscriptionService(c.env);
        const {summary} = await service.getLatestSubscriptions(c.get("userId"));
        return c.json(summary, 200);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load summary.";
        return c.json({error: "Unable to load summary.", details: message}, 500);
    }
});

app.get("/health", (c) => c.json({ok: true}));

export default app;
