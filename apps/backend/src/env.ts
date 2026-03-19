export type Env = {
    DB: D1Database;
    UPLOADS: R2Bucket;
    CORS_ORIGIN?: string;
    CLERK_SECRET_KEY?: string;
};
