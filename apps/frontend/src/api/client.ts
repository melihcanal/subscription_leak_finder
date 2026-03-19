import ky, {HTTPError} from "ky";
import type {ApiError, DetectedSubscription, SubscriptionSummary, UploadResponse} from "@slf/shared";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8787";

const api = ky.create({
    prefixUrl: API_BASE_URL
});

function authHeaders(token?: string): Record<string, string> | undefined {
    if (!token) {
        return undefined;
    }
    return {Authorization: `Bearer ${token}`};
}

async function wrapKy<T>(promise: Promise<T>): Promise<T> {
    try {
        return await promise;
    } catch (error) {
        if (error instanceof HTTPError) {
            const data = (await error.response.json().catch(() => null)) as ApiError | null;
            const message = data?.details || data?.error || error.message;
            throw new Error(message);
        }
        throw error;
    }
}

export async function uploadCsv(file: File, token: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);
    return wrapKy(api.post("upload", {body: formData, headers: authHeaders(token)}).json<UploadResponse>());
}

export async function fetchSubscriptions(token: string): Promise<DetectedSubscription[]> {
    const data = await wrapKy(api.get("subscriptions", {headers: authHeaders(token)}).json<{
        subscriptions: DetectedSubscription[]
    }>());
    return data.subscriptions;
}

export async function fetchSummary(token: string): Promise<SubscriptionSummary> {
    return wrapKy(api.get("summary", {headers: authHeaders(token)}).json<SubscriptionSummary>());
}
