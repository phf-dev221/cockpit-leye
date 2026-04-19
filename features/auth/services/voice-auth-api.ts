"use client";

import { requestJson } from "@/lib/api/client";
import { setAuthSession, type AuthSession } from "@/features/auth/services/auth-session";

export interface VoiceAuthResponse extends AuthSession {}

export interface VoiceEnrollmentStatus {
  enrolled: boolean;
  passphrase_hash?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export const voiceAuthApi = {
  async login(audioBlob: Blob) {
    const formData = new FormData();
    formData.append("audio", audioBlob, "voice.wav");

    const response = await fetch(`${API_BASE_URL}/api/auth/voice/login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.message || "Voice authentication failed");
    }

    const data = await response.json() as VoiceAuthResponse;
    if (data.token) {
      setAuthSession(data);
    }
    return data;
  },

  async enroll(audioBlob: Blob, passphrase: string) {
    const formData = new FormData();
    formData.append("audio", audioBlob, "voice.wav");
    formData.append("passphrase", passphrase);

    const response = await fetch(`${API_BASE_URL}/api/voice/enroll`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.message || "Voice enrollment failed");
    }

    return response.json();
  },

  async getStatus() {
    return requestJson<VoiceEnrollmentStatus>("/api/voice/status");
  },

  async deleteEnrollment() {
    return requestJson<void>("/api/voice/enroll", { method: "DELETE" });
  },
};
