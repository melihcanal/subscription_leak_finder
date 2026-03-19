import type {
  ApiError,
  DetectedSubscription,
  SubscriptionSummary,
  UploadResponse
} from "@slf/shared";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8787";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const text = await response.text();
  const data = text ? (JSON.parse(text) as T | ApiError) : ({} as T);

  if (!response.ok) {
    const error = data as ApiError;
    throw new Error(error?.details || error?.error || "Request failed");
  }

  return data as T;
}

export async function uploadCsv(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch<UploadResponse>("/upload", {
    method: "POST",
    body: formData
  });
}

export async function fetchSubscriptions(): Promise<DetectedSubscription[]> {
  const data = await apiFetch<{ subscriptions: DetectedSubscription[] }>("/subscriptions");
  return data.subscriptions;
}

export async function fetchSummary(): Promise<SubscriptionSummary> {
  return apiFetch<SubscriptionSummary>("/summary");
}
