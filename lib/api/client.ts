"use client";

import { getAuthToken } from "@/features/auth/services/auth-session";

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
  const token = getAuthToken();
  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {})
    },
    credentials: "include",
    cache: "no-store"
  });

  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? ((await response.json()) as T | ApiErrorPayload) : null;

  if (!response.ok) {
    const textFallback = !isJson ? await response.text() : "";
    const message =
      buildErrorMessage((payload as ApiErrorPayload | null) ?? null, response.status) ||
      textFallback ||
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return payload as T;
}
