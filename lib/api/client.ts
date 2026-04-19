"use client";

import { apiCache } from "@/lib/api/cache";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

interface ApiErrorPayload {
  message?: string;
  errors?: Record<string, string[]>;
}

function buildApiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

function buildErrorMessage(payload: ApiErrorPayload | null, fallbackStatus: number) {
  if (!payload) {
    return `Request failed with status ${fallbackStatus}`;
  }

  const fieldMessage = Object.values(payload.errors ?? {})
    .flat()
    .find(Boolean);

  return fieldMessage ?? payload.message ?? `Request failed with status ${fallbackStatus}`;
}

export async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = buildApiUrl(path);
  const isPost = init?.method === "POST" || init?.method === "PUT" || init?.method === "PATCH" || init?.method === "DELETE";
  const useCache = !isPost;

  if (useCache) {
    const cached = apiCache.get<T>(path);
    if (cached) {
      return cached;
    }
  }

  let response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...(init?.headers ?? {})
      },
      credentials: "include",
      mode: "cors"
    });
  } catch (error: any) {
    console.error("Network error fetching:", url, error);
    if (error.message?.includes("Failed to fetch") || error.message?.includes("NetworkError")) {
      throw new Error("Unable to connect to server. Please check if the backend is running.");
    }
    throw error;
  }

  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? ((await response.json()) as T | ApiErrorPayload) : null;

  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        const { clearAuthSession } = await import("@/features/auth/services/auth-session");
        clearAuthSession();
        window.location.href = "/login";
      }
      throw new Error("Unauthenticated.");
    }

    const textFallback = !isJson ? await response.text() : "";
    const message =
      buildErrorMessage((payload as ApiErrorPayload | null) ?? null, response.status) ||
      textFallback ||
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  if (useCache && payload) {
    apiCache.set(path, payload);
  }

  if (isPost) {
    apiCache.clear();
  }

  return payload as T;
}

export function invalidateCache(pattern?: string): void {
  if (pattern) {
    apiCache.invalidatePattern(pattern);
  } else {
    apiCache.clear();
  }
}
