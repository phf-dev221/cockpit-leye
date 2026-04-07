"use client";

import { requestJson } from "@/lib/api/client";
import { getActiveWorkspaceId } from "@/features/auth/services/auth-session";

function getWorkspaceId() {
  return getActiveWorkspaceId();
}

export interface GoogleCalendarStatus {
  status: string;
  availability: string;
  message?: string | null;
  connection_id?: number | null;
  calendar_label?: string | null;
  last_synced_at?: string | null;
  authorization_url?: string | null;
  recent_events?: Array<{
    external_event_id?: string | null;
    title: string;
    starts_at?: string | null;
    ends_at?: string | null;
    status?: string | null;
  }>;
}

export const googleCalendarApi = {
  getStatus() {
    const workspaceId = getWorkspaceId();
    const query = workspaceId ? `?workspace_id=${encodeURIComponent(workspaceId)}` : "";
    return requestJson<GoogleCalendarStatus>(`/api/integrations/google-calendar/status${query}`);
  },

  connect(payload: { code?: string; workspace_id?: string | null }) {
    return requestJson<{
      status: string;
      authorization_url?: string;
      connection_id?: number;
      calendar_label?: string;
    }>("/api/integrations/google-calendar/connect", {
      method: "POST",
      body: JSON.stringify({
        workspace_id: payload.workspace_id ?? getWorkspaceId(),
        code: payload.code
      })
    });
  },

  sync(connectionId: number) {
    return requestJson<{ sync_event_id: number; status: string }>("/api/integrations/google-calendar/sync", {
      method: "POST",
      body: JSON.stringify({
        connection_id: connectionId
      })
    });
  }
};
